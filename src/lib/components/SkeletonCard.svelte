<script lang="ts">
	interface Props {
		variant?: 'classic' | 'overlay' | 'editorial';
	}
	const { variant = 'classic' }: Props = $props();
</script>

{#if variant === 'editorial'}
	<div class="card card-editorial skel">
		<div class="card-editorial-art sk sk-block"></div>
		<div class="card-editorial-body">
			<div class="sk sk-line w40"></div>
			<div class="sk sk-line w80"></div>
			<div class="sk sk-line w90"></div>
			<div class="sk sk-line w60"></div>
		</div>
	</div>
{:else if variant === 'overlay'}
	<div class="card card-overlay skel">
		<div class="card-overlay-art sk sk-block"></div>
	</div>
{:else}
	<div class="card card-classic skel">
		<div class="card-classic-art sk sk-block"></div>
		<div class="card-classic-body">
			<div class="sk sk-line w70"></div>
			<div class="sk sk-line w40"></div>
			<div class="sk sk-line w90"></div>
		</div>
	</div>
{/if}
