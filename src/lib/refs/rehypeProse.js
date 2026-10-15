// Plain JS (not TS) so svelte.config.js can import it.
// Runs inside mdsvex: each prose text node becomes a <Prose> component, so project and tech
// names in write-ups are matched during prerender, with the same dictionary as everywhere else.
// Text containing `{` is left untouched: in mdsvex it holds live Svelte expressions, which a
// string literal would turn into plain text.

/**
 * The slice of HAST this plugin touches. mdsvex emits `raw` nodes verbatim into the Svelte source.
 * @typedef {{ type: string, value?: string, tagName?: string, children?: Node[] }} Node
 */

const IMPORT = "import Prose from '$lib/components/refs/Prose.svelte';";

const PROSE_PARENTS = new Set(['p', 'li']);
const SKIP = new Set(['a', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/** @param {Node} node */
const isScript = (node) => node.type === 'raw' && /^\s*<script\b/.test(node.value ?? '');
/** @param {Node} node */
const isModuleScript = (node) =>
	isScript(node) && /^\s*<script\b[^>]*\b(module|context=["']module["'])/.test(node.value ?? '');

// The parser splits text around entities and escapes; rejoin it so names aren't cut in two.
/** @param {Node[]} children */
const joinText = (children) =>
	children.reduce((/** @type {Node[]} */ out, child) => {
		const last = out.at(-1);
		if (child.type === 'text' && last?.type === 'text') {
			out[out.length - 1] = { ...last, value: (last.value ?? '') + child.value };
		} else {
			out.push(child);
		}
		return out;
	}, []);

// mdsvex's escape_brackets turns a lone < or > into an entity, expecting the text to be
// emitted as HTML. A JS string shows entities literally, so turn them back.
/** @param {string} value */
const unescape = (value) => value.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/**
 * @param {Node} node
 * @param {boolean} inProse
 * @returns {boolean} whether any text was replaced
 */
const walk = (node, inProse) => {
	let replaced = false;
	if (inProse && node.children) node.children = joinText(node.children);
	node.children?.forEach((child, i, children) => {
		if (child.type === 'text') {
			if (inProse && child.value?.trim() && !child.value.includes('{')) {
				// JSON.stringify gives a valid JS literal for quotes, braces and angle brackets alike.
				const literal = JSON.stringify(unescape(child.value));
				children[i] = { type: 'raw', value: `<Prose text={${literal}} />` };
				replaced = true;
			}
		} else if (child.type === 'element') {
			const tag = child.tagName ?? '';
			if (!SKIP.has(tag) && walk(child, inProse || PROSE_PARENTS.has(tag))) replaced = true;
		}
	});
	return replaced;
};

/** @param {Node[]} children the root's */
const addImport = (children) => {
	const scripts = children.filter(isScript);
	const instance = scripts.find((node) => !isModuleScript(node));
	if (instance) {
		instance.value = (instance.value ?? '').replace(/^(\s*<script\b[^>]*>)/, `$1\n\t${IMPORT}`);
		return;
	}
	const at = scripts.length ? children.lastIndexOf(scripts[scripts.length - 1]) + 1 : 0;
	children.splice(at, 0, { type: 'raw', value: `<script>\n\t${IMPORT}\n</script>` });
};

const rehypeProse = () => (/** @type {Node} */ tree) => {
	if (walk(tree, false) && tree.children) addImport(tree.children);
};

export default rehypeProse;
