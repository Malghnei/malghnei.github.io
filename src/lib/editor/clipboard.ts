type Writer = { writeText(text: string): Promise<void> };

// Never throws: navigator.clipboard is missing outside secure contexts (a plain-http LAN dev
// server), and the browser can refuse the write.
export const copyText = async (
	text: string,
	clipboard: Writer | null = globalThis.navigator?.clipboard ?? null
): Promise<boolean> => {
	if (!clipboard) return false;
	try {
		await clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
};
