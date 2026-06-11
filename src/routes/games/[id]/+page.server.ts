import { fetchGame, fetchSimilarGames } from '$lib/rawg';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const [game, similar] = await Promise.all([
			fetchGame(params.id),
			fetchSimilarGames(params.id)
		]);
		return { game, similar };
	} catch {
		error(404, 'Game not found');
	}
};
