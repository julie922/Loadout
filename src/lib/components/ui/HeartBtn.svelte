<script lang="ts">
	interface Props {
		active: boolean;
		onclick: () => void;
		class?: string;
	}
	const { active, onclick, class: cls = '' }: Props = $props();
</script>

<button
	class="heart-btn {active ? 'is-active' : ''} {cls}"
	aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
	onclick={(e) => {
		e.stopPropagation();
		onclick();
	}}
>
	{#if active}
		<svg viewBox="0 0 24 24" width="18" height="18">
			<path
				d="M12 20.5 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13L12 20.5Z"
				fill="currentColor"
			/>
		</svg>
	{:else}
		<svg viewBox="0 0 24 24" width="18" height="18">
			<path
				d="M12 20.5 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13L12 20.5Z"
				stroke="currentColor"
				stroke-width="2"
				fill="none"
				stroke-linejoin="round"
			/>
		</svg>
	{/if}
</button>
