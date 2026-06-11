import { describe, it, expect } from 'vitest';
import { normalizePlatforms } from './rawg';
import type { RawgPlatformParent } from './types';

describe('normalizePlatforms', () => {
	it('should return an empty array if platforms is null or undefined', () => {
		expect(normalizePlatforms(null)).toEqual([]);
	});

	it('should map standard platform slugs to their friendly names', () => {
		const platforms: RawgPlatformParent[] = [
			{ platform: { id: 1, name: 'PC', slug: 'pc' } },
			{ platform: { id: 2, name: 'PlayStation 5', slug: 'playstation5' } },
			{ platform: { id: 3, name: 'Nintendo Switch', slug: 'nintendo-switch' } }
		];
		expect(normalizePlatforms(platforms)).toEqual(['PC', 'PS5', 'Switch']);
	});

	it('should fallback to platform name if slug is not mapped', () => {
		const platforms: RawgPlatformParent[] = [
			{ platform: { id: 4, name: 'iOS Device', slug: 'ios' } }
		];
		expect(normalizePlatforms(platforms)).toEqual(['iOS Device']);
	});

	it('should deduplicate platform names (e.g., xbox-series-x and xbox-one map both to Xbox)', () => {
		const platforms: RawgPlatformParent[] = [
			{ platform: { id: 5, name: 'Xbox Series X', slug: 'xbox-series-x' } },
			{ platform: { id: 6, name: 'Xbox One', slug: 'xbox-one' } }
		];
		expect(normalizePlatforms(platforms)).toEqual(['Xbox']);
	});
});
