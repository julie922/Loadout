<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import GameCard from '$lib/components/GameCard.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { searchStore } from '$lib/stores/search.svelte';
	import type { PageData } from './$types';
	import type { GameCard as GameCardType } from '$lib/types';

	interface Props {
		data: PageData;
	}
	const { data }: Props = $props();

	let cardVariant = $state<'classic' | 'overlay' | 'editorial'>('classic');
	let filters = $state({
		genre: $page.url.searchParams.get('genre') ?? 'All',
		platform: $page.url.searchParams.get('platform') ?? 'All',
		sort: $page.url.searchParams.get('sort') ?? 'Popularity'
	});

	// Live search via /api/search — fires after 300 ms debounce
	let searchResults = $state<GameCardType[]>([]);
	let searching = $state(false);
	let searchAbort: AbortController | null = null;

	$effect(() => {
		const q = searchStore.debounced;
		if (!q.trim()) {
			searchAbort?.abort();
			searchAbort = null;
			searchResults = [];
			searching = false;
			return;
		}
		searchAbort?.abort();
		searchAbort = new AbortController();
		searching = true;
		fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: searchAbort.signal })
			.then((r) => r.json())
			.then(({ games }: { games: GameCardType[] }) => {
				searchResults = games;
				searching = false;
			})
			.catch((err: unknown) => {
				if ((err as Error).name !== 'AbortError') searching = false;
			});
	});

	function applyFilters(f: typeof filters) {
		filters = f;
		const params = new URLSearchParams();
		if (f.genre !== 'All') params.set('genre', f.genre);
		if (f.platform !== 'All') params.set('platform', f.platform);
		if (f.sort !== 'Popularity') params.set('sort', f.sort);
		goto(`/?${params}`, { keepFocus: true });
	}

	const displayGames = $derived(searchStore.debounced ? searchResults : data.games);
	const featured    = $derived(displayGames[0] ?? data.games[0]);

	const PAGE_SIZE  = 20;
	const MAX_PAGES  = 50;

	function buildPageUrl(p: number): string {
		const params = new URLSearchParams(Object.fromEntries($page.url.searchParams));
		if (p === 1) params.delete('page');
		else params.set('page', String(p));
		const s = params.toString();
		return s ? `?${s}` : '?';
	}

	function pageRange(current: number, total: number): number[] {
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
		const out: number[] = [1];
		if (current > 3)           out.push(0); // left ellipsis
		const lo = Math.max(2, current - 1);
		const hi = Math.min(total - 1, current + 1);
		for (let i = lo; i <= hi; i++) out.push(i);
		if (current < total - 2)   out.push(0); // right ellipsis
		out.push(total);
		return out;
	}

	function openGame(game: GameCardType) {
		goto(`/games/${game.slug}`);
	}
</script>

<svelte:head>
	<title>Loadout — Discover Games</title>
</svelte:head>

<main class="page home">
	{#if featured && !data.error}
		<HeroSection
			game={featured}
			fav={favoritesStore.has(featured.id)}
			onOpen={openGame}
			onToggleFav={(id) => { const game = data.games.find((g) => g.id === id); if (game) favoritesStore.toggle(id, game); }}
		/>
	{/if}

	<FilterBar {filters} onchange={applyFilters} />

	<div class="results-head">
		<h2 class="section-title">
			{searchStore.debounced ? `Results for "${searchStore.debounced}"` : filters.genre === 'All' ? 'All games' : filters.genre}
			<span class="results-count">{data.error ? '—' : (searching ? '…' : displayGames.length)}</span>
		</h2>
	</div>

	{#if data.error}
		<div class="error-state">
			<div class="error-ic">
				<svg viewBox="0 0 24 24" fill="none" width="30" height="30">
					<path d="M12 3 2 20h20L12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
					<path d="M12 9v5M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</div>
			<h3>Couldn't load games</h3>
			<p>Something went wrong reaching the catalog. Check your connection and try again.</p>
			<button class="btn btn-primary btn-lg" onclick={() => goto('/')}>
				<svg viewBox="0 0 24 24" fill="none" width="18" height="18">
					<path d="M20 11a8 8 0 1 0-1.8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<path d="M20 4v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				Retry
			</button>
		</div>
	{:else}
		<div class="game-grid grid-{cardVariant}">
			{#each displayGames as game}
				<GameCard
					{game}
					variant={cardVariant}
					fav={favoritesStore.has(game.id)}
					onToggleFav={(id) => favoritesStore.toggle(id, game)}
					onOpen={openGame}
				/>
			{/each}
		</div>

		{#if displayGames.length === 0}
			<div class="empty">
				<div class="empty-ic">
					<svg viewBox="0 0 24 24" fill="none" width="28" height="28">
						<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
						<path d="m20 20-3.2-3.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</div>
				<p>
					{searching
						? 'Searching…'
						: searchStore.debounced
							? `No results for "${searchStore.debounced}".`
							: 'No games match those filters.'}
				</p>
			</div>
		{/if}

		{#if data.count > PAGE_SIZE && !searchStore.debounced}
			{@const currentPage = Number($page.url.searchParams.get('page') ?? '1')}
			{@const totalPages  = Math.min(Math.ceil(data.count / PAGE_SIZE), MAX_PAGES)}
			<nav class="pagination" aria-label="Page navigation">
				<!-- Previous -->
				{#if currentPage > 1}
					<a href={buildPageUrl(currentPage - 1)} class="pg-btn pg-arrow" aria-label="Previous page">
						<svg viewBox="0 0 24 24" fill="none" width="16" height="16">
							<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</a>
				{:else}
					<span class="pg-btn pg-arrow pg-disabled" aria-disabled="true">
						<svg viewBox="0 0 24 24" fill="none" width="16" height="16">
							<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</span>
				{/if}

				<!-- Page numbers -->
				{#each pageRange(currentPage, totalPages) as p}
					{#if p === 0}
						<span class="pg-ellipsis">…</span>
					{:else}
						<a
							href={buildPageUrl(p)}
							class="pg-btn {p === currentPage ? 'pg-current' : ''}"
							aria-current={p === currentPage ? 'page' : undefined}
						>{p}</a>
					{/if}
				{/each}

				<!-- Next -->
				{#if currentPage < totalPages && data.hasMore}
					<a href={buildPageUrl(currentPage + 1)} class="pg-btn pg-arrow" aria-label="Next page">
						<svg viewBox="0 0 24 24" fill="none" width="16" height="16">
							<path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</a>
				{:else}
					<span class="pg-btn pg-arrow pg-disabled" aria-disabled="true">
						<svg viewBox="0 0 24 24" fill="none" width="16" height="16">
							<path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</span>
				{/if}
			</nav>
		{/if}
	{/if}
</main>

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 2.5rem 0 1rem;
	}

	.pg-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 2.25rem;
		height: 2.25rem;
		padding: 0 0.375rem;
		border-radius: var(--r-sm);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		color: var(--text-2);
		background: var(--surface);
		border: 1px solid var(--line);
		transition: background var(--fast), color var(--fast), border-color var(--fast);
		cursor: pointer;
	}

	a.pg-btn:hover {
		background: var(--surface-2);
		color: var(--text);
		border-color: var(--line-2);
	}

	.pg-btn.pg-current {
		background: var(--acc);
		color: var(--acc-ink);
		border-color: var(--acc);
		font-weight: 600;
	}

	.pg-btn.pg-disabled {
		opacity: 0.3;
		cursor: default;
	}

	.pg-arrow {
		min-width: 2.25rem;
	}

	.pg-ellipsis {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2.25rem;
		color: var(--text-3);
		font-size: 0.875rem;
		user-select: none;
	}
</style>
