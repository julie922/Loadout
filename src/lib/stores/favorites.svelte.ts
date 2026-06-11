import type { GameCard } from '$lib/types';

let ids = $state<Set<number>>(new Set());
let toastMessage = $state<string | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(msg: string) {
	toastMessage = msg;
	if (toastTimer) clearTimeout(toastTimer);
	toastTimer = setTimeout(() => { toastMessage = null; }, 2400);
}

export const favoritesStore = {
	get count() { return ids.size; },
	get toast() { return toastMessage; },
	has(id: number) { return ids.has(id); },

	async init(userId: string | null) {
		if (!userId) { ids = new Set(); return; }
		try {
			const res = await fetch('/api/favorites');
			if (!res.ok) { console.error('[favorites] init failed, status:', res.status); return; }
			const { ids: gameIds } = (await res.json()) as { ids: number[] };
			ids = new Set(gameIds);
		} catch (err) {
			console.error('[favorites] init error:', err);
		}
	},

	async toggle(id: number, game: GameCard) {
		const next = new Set(ids);

		if (next.has(id)) {
			// Mise à jour optimiste : on retire visuellement avant la réponse du serveur,
			// puis on remet si ça échoue. L'UX est bien meilleure comme ça.
			next.delete(id);
			ids = next;
			showToast('Removed from favorites');

			try {
				const res = await fetch(`/api/favorites?game_id=${id}`, { method: 'DELETE' });
				if (!res.ok) {
					console.error('[favorites] delete failed:', res.status, await res.text());
					const rollback = new Set(ids);
					rollback.add(id);
					ids = rollback;
					showToast('Could not remove favorite — try again.');
				}
			} catch (err) {
				console.error('[favorites] delete error:', err);
				const rollback = new Set(ids);
				rollback.add(id);
				ids = rollback;
				showToast('Could not remove favorite — try again.');
			}
		} else {
			// Optimistic add
			next.add(id);
			ids = next;
			showToast('Added to favorites ♥');

			try {
				const res = await fetch('/api/favorites', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						game_id: id,
						game_slug: game.slug,
						game_name: game.name,
						game_cover: game.cover,
						game_rating: game.rating,
						game_genres: game.genres
					})
				});
				if (!res.ok) {
					console.error('[favorites] insert failed:', res.status, await res.text());
					const rollback = new Set(ids);
					rollback.delete(id);
					ids = rollback;
					showToast('Could not save favorite — try again.');
				}
			} catch (err) {
				console.error('[favorites] insert error:', err);
				const rollback = new Set(ids);
				rollback.delete(id);
				ids = rollback;
				showToast('Could not save favorite — try again.');
			}
		}
	}
};
