<script lang="ts">
	import { page } from '$app/stores';

	interface Props {
		user: { username: string; avatar_url: string | null } | null;
		favCount: number;
		query: string;
		dark: boolean;
		onQueryChange: (q: string) => void;
		onToggleTheme: () => void;
	}
	const { user, favCount, query, dark, onQueryChange, onToggleTheme }: Props = $props();

	const path = $derived($page.url.pathname as string);
	const isHome = $derived(path === '/');
	const isFavs = $derived(path === '/favorites');
	const isProfile = $derived(path === '/profile');
</script>

<header class="nav">
	<div class="nav-inner">
		<a href="/" class="brand">
			<span class="brand-mark">
				<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
					<rect width="28" height="28" rx="7" fill="var(--acc)"/>
					<text
						x="14"
						y="20"
						text-anchor="middle"
						font-family="'Space Grotesk', sans-serif"
						font-size="12"
						font-weight="700"
						fill="white"
						letter-spacing="-0.5"
					>GV</text>
				</svg>
			</span>
			<span class="brand-name">Loadout</span>
		</a>

		<div class="nav-search">
			<span class="nav-search-ic">
				<svg viewBox="0 0 24 24" fill="none" width="18" height="18">
					<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
					<path d="m20 20-3.2-3.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
			</span>
			<input
				value={query}
				oninput={(e) => onQueryChange((e.target as HTMLInputElement).value)}
				placeholder="Search games…"
			/>
			{#if query}
				<button class="nav-search-clear" aria-label="Clear search" onclick={() => onQueryChange('')}>
					<svg viewBox="0 0 24 24" fill="none" width="14" height="14">
						<path
							d="m6 6 12 12M18 6 6 18"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				</button>
			{/if}
		</div>

		<nav class="nav-links">
			<a href="/" class={isHome ? 'active' : ''}>Discover</a>
			<a href="/favorites" class={isFavs ? 'active' : ''}>
				Favorites
				{#if favCount > 0}<span class="nav-count">{favCount}</span>{/if}
			</a>
		</nav>

		<button class="nav-theme" onclick={onToggleTheme} aria-label="Toggle theme">
			{#if dark}
				<svg viewBox="0 0 24 24" fill="none" width="19" height="19">
					<circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="2" />
					<path
						d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" fill="none" width="19" height="19">
					<path
						d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
						stroke="currentColor"
						stroke-width="2"
						stroke-linejoin="round"
					/>
				</svg>
			{/if}
		</button>

		{#if user}
			<a href="/profile" class="nav-avatar {isProfile ? 'active' : ''}" aria-label="Profile">
				{#if user.avatar_url}
					<img src={user.avatar_url} alt={user.username} class="avatar-mini" style="object-fit: cover;" />
				{:else}
					<span class="avatar-mini">{user.username[0]?.toUpperCase()}</span>
				{/if}
			</a>
		{:else}
			<a href="/auth" class="btn btn-primary nav-login">Log in</a>
		{/if}
	</div>
</header>
