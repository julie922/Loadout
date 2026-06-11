<script lang="ts">
	import CoverArt from './ui/CoverArt.svelte';
	import ScoreBadge from './ui/ScoreBadge.svelte';
	import Stars from './ui/Stars.svelte';
	import HeartBtn from './ui/HeartBtn.svelte';
	import type { GameCard as GameCardType } from '$lib/types';

	interface Props {
		game: GameCardType;
		variant?: 'classic' | 'overlay' | 'editorial';
		fav: boolean;
		onToggleFav: (id: number) => void;
		onOpen: (game: GameCardType) => void;
	}
	const { game, variant = 'classic', fav, onToggleFav, onOpen }: Props = $props();

	const year = $derived(game.released ? new Date(game.released).getFullYear() : '');
	const genres = $derived(game.genres.slice(0, 3));
</script>

{#if variant === 'overlay'}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_no_noninteractive_tabindex -->
	<article class="card card-overlay" onclick={() => onOpen(game)} onkeydown={(e) => e.key === 'Enter' && onOpen(game)} tabindex="0">
		<div class="card-overlay-art"><CoverArt cover={game.cover} name={game.name} /></div>
		<div class="card-overlay-scrim"></div>
		<ScoreBadge score={game.score} />
		<HeartBtn active={fav} onclick={() => onToggleFav(game.id)} class="card-heart" />
		<div class="card-overlay-info">
			<h3 class="card-title">{game.name}</h3>
			<div class="card-overlay-row">
				<Stars value={game.rating} size={13} />
				<span class="card-year">{year}</span>
			</div>
		</div>
	</article>
{:else if variant === 'editorial'}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_no_noninteractive_tabindex -->
	<article class="card card-editorial" onclick={() => onOpen(game)} onkeydown={(e) => e.key === 'Enter' && onOpen(game)} tabindex="0">
		<div class="card-editorial-art"><CoverArt cover={game.cover} name={game.name} /></div>
		<div class="card-editorial-body">
			<div class="card-editorial-top">
				<ScoreBadge score={game.score} />
				<HeartBtn active={fav} onclick={() => onToggleFav(game.id)} />
			</div>
			<h3 class="card-title">{game.name}</h3>
			<p class="card-blurb">{game.blurb}</p>
			<div class="card-editorial-foot">
				<div class="tag-row">
					{#each genres as g}
						<span class="tag">{g}</span>
					{/each}
				</div>
				<span class="card-year">{game.released}</span>
			</div>
		</div>
	</article>
{:else}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_no_noninteractive_tabindex -->
	<article class="card card-classic" onclick={() => onOpen(game)} onkeydown={(e) => e.key === 'Enter' && onOpen(game)} tabindex="0">
		<div class="card-classic-art">
			<CoverArt cover={game.cover} name={game.name} />
			<ScoreBadge score={game.score} />
			<HeartBtn active={fav} onclick={() => onToggleFav(game.id)} class="card-heart" />
		</div>
		<div class="card-classic-body">
			<h3 class="card-title">{game.name}</h3>
			<div class="card-classic-row">
				<Stars value={game.rating} size={13} />
				<span class="card-rating-num">{game.rating.toFixed(1)}</span>
			</div>
			<div class="tag-row">
				{#each genres as g}
					<span class="tag">{g}</span>
				{/each}
			</div>
		</div>
	</article>
{/if}
