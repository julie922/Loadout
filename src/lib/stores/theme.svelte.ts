const STORAGE_KEY = 'loadout-theme';

function readPreference(): boolean {
	if (typeof localStorage === 'undefined') return true;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored !== null) return stored === 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

let dark = $state(true);

export const themeStore = {
	get dark() { return dark; },

	init() {
		dark = readPreference();
	},

	toggle() {
		dark = !dark;
		localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
	},

	set(value: boolean) {
		dark = value;
		localStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light');
	}
};
