<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { Moon } from 'svelte-loading-spinners';

	let STREAM_URL = 'https://playerservices.streamtheworld.com/api/livestream-redirect/POTZ.mp3';

	export let data: PageData;

	// Local state.
	let interval: number;
	let status: 'paused' | 'playing' | 'loading' = 'paused';
	let audioTag: HTMLAudioElement | null = null;

	// Initialize HTML5 Audio.
	onMount(async function initAudioTag() {
		audioTag = document.getElementById('stream') as HTMLAudioElement;

		audioTag?.addEventListener('pause', () => {
			status = 'paused';
		});

		audioTag?.addEventListener('playing', () => {
			status = 'playing';
		});
	});

	// Retrieve data from the server initially.
	onMount(async function getData() {
		// Retrieve data from server.
		const res = await fetch('https://api.topradio.be/static/now-playing.json');
		const json = await res.json();
		const newData = json as unknown as {
			stations: {
				potz: {
					artist: string;
					title: string;
					album_art: string;
				};
			};
		};

		// Assign new data.
		data = newData.stations.potz;

		// Set MediaNavigator metadata.
		navigator.mediaSession.metadata = new MediaMetadata({
			title: data.title,
			artist: data.artist,
			artwork: [{ src: data.album_art }]
		});

		// Schedule function.
		clearInterval(interval);
		interval = setInterval(getData, 15 * 1000);
	});

	function handler() {
		if (!audioTag) {
			alert('Er is een fout opgetreden. Ga naar TOPradio.be om verder te luisteren.');
			return;
		}

		if (!audioTag.paused) {
			status = 'paused';
			audioTag.src = '';
			audioTag.pause();
			window.umami?.track('Pause');
		} else {
			status = 'loading';
			audioTag.src = STREAM_URL;
			audioTag.play();
			window.umami?.track('Play');
		}
	}
</script>

<svelte:head>
	<title>POTZ - Music is Love</title>
	<meta
		name="description"
		content="Steengoede dancemuziek, 24/7. POTZ is je nieuwe radiogezel op elk moment van de dag. Beluister ons online. Enjoy the ride."
	/>
</svelte:head>

<div class="flex flex-col gap-4 justify-center items-center w-screen h-screen-safe overflow-clip">
	<img src="/potz.png" class="w-32 h-32" alt="POTZ logo" />
	<p class="opacity-80 text-sm">Onze website wordt momenteel aangepast.</p>
	<div id="player" class="flex gap-4 items-center w-[300px]">
		<img class="h-16 w-16 shrink-0" src={data.album_art} alt="Album Art" />
		<div class="shrink overflow-hidden truncate">
			<p class="opacity-75 text-xs">{data.artist}</p>
			<p class="text-sm">{data.title}</p>
		</div>
		<div class="grow"></div>
		{#if status !== 'loading'}
			<button on:click={handler} class="shrink-0">
				<i class="bi bi-{status === 'paused' ? 'play-fill' : 'pause'} text-3xl pr-2"></i>
			</button>
		{:else}
			<div class="pr-4">
				<Moon color="#ffffff" size="20" unit="px" />
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	:root {
		@apply bg-neutral-900 text-white;
	}

	#player {
		@apply bg-indigo-800 font-medium rounded-md overflow-clip;
	}
</style>
