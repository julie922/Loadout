import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) return json({ ids: [] });

	const { data, error } = await locals.supabase
		.from('favorites')
		.select('game_id')
		.eq('user_id', session.user.id);

	if (error) {
		console.error('[api/favorites] GET failed:', JSON.stringify(error));
		return json({ ids: [] });
	}

	return json({ ids: (data ?? []).map((r) => r.game_id) });
};

interface FavoriteBody {
	game_id: number;
	game_slug: string;
	game_name: string;
	game_cover: string | null;
	game_rating: number;
	game_genres: string[];
}

export const POST: RequestHandler = async ({ locals, request }) => {
	const session = await locals.getSession();
	if (!session) return json({ error: 'Not authenticated' }, { status: 401 });

	const body = (await request.json()) as FavoriteBody;

	const { error } = await locals.supabase.from('favorites').insert({
		user_id: session.user.id,
		game_id: body.game_id,
		game_slug: body.game_slug,
		game_name: body.game_name,
		game_cover: body.game_cover,
		game_rating: body.game_rating,
		game_genres: body.game_genres
	});

	if (error) {
		console.error('[api/favorites] POST failed:', JSON.stringify(error));
		return json({ error: error.message }, { status: 500 });
	}

	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
	const session = await locals.getSession();
	if (!session) return json({ error: 'Not authenticated' }, { status: 401 });

	const gameId = Number(url.searchParams.get('game_id'));
	if (!gameId) return json({ error: 'Missing game_id' }, { status: 400 });

	const { error } = await locals.supabase
		.from('favorites')
		.delete()
		.eq('user_id', session.user.id)
		.eq('game_id', gameId);

	if (error) {
		console.error('[api/favorites] DELETE failed:', JSON.stringify(error));
		return json({ error: error.message }, { status: 500 });
	}

	return json({ ok: true });
};
