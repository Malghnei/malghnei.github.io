// Tabs expand to the next multiple-of-8 column so pasted art measures and renders as it looked.
const expandTabs = (row: string): string => {
	let out = '';
	for (const ch of row) out += ch === '\t' ? ' '.repeat(8 - (out.length % 8)) : ch;
	return out;
};

export type BannerVariant = { rows: string[]; width: number };

// Width in characters, counting the cursor block that follows the last row.
export const parseBanner = (raw: string): BannerVariant => {
	const rows = raw.split(/\r?\n/).map((row) => expandTabs(row).trimEnd());
	while (rows.length > 0 && rows[rows.length - 1] === '') rows.pop();
	if (rows.length === 0) return { rows, width: 0 };
	const width = Math.max(...rows.map((row) => row.length), rows[rows.length - 1].length + 1);
	return { rows, width };
};

// Widths are widest first: [full, mobile?]. Each variant shows from its own width up to the
// previous one's; the plain heading takes everything narrower. `ch` in a container condition
// resolves against the container's font, which is the buffer font the rows render in.
export const variantCss = (widths: number[]): string => {
	const rules = ['.banner-h1 .banner, .banner-h1 .banner-fallback { display: none; }'];
	if (widths.length === 0) {
		rules.push('.banner-h1 .banner-fallback { display: block; }');
		return rules.join('\n');
	}
	widths.forEach((w, i) => {
		const range = i === 0 ? `width >= ${w}ch` : `${w}ch <= width < ${widths[i - 1]}ch`;
		rules.push(`@container buffer (${range}) { .banner-h1 .v${i} { display: block; } }`);
	});
	rules.push(
		`@container buffer (width < ${Math.min(...widths)}ch) { .banner-h1 .banner-fallback { display: block; } }`
	);
	return rules.join('\n');
};
