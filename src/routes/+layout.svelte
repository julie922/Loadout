<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { searchStore } from '$lib/stores/search.svelte';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children: import('svelte').Snippet;
	}
	const { data, children }: Props = $props();

	$effect(() => {
		document.documentElement.dataset.theme = themeStore.dark ? 'dark' : 'light';
	});

	onMount(() => {
		themeStore.init();
		favoritesStore.init(data.session?.user?.id ?? null);
	});

	const isAuthPage = $derived($page.url.pathname === '/auth');
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="app">
	{#if !isAuthPage}
		<NavBar
			user={data.profile}
			favCount={favoritesStore.count}
			query={searchStore.query}
			dark={themeStore.dark}
			onQueryChange={(q) => searchStore.set(q)}
			onToggleTheme={() => themeStore.toggle()}
		/>
	{/if}

	{@render children()}

	{#if !isAuthPage}
		<BottomNav user={data.profile} favCount={favoritesStore.count} />
	{/if}

	<Toast message={favoritesStore.toast} />
</div>
