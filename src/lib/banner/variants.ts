// Tabs expand to the next multiple-of-8 column so pasted art measures and renders as it looked.
const expandTabs = (row: string): string => {
	let out = '';
	for (const ch of row) out += ch === '\t' ? ' '.repeat(8 - (out.length % 8)) : ch;
	return out;
};

export type BannerVariant = { rows: string[]; width: number };

// Width in characters: the longest row.
export const parseBanner = (raw: string): BannerVariant => {
	const rows = raw.split(/\r?\n/).map((row) => expandTabs(row).trimEnd());
	while (rows.length > 0 && rows[rows.length - 1] === '') rows.pop();
	if (rows.length === 0) return { rows, width: 0 };
	return { rows, width: Math.max(...rows.map((row) => row.length)) };
};
