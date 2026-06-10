import { createSupabaseServerClient } from '$lib/supabase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient(event.cookies, event.fetch);

	event.locals.getSession = async () => {
		// getUser() valide le token côté serveur Supabase avant tout.
		// getSession() seule lit juste le cookie local sans vérifier qu'il est encore valide.
		const { data: { user }, error } = await event.locals.supabase.auth.getUser();
		if (error || !user) return null;
		const { data: { session } } = await event.locals.supabase.auth.getSession();
		return session;
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
