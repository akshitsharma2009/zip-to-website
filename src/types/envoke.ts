export interface ConsentLog {
  id: string;
  user_id: string;
  policy_version: string;
  agreed_at: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  mbid: string;
  youtube_video_id: string | null;
  created_at: string;
}

export interface SongSearchResult {
  mbid: string;
  title: string;
  artist: string;
  year: number | null;
}
