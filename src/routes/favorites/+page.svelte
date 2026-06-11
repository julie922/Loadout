<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import type { Favorite } from '$lib/database.types';
	import type { GameCard as GameCardType } from '$lib/types';
	import GameCard from '$lib/components/GameCard.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';

	interface Props {
		data: PageData;
	}
	const { data }: Props = $props();

	let sort = $state('Recently added');
	const SORT_OPTIONS = ['Recently added', 'Rating', 'A–Z'];

	let sortOpen = $state(false);

	function favToGameCard(f: Favorite): GameCardType {
		return {
			id: f.game_id,
			slug: f.game_slug,
			name: f.game_name,
			released: f.created_at,
			cover: f.game_cover,
			score: f.game_rating ? Math.round(f.game_rating * 20) : null,
			rating: f.game_rating ?? 0,
			genres: f.game_genres ?? [],
			platforms: [],
			developer: '',
			blurb: ''
		};
	}

	const sorted = $derived.by(() => {
		// On filtre via le store plutôt que d'afficher data.favorites directement.
		// Sinon, retirer un cœur ne retire pas la carte avant rechargement de page.
		const list = data.favorites
			.filter((f) => favoritesStore.has(f.game_id))
			.map(favToGameCard);
		if (sort === 'Rating') return [...list].sort((a, b) => b.rating - a.rating);
		if (sort === 'A–Z') return [...list].sort((a, b) => a.name.localeCompare(b.name));
		return list;
	});
</script>

<svelte:head>
	<title>My Favorites — Loadout</title>
</svelte:head>

<main class="page favorites">
	{#if data.isGuest}
		<div class="profile-guest">
			<div class="empty-ic">
				<svg viewBox="0 0 24 24" width="30" height="30">
					<path
						d="M12 20.5 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13L12 20.5Z"
						stroke="currentColor"
						stroke-width="2"
						fill="none"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
			<h2>Log in to see your favorites</h2>
			<p>Heart any game to start building your collection.</p>
			<a href="/auth" class="btn btn-primary btn-lg">Log in or register</a>
		</div>
	{:else}
		<div class="fav-head">
			<div>
				<h1 class="fav-title">Your favorites</h1>
				<p class="fav-sub">
					{sorted.length}
					{sorted.length === 1 ? 'game' : 'games'} in your collection
				</p>
			</div>

			{#if sorted.length > 0}
				<div class="dd">
					<button
						class="dd-btn {sortOpen ? 'open' : ''}"
						onclick={() => (sortOpen = !sortOpen)}
					>
						<span class="dd-label">Sort:</span>
						<span>{sort}</span>
						<span class="dd-caret">
							<svg viewBox="0 0 24 24" fill="none" width="16" height="16">
								<path
									d="m6 9 6 6 6-6"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</span>
					</button>
					{#if sortOpen}
						<div class="dd-menu" style="right:0;left:auto">
							{#each SORT_OPTIONS as s}
								<button
									class="dd-opt {s === sort ? 'sel' : ''}"
									onclick={() => { sort = s; sortOpen = false; }}
								>{s}</button>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		{#if sorted.length === 0}
			<div class="empty">
				<div class="empty-ic">
					<svg viewBox="0 0 24 24" width="28" height="28">
						<path
							d="M12 20.5 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13L12 20.5Z"
							stroke="currentColor"
							stroke-width="2"
							fill="none"
							stroke-linejoin="round"
						/>
					</svg>
				</div>
				<p>No favorites yet. Tap the heart on any game to start your collection.</p>
				<a href="/" class="btn btn-primary btn-lg">Browse games</a>
			</div>
		{:else}
			<div class="game-grid grid-classic">
				{#each sorted as game}
					<GameCard
						{game}
						variant="classic"
						fav={favoritesStore.has(game.id)}
						onToggleFav={(id) => favoritesStore.toggle(id, game)}
						onOpen={(g) => goto(`/games/${g.slug}`)}
					/>
				{/each}
			</div>
		{/if}
	{/if}
</main>
