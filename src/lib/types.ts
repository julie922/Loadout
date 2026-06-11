export interface RawgGame {
	id: number;
	slug: string;
	name: string;
	released: string;
	background_image: string | null;
	rating: number;
	ratings_count: number;
	metacritic: number | null;
	playtime: number;
	genres: RawgGenre[];
	platforms: RawgPlatformParent[] | null;
	developers?: RawgDeveloper[];
	short_screenshots: RawgScreenshot[];
	description_raw?: string;
}

export interface RawgGenre {
	id: number;
	name: string;
	slug: string;
}

export interface RawgPlatformParent {
	platform: {
		id: number;
		name: string;
		slug: string;
	};
}

export interface RawgDeveloper {
	id: number;
	name: string;
}

export interface RawgScreenshot {
	id: number;
	image: string;
}

export interface RawgListResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: RawgGame[];
}

export interface RawgFilters {
	page?: number;
	pageSize?: number;
	search?: string;
	genres?: string;
	platforms?: string;
	ordering?: string;
}

export interface GameCard {
	id: number;
	slug: string;
	name: string;
	released: string;
	cover: string | null;
	score: number | null;
	rating: number;
	genres: string[];
	platforms: string[];
	developer: string;
	blurb: string;
}

export interface GameDetail extends GameCard {
	description: string;
	screenshots: string[];
}
