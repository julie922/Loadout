<script lang="ts">
	import CoverArt from './ui/CoverArt.svelte';
	import ScoreBadge from './ui/ScoreBadge.svelte';
	import Stars from './ui/Stars.svelte';
	import type { GameCard } from '$lib/types';

	interface Props {
		game: GameCard;
		fav: boolean;
		onOpen: (game: GameCard) => void;
		onToggleFav: (id: number) => void;
	}
	const { game, fav, onOpen, onToggleFav }: Props = $props();
</script>

<section class="hero">
	<div class="hero-art">
		<CoverArt cover={game.cover} name={game.name} />
		<div class="hero-art-glow"></div>
	</div>
	<div class="hero-copy">
		<div class="hero-kicker"><span class="dot"></span> Featured this week</div>
		<h1 class="hero-title">{game.name}</h1>
		<div class="hero-meta">
			<ScoreBadge score={game.score} size="lg" />
			<Stars value={game.rating} size={18} />
			<span class="hero-rating-num">{game.rating.toFixed(1)}</span>
			<span class="hero-divider"></span>
			<span class="hero-dev">{game.developer}</span>
		</div>
		<p class="hero-blurb">{game.blurb || game.name}</p>
		<div class="hero-tags">
			{#each game.genres as g}
				<span class="tag tag-lg">{g}</span>
			{/each}
		</div>
		<div class="hero-cta">
			<button class="btn btn-primary btn-lg" onclick={() => onOpen(game)}>
				<svg viewBox="0 0 24 24" width="18" height="18"
					><path d="M8 5v14l11-7L8 5Z" fill="currentColor" /></svg
				>
				View game
			</button>
			<button
				class="btn btn-ghost btn-lg {fav ? 'is-fav' : ''}"
				onclick={() => onToggleFav(game.id)}
			>
				{#if fav}
					<svg viewBox="0 0 24 24" width="18" height="18"
						><path
							d="M12 20.5 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13L12 20.5Z"
							fill="currentColor"
						/></svg
					>
					In favorites
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
		</div>
	</div>
</section>
