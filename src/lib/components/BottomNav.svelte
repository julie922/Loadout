<script lang="ts">
	import { page } from '$app/stores';

	interface Props {
		user: { username: string } | null;
		favCount: number;
	}
	const { user, favCount }: Props = $props();

	const isHome = $derived($page.url.pathname === '/');
	const isFavs = $derived($page.url.pathname === '/favorites');
	const isProfile = $derived($page.url.pathname === '/profile' || $page.url.pathname === '/auth');
</script>

<nav class="bottom-nav">
	<a href="/" class="bn-item {isHome ? 'active' : ''}">
		<span class="bn-ic">
			<svg viewBox="0 0 24 24" fill="none" width="22" height="22">
				<path
					d="M4 11 12 4l8 7"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path d="M6 10v9h12v-9" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
			</svg>
		</span>
		<span>Discover</span>
	</a>
	<a href="/favorites" class="bn-item {isFavs ? 'active' : ''}">
		<span class="bn-ic">
			<svg viewBox="0 0 24 24" width="22" height="22">
				<path
					d="M12 20.5 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13L12 20.5Z"
					stroke="currentColor"
					stroke-width="2"
					fill="none"
					stroke-linejoin="round"
				/>
			</svg>
		</span>
		<span>Favorites {#if favCount > 0}<span class="nav-count" style="font-size:10px">{favCount}</span>{/if}</span>
	</a>
	<a href={user ? '/profile' : '/auth'} class="bn-item {isProfile ? 'active' : ''}">
		<span class="bn-ic">
			<svg viewBox="0 0 24 24" fill="none" width="22" height="22">
				<circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" />
				<path
					d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		</span>
		<span>{user ? 'Profile' : 'Log in'}</span>
	</a>
</nav>
