export type TerminalStatus = 'closed' | 'open' | 'minimized';

export const editor = $state({
	cursorLine: 1,
	helpOpen: false,
	terminal: { status: 'closed' as TerminalStatus, maximized: false }
});

export const currentMode = () => (editor.terminal.status === 'open' ? 'TERMINAL' : 'NORMAL');

// Element that had focus when the terminal opened, so closing can hand focus back.
let opener: HTMLElement | null = null;

const restoreFocus = () => {
	opener?.focus();
	opener = null;
};

export const openTerminal = () => {
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
