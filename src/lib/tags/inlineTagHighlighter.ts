import { getTagHighlightStyle } from './tagStyles';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isInsideSkipNode = (node: Node | null) => {
	if (!node || !(node as HTMLElement).closest) return false;
	const el = node as HTMLElement;
	return Boolean(el.closest('code, pre, script, style, textarea, [data-tag-highlighted="true"]'));
};

export const highlightTechStackInElement = (root: HTMLElement, techStackTags: string[]) => {
	if (!techStackTags.length) return;
	if (root.dataset.tagHighlighterApplied === 'true') return;
	root.dataset.tagHighlighterApplied = 'true';

	const tags = Array.from(new Set(techStackTags)).filter(Boolean);
	if (!tags.length) return;

	// Sort by length descending to reduce overlap surprises when tags share substrings.
	tags.sort((a, b) => b.length - a.length);

	const pattern = tags.map(escapeRegExp).join('|');
	if (!pattern) return;

	const re = new RegExp(pattern, 'g'); // exact substring, case-sensitive

	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const textNodes: Text[] = [];
	while (walker.nextNode()) {
		textNodes.push(walker.currentNode as Text);
	}

	for (const textNode of textNodes) {
		const parent = textNode.parentElement;
		if (!parent) continue;
		if (isInsideSkipNode(parent)) continue;

		const text = textNode.nodeValue ?? '';
		if (!text.trim()) continue;

		re.lastIndex = 0;
		if (!re.test(text)) continue;
		re.lastIndex = 0;

		const fragment = document.createDocumentFragment();
		let lastIndex = 0;
		let match: RegExpExecArray | null = null;

		while ((match = re.exec(text)) !== null) {
			const matchedText = match[0];
			const start = match.index;
			const end = start + matchedText.length;

			if (start > lastIndex) {
				fragment.appendChild(document.createTextNode(text.slice(lastIndex, start)));
			}

			const style = getTagHighlightStyle(matchedText);
			const span = document.createElement('span');
			span.dataset.tagHighlighted = 'true';
			span.textContent = matchedText;
			span.style.color = style.color;
			span.style.backgroundColor = style.backgroundColor;
			span.style.borderRadius = '0.2em';
			span.style.padding = '0 0.12em';
			span.style.borderBottom = `1px solid ${style.borderColor}`;

			fragment.appendChild(span);

			lastIndex = end;
		}

		if (lastIndex < text.length) {
			fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
		}

		textNode.replaceWith(fragment);
	}
};

