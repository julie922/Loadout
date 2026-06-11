<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import CoverArt from '$lib/components/ui/CoverArt.svelte';
	import { createSupabaseClient } from '$lib/supabase';

	interface Props {
		data: PageData;
		form: ActionData;
	}
	const { data, form }: Props = $props();

	let editing = $state(false);
	let editName = $state('');
	let editBio  = $state('');

	// Resynchronisation à chaque ouverture du modal, pas seulement au montage.
	// Sans ça : sauvegarder le profil puis rouvrir pour changer l'avatar
	// soumettrait les vieilles valeurs par-dessus les nouvelles.
	$effect(() => {
		if (editing) {
			editName = untrack(() => data.profile?.username ?? '');
			editBio  = untrack(() => data.profile?.bio ?? '');
		}
	});

	// Avatar upload
	let fileInput = $state<HTMLInputElement | undefined>(undefined);
	let avatarFile = $state<File | null>(null);
	let avatarPreview = $state<string | null>(null);
	let avatarUploading = $state(false);

	function openFilePicker() {
		fileInput?.click();
	}

	function onFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0] ?? null;
		if (!file) return;
		avatarFile = file;
		avatarPreview = URL.createObjectURL(file);
	}

	async function uploadAvatar(): Promise<string | null> {
		if (!avatarFile || !data.profile) return null;
		const sb = createSupabaseClient();
		const ext = avatarFile.name.split('.').pop() ?? 'jpg';
		const path = `${data.profile.id}-${Date.now()}.${ext}`;
		const { error } = await sb.storage.from('avatars').upload(path, avatarFile, {
			upsert: true,
			contentType: avatarFile.type
		});
		if (error) {
			console.error('[avatar] upload failed:', JSON.stringify(error));
			return null;
		}
		const { data: urlData } = sb.storage.from('avatars').getPublicUrl(path);
		return urlData.publicUrl;
	}

	$effect(() => {
		if (form?.success) editing = false;
	});

	type ProfileFormErrors = { username?: string; general?: string };
	const formErrors = $derived(form?.errors as ProfileFormErrors | null | undefined);

	const favCount = $derived(data.favorites.length);
	const avgRating = $derived(
		favCount > 0
			? (data.favorites.reduce((s, f) => s + (f.game_rating ?? 0), 0) / favCount).toFixed(1)
			: '—'
	);

	const genreCounts = $derived.by(() => {
		const counts: Record<string, number> = {};
		for (const fav of data.favorites) {
			for (const genre of fav.game_genres ?? []) {
				counts[genre] = (counts[genre] ?? 0) + 1;
			}
		}
		return counts;
	});
	const topGenre    = $derived(Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '');
	// On calcule le max séparément pour normaliser les barres du graphique.
	// Object.values()[0] ne donne pas forcément le max (ordre d'insertion, pas de tri).
	const maxGenreCount = $derived(Math.max(...Object.values(genreCounts), 1));
</script>

<svelte:head>
	<title>Profile — Loadout</title>
</svelte:head>

<main class="page profile">
	<header class="profile-head">
		<div class="profile-cover"></div>
		<div class="profile-head-inner">
			{#if data.profile?.avatar_url}
				<img src={data.profile.avatar_url} alt={data.profile.username} class="avatar-lg" style="object-fit:cover;border-radius:50%;" />
			{:else}
				<div class="avatar-lg">{data.profile?.username?.[0]?.toUpperCase() ?? '?'}</div>
			{/if}
			<div class="profile-id">
				<h1 class="profile-name">{data.profile?.username}</h1>
				<p class="profile-since">
					Member since {new Date(data.profile?.member_since ?? '').toLocaleDateString('en', {
						month: 'long',
						year: 'numeric'
					})} · {favCount} favorites
				</p>
				{#if data.profile?.bio}
					<p class="profile-bio">{data.profile.bio}</p>
				{/if}
			</div>
			<div class="profile-actions">
				<button class="btn btn-primary" onclick={() => (editing = true)}>
					<svg viewBox="0 0 24 24" fill="none" width="16" height="16">
						<path
							d="M4 20h4l10-10-4-4L4 16v4Z"
							stroke="currentColor"
							stroke-width="2"
							stroke-linejoin="round"
						/>
						<path d="m13.5 6.5 4 4" stroke="currentColor" stroke-width="2" />
					</svg>
					Edit profile
				</button>
				<form method="POST" action="?/signOut" use:enhance>
					<button type="submit" class="btn btn-outline">Sign out</button>
				</form>
			</div>
		</div>
	</header>

	<div class="profile-stats">
		<div class="stat">
			<span class="stat-num">{favCount}</span>
			<span class="stat-label">Favorites</span>
		</div>
		<div class="stat">
			<span class="stat-num">{avgRating}</span>
			<span class="stat-label">Avg rating</span>
		</div>
		<div class="stat">
			<span class="stat-num">{topGenre || '—'}</span>
			<span class="stat-label">Top genre</span>
		</div>
	</div>

	<div class="profile-grid">
		<div class="genre-chart">
			<div class="chart-head">
				<div>
					<h3 class="chart-title">Genre taste</h3>
					{#if topGenre}
						<p class="chart-sub">Your favorites lean <strong>{topGenre}</strong></p>
					{/if}
				</div>
				<span class="chart-total">{favCount} games</span>
			</div>
			{#if favCount === 0}
				<p class="picks-empty">Heart some games to see your genre breakdown.</p>
			{:else}
				<div class="chart-rows">
					{#each Object.entries(genreCounts).sort((a, b) => b[1] - a[1]) as [genre, count], i}
						<div class="chart-row" style="--i:{i}">
							<span class="chart-label">{genre}</span>
							<div class="chart-track">
								<div
									class="chart-bar"
									style="width:{(count / maxGenreCount) * 100}%"
								></div>
							</div>
							<span class="chart-val">{count}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="picks-card">
			<div class="picks-head">
				<h3 class="chart-title">Top picks</h3>
				<a href="/favorites" class="picks-link">
					View all
					<svg viewBox="0 0 24 24" fill="none" width="15" height="15">
						<path
							d="M5 12h14M13 6l6 6-6 6"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</a>
			</div>
			{#if data.favorites.length === 0}
				<p class="picks-empty">No favorites yet — start hearting games to see them here.</p>
			{:else}
				<ul class="picks-list">
					{#each data.favorites.slice(0, 4) as fav}
						<li class="pick">
							<div class="pick-art">
								<CoverArt cover={fav.game_cover} name={fav.game_name} />
							</div>
							<div class="pick-info">
								<span class="pick-title">{fav.game_name}</span>
								<span class="pick-meta">{fav.game_slug}</span>
							</div>
							{#if fav.game_rating}
								<span
									class="score-badge {fav.game_rating >= 4 ? 'score-hi' : fav.game_rating >= 3 ? 'score-mid' : 'score-low'}"
								>
									{Math.round(fav.game_rating * 20)}
								</span>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</main>

{#if editing}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="modal-overlay"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onmousedown={() => (editing = false)}
		onkeydown={(e) => e.key === 'Escape' && (editing = false)}
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="modal" onmousedown={(e) => e.stopPropagation()} role="document">
			<div class="modal-head">
				<h2>Edit profile</h2>
				<button class="modal-close" aria-label="Close" onclick={() => (editing = false)}>
					<svg viewBox="0 0 24 24" fill="none" width="18" height="18">
						<path
							d="m6 6 12 12M18 6 6 18"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				</button>
			</div>
			<form
				class="modal-body"
				method="POST"
				action="?/updateProfile"
				use:enhance={async ({ formData }) => {
					if (avatarFile) {
						avatarUploading = true;
						const url = await uploadAvatar();
						if (url) formData.set('avatar_url', url);
						avatarUploading = false;
					}
					return async ({ update }) => {
						// reset:false keeps input DOM intact; $effect re-syncs on next open
						await update({ reset: false });
						avatarFile = null;
						avatarPreview = null;
					};
				}}
			>
				<div class="modal-avatar-row">
					{#if avatarPreview ?? (data.profile?.avatar_url ?? null)}
						<img
							src={avatarPreview ?? data.profile?.avatar_url ?? ''}
							alt="Avatar preview"
							class="avatar-lg modal-avatar"
							style="object-fit:cover;border-radius:50%;"
						/>
					{:else}
						<div class="avatar-lg modal-avatar">{editName[0]?.toUpperCase() ?? '?'}</div>
					{/if}
					<button
						type="button"
						class="btn btn-outline"
						onclick={openFilePicker}
						disabled={avatarUploading}
					>
						{avatarUploading ? 'Uploading…' : 'Change avatar'}
					</button>
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp,image/gif"
						style="display:none"
						bind:this={fileInput}
						onchange={onFileChange}
					/>
				</div>
				<label class="field">
					<span class="field-label">Display name</span>
					<input
						name="username"
						bind:value={editName}
						required
						minlength="2"
						class={formErrors?.username ? 'err' : ''}
					/>
					{#if formErrors?.username}
						<span class="field-err">{formErrors.username}</span>
					{/if}
				</label>
				<label class="field">
					<span class="field-label">Bio</span>
					<textarea class="modal-textarea" name="bio" bind:value={editBio} rows={3}></textarea>
				</label>
				{#if formErrors?.general}
					<p class="field-err">{formErrors.general}</p>
				{/if}
				<div class="modal-foot">
					<button type="button" class="btn btn-ghost" onclick={() => (editing = false)}
						>Cancel</button
					>
					<button type="submit" class="btn btn-primary">Save changes</button>
				</div>
			</form>
		</div>
	</div>
{/if}
