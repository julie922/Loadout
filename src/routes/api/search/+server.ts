import { fetchGames } from '$lib/rawg';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';
	if (!q.trim()) return json({ games: [] });

	try {
		const { games } = await fetchGames({ search: q, pageSize: 10 });
		return json({ games });
	} catch (err) {
		console.error('[search] RAWG fetch failed:', err);
		return json({ games: [] }, { status: 502 });
	}
};
