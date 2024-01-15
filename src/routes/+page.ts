import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('https://api.topradio.be/static/now-playing.json');
	const json = await res.json();
	const data = json as unknown as {
		stations: {
			potz: {
				artist: string;
				title: string;
				album_art: string;
			};
		};
	};

	return {
		...data.stations.potz
	};
};
