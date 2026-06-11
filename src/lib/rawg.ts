import { RAWG_API_KEY } from '$env/static/private';
import type {
	GameCard,
	GameDetail,
	RawgFilters,
	RawgGame,
	RawgListResponse
} from './types';

const BASE = 'https://api.rawg.io/api';

const PLATFORM_MAP: Record<string, string> = {
	pc: 'PC',
	playstation5: 'PS5',
	playstation4: 'PS4',
	'xbox-series-x': 'Xbox',
	'xbox-one': 'Xbox',
	'nintendo-switch': 'Switch'
};

export function normalizePlatforms(platforms: RawgGame['platforms']): string[] {
	if (!platforms) return [];
	const seen = new Set<string>();
	const result: string[] = [];
	for (const p of platforms) {
		const label = PLATFORM_MAP[p.platform.slug] ?? p.platform.name;
		if (!seen.has(label)) {
			seen.add(label);
			result.push(label);
		}
	}
	return result;
}

function toGameCard(g: RawgGame): GameCard {
	return {
		id: g.id,
		slug: g.slug,
		name: g.name,
		released: g.released,
		cover: g.background_image,
		score: g.metacritic,
		rating: g.rating,
		genres: g.genres.map((x) => x.name),
		platforms: normalizePlatforms(g.platforms),
		developer: g.developers?.[0]?.name ?? 'Unknown',
		blurb: g.description_raw?.split('\n')[0]?.slice(0, 180) ?? ''
	};
}

function toGameDetail(g: RawgGame): GameDetail {
	return {
		...toGameCard(g),
		description: g.description_raw ?? '',
		screenshots: g.short_screenshots?.map((s) => s.image) ?? []
	};
}

async function rawgFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
	const url = new URL(`${BASE}${path}`);
	url.searchParams.set('key', RAWG_API_KEY);
	for (const [k, v] of Object.entries(params)) {
		if (v) url.searchParams.set(k, v);
	}
	console.log('[rawg] GET', url.toString().replace(RAWG_API_KEY, '<key>'));
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error(`RAWG ${res.status}: ${path}`);
	return res.json() as Promise<T>;
}

export async function fetchGames(filters: RawgFilters = {}): Promise<{
	games: GameCard[];
	count: number;
	next: string | null;
}> {
	const params: Record<string, string> = {
		page: String(filters.page ?? 1),
		page_size: String(filters.pageSize ?? 20)
	};
	if (filters.search) params.search = filters.search;
	if (filters.genres) params.genres = filters.genres;
	if (filters.platforms) params.platforms = filters.platforms;
	if (filters.ordering) params.ordering = filters.ordering;

	const data = await rawgFetch<RawgListResponse>('/games', params);

	return {
		games: data.results.map(toGameCard),
		count: data.count,
		next: data.next
	};
}

export async function fetchGame(slug: string): Promise<GameDetail> {
	const [detail, screenshotsData] = await Promise.all([
		rawgFetch<RawgGame>(`/games/${slug}`),
		rawgFetch<{ results: { image: string }[] }>(`/games/${slug}/screenshots`)
	]);

	const screenshots = screenshotsData.results.map((s) => s.image);
	return { ...toGameDetail(detail), screenshots };
}

export async function fetchSimilarGames(slug: string): Promise<GameCard[]> {
	// RAWG a un endpoint /game-series mais il est souvent vide.
	// Dans ce cas on se rabat sur les jeux du même genre triés par note.
	const data = await rawgFetch<RawgListResponse>(`/games/${slug}/game-series`);
	if (data.results.length > 0) return data.results.slice(0, 4).map(toGameCard);

	const game = await rawgFetch<RawgGame>(`/games/${slug}`);
	const genre = game.genres[0]?.slug ?? '';
	if (!genre) return [];

	const similar = await rawgFetch<RawgListResponse>('/games', {
		genres: genre,
		page_size: '5',
		ordering: '-rating'
	});
	return similar.results.filter((g) => g.slug !== slug).slice(0, 4).map(toGameCard);
}
