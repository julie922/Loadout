<script lang="ts">
	interface Props {
		value: number;
		size?: number;
	}
	const { value, size = 16 }: Props = $props();

	const slots = [1, 2, 3, 4, 5];
	function fill(i: number) {
		if (value >= i) return 'full';
		if (value >= i - 0.5) return 'half';
		return 'empty';
	}
</script>

<span class="stars" aria-label="{value} out of 5">
	{#each slots as i}
		<span class="star-slot" style="width:{size}px;height:{size}px">
			<span class="star-bg" style="width:{size}px;height:{size}px">
				<svg viewBox="0 0 24 24" width={size} height={size}>
					<path
						d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9L12 3Z"
						fill="currentColor"
					/>
				</svg>
			</span>
			{#if fill(i) !== 'empty'}
				<span class="star-fg" style="width:{size}px;height:{size}px">
					{#if fill(i) === 'full'}
						<svg viewBox="0 0 24 24" width={size} height={size}>
							<path
								d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9L12 3Z"
								fill="currentColor"
							/>
						</svg>
					{:else}
						<svg viewBox="0 0 24 24" width={size} height={size}>
							<defs>
								<linearGradient id="sh_{i}">
									<stop offset="50%" stop-color="currentColor" />
									<stop offset="50%" stop-color="transparent" />
								</linearGradient>
							</defs>
							<path
								d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9L12 3Z"
								fill="url(#sh_{i})"
								stroke="currentColor"
								stroke-width="1"
							/>
						</svg>
					{/if}
				</span>
			{/if}
		</span>
	{/each}
</span>
