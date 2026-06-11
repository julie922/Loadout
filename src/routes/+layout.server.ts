import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	let profile: { id: string; username: string; avatar_url: string | null } | null = null;

	if (session) {
		const { data } = await locals.supabase
			.from('profiles')
			.select('id, username, avatar_url')
			.eq('id', session.user.id)
			.single();
		profile = data;
	}

	return { session, profile };
};
