import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from './database.types';

export function createSupabaseClient(fetch?: typeof globalThis.fetch) {
	if (isBrowser()) {
		return createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
	}
	return createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: { fetch: fetch ?? globalThis.fetch },
		cookies: { getAll: () => [], setAll: () => {} }
	});
}

export function createSupabaseServerClient(
	cookies: import('@sveltejs/kit').Cookies,
	fetch: typeof globalThis.fetch
) {
	return createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: { fetch },
		cookies: {
			getAll() {
				return cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) =>
					cookies.set(name, value, { path: '/', ...options })
				);
			}
		}
	});
}
