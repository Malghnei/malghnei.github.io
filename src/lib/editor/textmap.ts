// Maps a buffer line's on-screen text to DOM positions and back, so the cursor can sit on any
// visible glyph without the content being rewrapped.
export type Point = { segment: number; offset: number };
export type Folded = { text: string; points: Point[] };
export type LineMap = { nodes: Text[]; folded: Folded };

const COLLAPSIBLE = /[ \t\n\r\f]/;

// Joins text-node strings the way layout shows them: unless pre, whitespace runs fold to one
// space and the ends are trimmed. points[i] says which segment and offset visible char i is.
export const foldSegments = (segments: string[], pre: boolean): Folded => {
	let text = '';
	const points: Point[] = [];
	segments.forEach((segment, index) => {
		for (let offset = 0; offset < segment.length; offset++) {
			const char = segment[offset];
			if (!pre && COLLAPSIBLE.test(char)) {
				if (text === '' || text.endsWith(' ')) continue;
				text += ' ';
			} else {
				text += char;
			}
			points.push({ segment: index, offset });
		}
	});
	if (!pre && text.endsWith(' ')) {
		text = text.slice(0, -1);
		points.pop();
	}
	return { text, points };
};

const isAtOrBefore = (a: Point, b: Point) =>
	a.segment < b.segment || (a.segment === b.segment && a.offset <= b.offset);

// The last visible char at or before the raw point; 0 when the point precedes them all.
export const visibleOffset = (folded: Folded, point: Point): number => {
	let index = 0;
	folded.points.forEach((candidate, i) => {
		if (isAtOrBefore(candidate, point)) index = i;
	});
	return index;
};

const PRESERVED = ['pre', 'pre-wrap', 'break-spaces', 'preserve', 'preserve-spaces'];

const isPre = (line: HTMLElement) => {
	const style = getComputedStyle(line);
	return PRESERVED.includes(style.getPropertyValue('white-space-collapse') || style.whiteSpace);
};

// What's on screen, aria-hidden or not: the banner rows are aria-hidden themselves, and link
// brackets like `[` `](↗)` are glyphs the cursor should land on. Skipped: screen-reader-only
// text, hidden text, and whitespace between flex or grid items, which never renders.
const textNodesOf = (line: HTMLElement): Text[] => {
	const nodes: Text[] = [];
	const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
		const parent = node.parentElement;
		if (!parent || parent.closest('.sr-only')) continue;
		if (typeof parent.checkVisibility === 'function' && !parent.checkVisibility()) continue;
		if (!node.data.trim() && /flex|grid/.test(getComputedStyle(parent).display)) continue;
		nodes.push(node);
	}
	return nodes;
};

export const mapLine = (line: HTMLElement): LineMap => {
	const nodes = textNodesOf(line);
	return { nodes, folded: foldSegments(nodes.map((node) => node.data), isPre(line)) };
};

// Visible chars [from, to) as a DOM range.
export const rangeAt = (map: LineMap, from: number, to: number): Range | null => {
	const { points } = map.folded;
	if (from < 0 || to > points.length || from >= to) return null;
	const start = points[from];
	const end = points[to - 1];
	const range = document.createRange();
	range.setStart(map.nodes[start.segment], start.offset);
	range.setEnd(map.nodes[end.segment], end.offset + 1);
	return range;
};

const caretAt = (x: number, y: number): { node: Node; offset: number } | null => {
	// typeof, not `in`: `in` would narrow document to never in the fallback branch.
	if (typeof document.caretPositionFromPoint === 'function') {
		const caret = document.caretPositionFromPoint(x, y);
		return caret && { node: caret.offsetNode, offset: caret.offset };
	}
	const range = document.caretRangeFromPoint?.(x, y);
	return range ? { node: range.startContainer, offset: range.startOffset } : null;
};

// The visible column under the pointer, or null when it isn't over this line's text.
export const colAtPoint = (map: LineMap, x: number, y: number): number | null => {
	const caret = caretAt(x, y);
	const segment = caret ? map.nodes.indexOf(caret.node as Text) : -1;
	if (!caret || segment < 0) return null;
	const col = visibleOffset(map.folded, { segment, offset: caret.offset });
	// A caret lands between chars: on a char's right half it reports the next one.
	const left = col > 0 ? rangeAt(map, col - 1, col)?.getBoundingClientRect() : undefined;
	return left && x >= left.left && x < left.right ? col - 1 : col;
};
