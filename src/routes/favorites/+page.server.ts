import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) return { favorites: [], isGuest: true };

	const { data } = await locals.supabase
		.from('favorites')
		.select('*')
		.eq('user_id', session.user.id)
		.order('created_at', { ascending: false });

	return { favorites: data ?? [], isGuest: false };
};
