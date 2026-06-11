let query = $state('');
let debounced = $state('');
let timer: ReturnType<typeof setTimeout> | null = null;

export const searchStore = {
	get query() { return query; },
	get debounced() { return debounced; },
	set(value: string) {
		query = value;
		if (timer) clearTimeout(timer);
		// 300ms : assez court pour paraître réactif, assez long pour ne pas
		// envoyer une requête à chaque frappe.
		timer = setTimeout(() => { debounced = value; }, 300);
	},
	clear() {
		query = '';
		debounced = '';
		if (timer) clearTimeout(timer);
	}
};
