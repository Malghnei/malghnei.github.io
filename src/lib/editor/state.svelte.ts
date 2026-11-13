import { siteContent } from '$lib/data/site';
import type { Pos, VisualMode } from '$lib/editor/motions';
import type { PreviewTarget } from '$lib/types';

export type TerminalStatus = 'closed' | 'open' | 'minimized';

export const editor = $state({
	cursorLine: 1,
	cursorCol: 1,
	visual: null as { mode: VisualMode; anchor: Pos } | null,
	// One-shot status bar text, e.g. "3 lines yanked"; cleared on the next key.
	message: null as string | null,
	helpOpen: false,
	preview: null as PreviewTarget | null,
	terminal: { status: 'closed' as TerminalStatus, maximized: false }
});

export const currentMode = () => {
	if (editor.terminal.status === 'open') return 'TERMINAL';
	if (editor.visual) return editor.visual.mode === 'line' ? 'VISUAL LINE' : 'VISUAL';
	return 'NORMAL';
};

// Element that had focus when the terminal opened, so closing can hand focus back.
let opener: HTMLElement | null = null;

const restoreFocus = () => {
	opener?.focus();
	opener = null;
};

export const openTerminal = () => {
	editor.visual = null;
	if (editor.terminal.status !== 'open' && typeof document !== 'undefined') {
		opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
	}
	editor.terminal.status = 'open';
};

export const closeTerminal = () => {
	editor.terminal.status = 'closed';
	restoreFocus();
};

export const minimizeTerminal = () => {
	editor.terminal.status = 'minimized';
	restoreFocus();
};

export const toggleTerminal = () =>
	editor.terminal.status === 'open' ? closeTerminal() : openTerminal();

export const toggleMaximize = () => {
	editor.terminal.maximized = !editor.terminal.maximized;
};

export type TerminalLine = { input?: string; output: string; isError?: boolean };

// Lives here rather than in the component so output and history survive minimize, close and navigation.
export const session = $state({
	lines: [
		{ output: `Welcome to ${siteContent.name}'s interactive terminal.` },
		{ output: 'Type "help" to see available commands.' }
	] as TerminalLine[],
	history: [] as string[]
});
