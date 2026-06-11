<script lang="ts">
	interface Props {
		message: string | null;
	}
	const { message }: Props = $props();
</script>

{#if message}
	<div class="toast" role="status" aria-live="polite">
		<span class="toast-ic">
			<svg viewBox="0 0 24 24" fill="none" width="18" height="18">
				<path
					d="m5 13 4 4L19 7"
					stroke="currentColor"
					stroke-width="2.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</span>
		<span>{message}</span>
	</div>
{/if}
