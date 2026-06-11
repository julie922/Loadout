<script lang="ts">
	interface Filters {
		genre: string;
		platform: string;
		sort: string;
	}

	interface Props {
		filters: Filters;
		onchange: (filters: Filters) => void;
	}
	const { filters, onchange }: Props = $props();

	const GENRES = ['All', 'Action', 'RPG', 'Adventure', 'Strategy', 'Shooter', 'Indie', 'Racing', 'Simulation', 'Puzzle', 'Casual'];
	const PLATFORMS = ['All', 'PC', 'PS5', 'Xbox', 'Switch'];
	const SORT_OPTIONS = ['Popularity', 'Rating', 'Release date', 'A–Z'];

	let genreOpen = $state(false);
	let sortOpen = $state(false);

	function setGenre(v: string) { onchange({ ...filters, genre: v }); genreOpen = false; }
	function setPlatform(v: string) { onchange({ ...filters, platform: v }); }
	function setSort(v: string) { onchange({ ...filters, sort: v }); sortOpen = false; }

	function clickOutside(node: HTMLElement, callback: () => void) {
		const handler = (e: MouseEvent) => { if (!node.contains(e.target as Node)) callback(); };
		document.addEventListener('mousedown', handler);
		return { destroy() { document.removeEventListener('mousedown', handler); } };
	}
</script>

<div class="filter-bar">
	<div class="filter-left">
		<div class="dd" use:clickOutside={() => (genreOpen = false)}>
			<button class="dd-btn {genreOpen ? 'open' : ''}" onclick={() => (genreOpen = !genreOpen)}>
				<span class="dd-label">Genre:</span>
				<span class="dd-value">{filters.genre}</span>
				<span class="dd-caret">
					<svg viewBox="0 0 24 24" fill="none" width="16" height="16">
						<path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</span>
			</button>
			{#if genreOpen}
				<div class="dd-menu">
					{#each GENRES as g}
						<button class="dd-opt {g === filters.genre ? 'sel' : ''}" onclick={() => setGenre(g)}>
							{g}
							{#if g === filters.genre}
								<span class="dd-check">
									<svg viewBox="0 0 24 24" fill="none" width="15" height="15">
										<path d="m5 13 4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								</span>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="plat-filter">
			<span class="plat-label">Platform</span>
			{#each PLATFORMS as p}
				<button
					class="plat-chip {filters.platform === p ? 'on' : ''}"
					onclick={() => setPlatform(p)}
				>{p}</button>
			{/each}
		</div>
	</div>

	<div class="dd" use:clickOutside={() => (sortOpen = false)}>
		<button class="dd-btn {sortOpen ? 'open' : ''}" onclick={() => (sortOpen = !sortOpen)}>
			<span class="dd-label">Sort:</span>
			<span class="dd-value">{filters.sort}</span>
			<span class="dd-caret">
				<svg viewBox="0 0 24 24" fill="none" width="16" height="16">
					<path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</span>
		</button>
		{#if sortOpen}
			<div class="dd-menu" style="right:0;left:auto">
				{#each SORT_OPTIONS as s}
					<button class="dd-opt {s === filters.sort ? 'sel' : ''}" onclick={() => setSort(s)}>
						{s}
						{#if s === filters.sort}
							<span class="dd-check">
								<svg viewBox="0 0 24 24" fill="none" width="15" height="15">
									<path d="m5 13 4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
