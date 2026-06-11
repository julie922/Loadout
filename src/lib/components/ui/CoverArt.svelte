<script lang="ts">
	interface Props {
		cover: string | null;
		name: string;
	}
	const { cover, name }: Props = $props();

	const PALETTES: [string, string, string][] = [
		['#3a1d6e', '#7b2ff7', '#c9a8ff'],
		['#0b3d4f', '#1ec8b0', '#bff7ec'],
		['#5a1340', '#e84393', '#ffc1de'],
		['#1a2a6c', '#4f78ff', '#bcd0ff'],
		['#3d1f12', '#ff7a45', '#ffd2b8'],
		['#0f2e23', '#3ddc84', '#c7f5d9']
	];

	const { c0, c1, c2, ang, x1, y1, x2, y2, rot } = $derived.by(() => {

		const seed = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
		const [c0, c1, c2] = PALETTES[seed % PALETTES.length];
		return {
			c0, c1, c2,
			ang: 120 + (seed % 90),
			x1: 20 + (seed % 40),
			y1: 15 + ((seed * 7) % 45),
			x2: 60 + (seed % 30),
			y2: 55 + ((seed * 3) % 35),
			rot: (seed % 40) - 20
		};
	});
</script>

{#if cover}
	<img src={cover} alt={name} style="width:100%;height:100%;object-fit:cover;display:block;" />
{:else}
	<div class="cover" style="background: linear-gradient({ang}deg, {c0}, {c1})">
		<div
			class="cover-shape"
			style="left:{x1}%;top:{y1}%;background:{c2}"
		></div>
		<div
			class="cover-shape cover-shape-b"
			style="left:{x2}%;top:{y2}%;border-color:{c2};transform:rotate({rot}deg)"
		></div>
		<div class="cover-grain"></div>
		<div class="cover-vignette"></div>
	</div>
{/if}
