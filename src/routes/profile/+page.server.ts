import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) redirect(303, '/auth');

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', session.user.id)
		.single();

	const { data: favorites } = await locals.supabase
		.from('favorites')
		.select('*')
		.eq('user_id', session.user.id)
		.order('created_at', { ascending: false });

	return { profile, favorites: favorites ?? [] };
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const session = await locals.getSession();
		if (!session) return fail(401, { errors: { general: 'Not authenticated.' } });

		const data = await request.formData();
		const username  = String(data.get('username')  ?? '').trim();
		const bio       = String(data.get('bio')       ?? '').trim();
		const avatarUrl = String(data.get('avatar_url') ?? '').trim();

		if (username.length < 2) {
			return fail(400, { errors: { username: 'Name must be at least 2 characters.' } });
		}

		const update: { username: string; bio: string; updated_at: string; avatar_url?: string } = {
			username,
			bio,
			updated_at: new Date().toISOString()
		};
		if (avatarUrl) update.avatar_url = avatarUrl;

		const { error } = await locals.supabase
			.from('profiles')
			.update(update)
			.eq('id', session.user.id);

		if (error) {
			console.error('[profile] updateProfile failed:', JSON.stringify(error));
			return fail(500, { errors: { general: 'Failed to update profile.' } });
		}

		return { success: true };
	},

	signOut: async ({ locals }) => {
		await locals.supabase.auth.signOut();
		redirect(303, '/');
	}
};
