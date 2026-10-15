import { getContext, setContext } from 'svelte';
import type { Dictionary } from './tokenize';

const REFS_KEY = Symbol('refs');
const EXCLUDE_KEY = Symbol('refs-exclude');

const EMPTY: Dictionary = { projects: new Map(), tech: new Set() };

export const setRefsContext = (value: { dict: Dictionary }) => setContext(REFS_KEY, value);

export const getRefsContext = (): { dict: Dictionary } => getContext(REFS_KEY) ?? { dict: EMPTY };

// A getter, not a value: the project page is reused when navigating between projects,
// so the names to skip must be read at render time.
export const setRefExclude = (names: () => string[]) => setContext(EXCLUDE_KEY, names);

export const getRefExclude = (): (() => string[]) => getContext(EXCLUDE_KEY) ?? (() => []);
