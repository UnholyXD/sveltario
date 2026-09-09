<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/global.css';
	import { Toaster } from 'svelte-sonner';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
<Toaster
	position="top-right"
	theme="dark"
	richColors
	offset="1rem"
	mobileOffset={{ top: '4.5rem', right: '0.5rem', left: '0.5rem' }}
	toastOptions={{ duration: 3500 }}
/>
