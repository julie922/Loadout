<script lang="ts">
	import { goto } from '$app/navigation';
	import CoverArt from '$lib/components/ui/CoverArt.svelte';
	import ScoreBadge from '$lib/components/ui/ScoreBadge.svelte';
	import Stars from '$lib/components/ui/Stars.svelte';
	import GameCard from '$lib/components/GameCard.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import type { PageData } from './$types';
	import type { GameCard as GameCardType } from '$lib/types';

	interface Props {
		data: PageData;
	}
	const { data }: Props = $props();

	const { game, similar } = $derived(data);
	const isFav = $derived(favoritesStore.has(game.id));

	const year = $derived(game.released ? new Date(game.released).getFullYear() : '');

	function openGame(g: GameCardType) {
		goto(`/games/${g.slug}`);
	}
</script>

<svelte:head>
	<title>{game.name} — Loadout</title>
</svelte:head>

<main class="page detail">
	<div class="detail-banner">
		<div class="detail-banner-art">
			<CoverArt cover={game.cover} name={game.name} />
		</div>
		<div class="detail-banner-scrim"></div>
		<button class="btn btn-back" onclick={() => goto('/')}>
			<svg viewBox="0 0 24 24" fill="none" width="18" height="18">
				<path
					d="M19 12H5M11 6l-6 6 6 6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			Back
		</button>
	</div>

	<div class="detail-body">
		<div class="detail-head">
			<div class="detail-cover">
				<CoverArt cover={game.cover} name={game.name} />
			</div>
			<div class="detail-headinfo">
				<h1 class="detail-title">{game.name}</h1>
				<div class="detail-meta">
					<span>{year}</span>
					<span class="dotsep"></span>
					<span>{game.developer}</span>
				</div>
				<div class="detail-rating">
					<ScoreBadge score={game.score} size="lg" />
					<div class="detail-stars">
						<Stars value={game.rating} size={20} />
						<span class="detail-rating-num">{game.rating.toFixed(1)} / 5</span>
					</div>
				</div>
				<div class="detail-tags">
					{#each game.genres as g}
						<span class="tag tag-lg">{g}</span>
					{/each}
					{#each game.platforms as p}
						<span class="tag tag-plat">{p}</span>
					{/each}
				</div>
				<div class="detail-actions">
					<button
						class="btn btn-primary btn-lg {isFav ? 'is-fav-solid' : ''}"
						onclick={() => favoritesStore.toggle(game.id, game)}
					>
						{#if isFav}
							<svg viewBox="0 0 24 24" width="18" height="18"
								><path
									d="M12 20.5 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13L12 20.5Z"
									fill="currentColor"
								/></svg
							>
							Added to favorites
						{:else}
							<svg viewBox="0 0 24 24" width="18" height="18"
								><path
									d="M12 20.5 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13L12 20.5Z"
									stroke="currentColor"
									stroke-width="2"
									fill="none"
									stroke-linejoin="round"
								/></svg
							>
							Add to favorites
						{/if}
					</button>
					<button class="btn btn-outline btn-lg">
						<svg viewBox="0 0 24 24" width="18" height="18"
							><path d="M8 5v14l11-7L8 5Z" fill="currentColor" /></svg
						>
						Watch trailer
					</button>
				</div>
			</div>
		</div>

		<div class="detail-section">
			<h2 class="section-title">About</h2>
			<p class="detail-desc">{game.description || game.blurb}</p>
		</div>

		{#if game.screenshots.length > 0}
			<div class="detail-section">
				<div class="section-head-row">
					<h2 class="section-title">Screenshots</h2>
					<span class="section-hint">scroll →</span>
				</div>
				<div class="shots">
					{#each game.screenshots as src, i}
						<div class="shot">
							<img
								{src}
								alt="Screenshot {i + 1}"
								style="width:100%;height:100%;object-fit:cover;display:block;"
							/>
							<span class="shot-tag">screenshot {i + 1}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if similar.length > 0}
			<div class="detail-section">
				<h2 class="section-title">Similar games</h2>
				<div class="game-grid grid-classic similar-grid">
					{#each similar as g}
						<GameCard
							game={g}
							variant="classic"
							fav={favoritesStore.has(g.id)}
							onToggleFav={(id) => favoritesStore.toggle(id, g)}
							onOpen={openGame}
						/>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</main>
