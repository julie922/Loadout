import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (session) redirect(303, '/');
	return {};
};

export const actions: Actions = {
	login: async ({ request, locals }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '');
		const password = String(data.get('password') ?? '');

		const { error } = await locals.supabase.auth.signInWithPassword({ email, password });

		if (error) {
			return fail(400, { errors: { general: 'Invalid email or password.' } });
		}

		redirect(303, '/');
	},

	register: async ({ request, locals }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '');
		const password = String(data.get('password') ?? '');
		const username = String(data.get('username') ?? '').trim();

		if (username.length < 2) {
			return fail(400, { errors: { general: 'Display name must be at least 2 characters.' } });
		}
		if (password.length < 6) {
			return fail(400, { errors: { password: 'Password must be at least 6 characters.' } });
		}

		const { error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: { data: { username } }
		});

		if (error) {
			return fail(400, { errors: { general: error.message } });
		}

		redirect(303, '/');
	}
};
