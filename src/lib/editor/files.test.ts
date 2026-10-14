import { describe, expect, it } from 'vitest';
import { fileForPath, isTabActive, tabLabel, TABS } from './files';

const [home, about, projects] = TABS;

describe('fileForPath', () => {
	it.each([
		['/', '~/home.md'],
		['/about/', '~/about.md'],
		['/about', '~/about.md'],
		['/projects/', '~/projects/'],
		['/projects/condimental/', '~/projects/condimental.md'],
		['/projects/condimental', '~/projects/condimental.md'],
		['/nope/', '~/nope/']
	])('%s -> %s', (pathname, file) => {
		expect(fileForPath(pathname)).toBe(file);
	});
});

describe('tabs', () => {
	it('marks exactly one tab active', () => {
		expect(TABS.filter((tab) => isTabActive(tab.path, '/about')).map((tab) => tab.label)).toEqual(['about.md']);
		expect(TABS.filter((tab) => isTabActive(tab.path, '/')).map((tab) => tab.label)).toEqual(['home.md']);
		expect(TABS.filter((tab) => isTabActive(tab.path, '/projects/qiyami')).map((tab) => tab.label)).toEqual(['projects/']);
	});

	it('names the open project on the projects tab', () => {
		expect(tabLabel(projects, '/projects/qiyami/')).toBe('projects/qiyami.md');
		expect(tabLabel(projects, '/projects/')).toBe('projects/');
		expect(tabLabel(home, '/projects/qiyami/')).toBe('home.md');
		expect(tabLabel(about, '/about/')).toBe('about.md');
	});
});
