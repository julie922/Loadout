<script lang="ts">
	interface Props {
		score: number | null;
		size?: 'sm' | 'lg';
	}
	const { score, size = 'sm' }: Props = $props();

	function scoreClass(s: number) {
		if (s >= 75) return 'score-hi';
		if (s >= 50) return 'score-mid';
		return 'score-bad';
	}
</script>

<style>
	.score-mc {
		font-size: 0.6em;
		font-weight: 600;
		opacity: 0.75;
		margin-right: 1px;
		vertical-align: 0.05em;
	}
</style>

{#if score !== null}
	<span
		class="score-badge {scoreClass(score)} {size === 'lg' ? 'score-lg' : ''}"
		title="Metacritic score: {score}/100"
	>
		<span class="score-mc">MC</span>{score}
	</span>
{/if}
