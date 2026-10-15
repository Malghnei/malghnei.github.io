import { describe, expect, it } from 'vitest';
import rehypeProse from './rehypeProse.js';

type Node = { type: string; value?: string; tagName?: string; children?: Node[] };

const text = (value: string): Node => ({ type: 'text', value });
const el = (tagName: string, ...children: Node[]): Node => ({
	type: 'element',
	tagName,
	properties: {},
	children
} as Node);
const raw = (value: string): Node => ({ type: 'raw', value });
const root = (...children: Node[]): Node => ({ type: 'root', children });

const IMPORT = "import Prose from '$lib/components/refs/Prose.svelte';";
const prose = (value: string) => raw(`<Prose text={${JSON.stringify(value)}} />`);

const run = (tree: Node) => {
	rehypeProse()(tree);
	return tree;
};

describe('rehypeProse', () => {
	it('leaves text containing a Svelte expression untouched', () => {
		const tree = run(root(el('p', text('Count: {n}'))));
		expect(tree.children).toEqual([el('p', text('Count: {n}'))]);
	});

	it('replaces text in p and li, and adds an instance script with the import', () => {
		const tree = run(root(el('p', text('Built in Java.')), el('ul', el('li', text('Java fundamentals')))));
		expect(tree.children).toEqual([
			raw(`<script>\n\t${IMPORT}\n</script>`),
			el('p', prose('Built in Java.')),
			el('ul', el('li', prose('Java fundamentals')))
		]);
	});

	it('reaches text nested in inline elements inside a paragraph', () => {
		const tree = run(root(el('p', el('strong', text('Kata')))));
		expect(tree.children?.[1]).toEqual(el('p', el('strong', prose('Kata'))));
	});

	it('leaves text inside a, code, pre and headings alone', () => {
		const untouched = [
			el('p', el('a', text('Kata'))),
			el('p', el('code', text('Java'))),
			el('pre', el('code', text('Java'))),
			el('li', el('pre', text('Java'))),
			...['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((h) => el(h, text('Java')))
		];
		const tree = run(root(...structuredClone(untouched)));
		expect(tree.children).toEqual(untouched);
	});

	it('leaves text outside p and li alone', () => {
		const tree = run(root(text('Java'), el('div', text('Java')), el('blockquote', text('Java'))));
		expect(tree.children).toEqual([text('Java'), el('div', text('Java')), el('blockquote', text('Java'))]);
	});

	it('skips whitespace-only text', () => {
		const tree = run(root(el('ul', text('\n'), el('li', text('Java')), text('\n')), el('p', text(' '))));
		expect(tree.children?.[1]).toEqual(el('ul', text('\n'), el('li', prose('Java')), text('\n')));
		expect(tree.children?.[2]).toEqual(el('p', text(' ')));
	});

	it('passes quotes and angle brackets through as a JS string literal', () => {
		const tree = run(root(el('p', text('a "quote" <angle>'))));
		expect(tree.children?.[1]).toEqual(
			el('p', raw('<Prose text={"a \\"quote\\" <angle>"} />'))
		);
	});

	it('joins adjacent text nodes first, so a name split by the parser still matches', () => {
		const tree = run(root(el('p', text('Built with Spring'), text(' Boot'), el('em', text('!')))));
		expect(tree.children?.[1]).toEqual(el('p', prose('Built with Spring Boot'), el('em', prose('!'))));
	});

	it("undoes mdsvex's &lt; and &gt; escaping, which would otherwise show literally", () => {
		const tree = run(root(el('p', text('a '), text('&lt;'), text('angle'), text('&gt;'))));
		expect(tree.children?.[1]).toEqual(el('p', prose('a <angle>')));
	});

	it('adds the import to an existing instance script instead of a new one', () => {
		const tree = run(
			root(
				raw('<script module lang="ts">\n\texport const metadata = {};\n</script>'),
				raw('<script lang="ts">\n\tlet x = 1;\n</script>'),
				el('p', text('Java'))
			)
		);
		expect(tree.children?.slice(0, 2)).toEqual([
			raw('<script module lang="ts">\n\texport const metadata = {};\n</script>'),
			raw(`<script lang="ts">\n\t${IMPORT}\n\tlet x = 1;\n</script>`)
		]);
		expect(tree.children).toHaveLength(3);
	});

	it('treats a module script as not an instance script, and adds the new one after it', () => {
		const module = raw('<script module lang="ts">\n\texport const metadata = {};\n</script>');
		const tree = run(root(module, text('\n'), el('p', text('Java'))));
		expect(tree.children).toEqual([
			module,
			raw(`<script>\n\t${IMPORT}\n</script>`),
			text('\n'),
			el('p', prose('Java'))
		]);
	});

	it('adds no import when nothing was replaced', () => {
		const tree = run(root(el('h2', text('Overview'))));
		expect(tree.children).toEqual([el('h2', text('Overview'))]);
	});
});
