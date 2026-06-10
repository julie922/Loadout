export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					username: string;
					display_name: string | null;
					bio: string | null;
					avatar_url: string | null;
					member_since: string;
					updated_at: string;
					favorite_genres: string[] | null;
					platforms: string[] | null;
				};
				Insert: {
					id: string;
					username: string;
					display_name?: string | null;
					bio?: string | null;
					avatar_url?: string | null;
					member_since?: string;
					updated_at?: string;
					favorite_genres?: string[] | null;
					platforms?: string[] | null;
				};
				Update: {
					id?: string;
					username?: string;
					display_name?: string | null;
					bio?: string | null;
					avatar_url?: string | null;
					updated_at?: string;
					favorite_genres?: string[] | null;
					platforms?: string[] | null;
				};
				Relationships: [];
			};
			favorites: {
				Row: {
					id: number;
					user_id: string;
					game_id: number;
					game_slug: string;
					game_name: string;
					game_cover: string | null;
					game_rating: number | null;
					game_genres: string[] | null;
					created_at: string;
				};
				Insert: {
					user_id: string;
					game_id: number;
					game_slug: string;
					game_name: string;
					game_cover?: string | null;
					game_rating?: number | null;
					game_genres?: string[] | null;
					created_at?: string;
				};
				Update: {
					game_cover?: string | null;
					game_rating?: number | null;
					game_genres?: string[] | null;
				};
				Relationships: [];
			};
		};
		Views: { [_ in never]: never };
		Functions: { [_ in never]: never };
		Enums: { [_ in never]: never };
	};
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];
