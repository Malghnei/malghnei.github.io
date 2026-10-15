import { getTagCategory } from '$lib/tags/categories';
import type { ProjectDomain, ProjectFrontmatter, ProjectRole } from '$lib/types';

export const PROJECT_ROLES: readonly ProjectRole[] = ['solo', 'contribution'];
export const PROJECT_DOMAINS: readonly ProjectDomain[] = ['software', 'hardware'];

type ProjectMetadata = Omit<ProjectFrontmatter, 'slug'>;

// Throws (failing the prerender build) instead of letting a typo silently hide a project from filters.
export const validateProjectMetadata = (
	slug: string,
	metadata: Record<string, unknown>
): ProjectMetadata => {
	const file = `${slug}.md`;

	const requireOneOf = (key: 'role' | 'domain', allowed: readonly string[]) => {
		const value = metadata[key];
		if (value === undefined) {
			throw new Error(`${file}: missing ${key}`);
		}
		if (typeof value !== 'string' || !allowed.includes(value)) {
			throw new Error(`${file}: invalid ${key} "${String(value)}"`);
		}
	};

	requireOneOf('role', PROJECT_ROLES);
	requireOneOf('domain', PROJECT_DOMAINS);

	for (const tag of (metadata.techStack as string[] | undefined) ?? []) {
		if (!getTagCategory(tag)) {
			throw new Error(`${file}: unknown tag "${tag}" (add it to src/lib/tags/categories.ts)`);
		}
	}

	const preview = metadata.preview;
	if (preview !== undefined && (typeof preview !== 'string' || !preview.startsWith('/'))) {
		throw new Error(`${file}: invalid preview "${String(preview)}"`);
	}

	return metadata as ProjectMetadata;
};
