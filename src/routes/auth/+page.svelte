<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}
	const { form }: Props = $props();

	let mode = $state<'login' | 'register'>('login');

	type FormErrors = { email?: string; password?: string; general?: string };
	const errors = $derived(form?.errors as FormErrors | null | undefined);

	const BG_PALETTES = [
		['#3a0f2a', '#ff5470'],
		['#1a2a6c', '#4f78ff'],
		['#241b3a', '#9b6dff'],
		['#3d1f12', '#ff7a45'],
		['#102a43', '#2ec5ce'],
		['#0b3d4f', '#1ec8b0']
	];
</script>

<main class="page auth">
	<div class="auth-bg">
		{#each BG_PALETTES as [c0, c1]}
			<div class="auth-bg-tile" style="background: linear-gradient(135deg, {c0}, {c1})"></div>
		{/each}
		<div class="auth-bg-scrim"></div>
	</div>

	<div class="auth-card">
		<a href="/" class="brand brand-center">
			<span class="brand-mark">
				<svg viewBox="0 0 24 24" fill="none" width="22" height="22">
					<rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
					<circle cx="12" cy="14" r="3.5" stroke="currentColor" stroke-width="1.5"/>
					<path d="M12 10.5V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<circle cx="12" cy="6" r="1.5" fill="currentColor"/>
				</svg>
			</span>
			<span class="brand-name">Loadout</span>
		</a>

		<h1 class="auth-title">
			{mode === 'login' ? 'Welcome back' : 'Create your account'}
		</h1>
		<p class="auth-sub">
			{mode === 'login' ? 'Pick up where you left off.' : 'Start building your library in seconds.'}
		</p>

		<div class="auth-toggle">
			<button class={mode === 'login' ? 'on' : ''} onclick={() => (mode = 'login')}>Log in</button>
			<button class={mode === 'register' ? 'on' : ''} onclick={() => (mode = 'register')}
				>Register</button
			>
			<span class="auth-toggle-pill {mode}"></span>
		</div>

		<form class="auth-form" method="POST" action="?/{mode}" use:enhance>
			{#if mode === 'register'}
				<label class="field">
					<span class="field-label">Display name</span>
					<input name="username" placeholder="Nova" required minlength="2" />
				</label>
			{/if}

			<label class="field">
				<span class="field-label">Email</span>
				<input
					name="email"
					type="email"
					placeholder="you@email.com"
					required
					class={errors?.email ? 'err' : ''}
				/>
				{#if errors?.email}
					<span class="field-err">{errors.email}</span>
				{/if}
			</label>

			<label class="field">
				<span class="field-label">Password</span>
				<input
					name="password"
					type="password"
					placeholder="••••••••"
					required
					minlength="6"
					class={errors?.password ? 'err' : ''}
				/>
				{#if errors?.password}
					<span class="field-err">{errors.password}</span>
				{/if}
			</label>

			{#if errors?.general}
				<p class="field-err" style="text-align:center">{errors.general}</p>
			{/if}

			{#if mode === 'login'}
				<button type="button" class="auth-forgot">Forgot password?</button>
			{/if}

			<button class="btn btn-primary btn-lg btn-block" type="submit">
				{mode === 'login' ? 'Log in' : 'Create account'}
			</button>
		</form>



		<p class="auth-switch">
			{mode === 'login' ? 'New here? ' : 'Already have an account? '}
			<button onclick={() => (mode = mode === 'login' ? 'register' : 'login')}>
				{mode === 'login' ? 'Create an account' : 'Log in'}
			</button>
		</p>
	</div>
</main>
