import { fetchGames } from '$lib/rawg';
import type { PageServerLoad } from './$types';

const GENRE_SLUG: Record<string, string> = {
	'Action':     'action',
	'RPG':        'role-playing-games-rpg',
	'Adventure':  'adventure',
	'Strategy':   'strategy',
	'Shooter':    'shooter',
	'Indie':      'indie',
	'Racing':     'racing',
	'Simulation': 'simulation',
	'Puzzle':     'puzzle',
	'Casual':     'casual',
};

export const load: PageServerLoad = async ({ url }) => {
	const genre = url.searchParams.get('genre') ?? '';
	const platform = url.searchParams.get('platform') ?? '';
	const sort = url.searchParams.get('sort') ?? '';
	const page = Number(url.searchParams.get('page') ?? '1');

	const ordering = sort === 'Rating' ? '-rating'
		: sort === 'Release date' ? '-released'
		: sort === 'A–Z' ? 'name'
		: '-added';

	const genreSlug = genre ? (GENRE_SLUG[genre] ?? genre.toLowerCase()) : undefined;

	try {
		const { games, count, next } = await fetchGames({
			genres: genreSlug,
			platforms: platform === 'PC' ? '4'
				: platform === 'PS5' ? '187'
				: platform === 'Xbox' ? '186'
				: platform === 'Switch' ? '7'
				: undefined,
			ordering,
			page,
			pageSize: 20
		});

		return { games, count, hasMore: !!next, error: false };
	} catch {
		return { games: [], count: 0, hasMore: false, error: true };
	}
};
