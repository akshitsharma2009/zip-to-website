import { createFileRoute } from "@tanstack/react-router";
import { rankRecordings } from "@/lib/song-ranking";

/**
 * Song catalog API — ported from the archive's `songs` edge function.
 * POST /api/public/songs with JSON body { action: "search" | "add", ... }
 *
 * - "search": proxies MusicBrainz's recording search (no writes) and
 *   re-ranks results so the original artist-and-title recording outranks
 *   covers and mashups.
 * - "add": inserts a song into the catalog, deduplicated by its MusicBrainz
 *   ID (mbid). Uses the privileged server client because the songs table
 *   intentionally has no client-side INSERT policy.
 */

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const musicBrainzUserAgent = "Envoke/1.0 (https://envoke.lovable.app)";

interface MusicBrainzRecording {
  id: string;
  title: string;
  "first-release-date"?: string;
  "artist-credit"?: Array<{ name: string; joinphrase?: string }>;
  releases?: unknown[];
}

interface SongSearchResult {
  mbid: string;
  title: string;
  artist: string;
  year: number | null;
  /** Ranking helper only; stripped from the API response. */
  releaseCount: number;
}

interface SongRow {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  mbid: string;
  youtube_video_id: string | null;
  created_at: string;
}

interface SongAddDependencies {
  findExisting: (mbid: string) => Promise<{ data: SongRow | null; error: { message: string } | null }>;
  fetchRecording: (mbid: string) => Promise<Response>;
  insertIfAbsent: (song: { mbid: string; title: string; artist: string; year: number | null }) => Promise<{
    data: SongRow | null;
    error: { message: string } | null;
  }>;
  findAfterConflict: (mbid: string) => Promise<{ data: SongRow | null; error: { message: string } | null }>;
}

export const Route = createFileRoute("/api/public/songs")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        let body: { action?: unknown; query?: unknown; mbid?: unknown };
        try {
          const parsed: unknown = await request.json();
          if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            throw new Error("A JSON object is required");
          }
          body = parsed as { action?: unknown; query?: unknown; mbid?: unknown };
        } catch {
          return Response.json(
            { error: "A JSON body is required" },
            { status: 400, headers: corsHeaders },
          );
        }

        if (body.action === "search") {
          return handleSearch(body);
        } else if (body.action === "add") {
          return handleAdd(body);
        }

        return Response.json(
          { error: "An 'action' field of 'search' or 'add' is required" },
          { status: 400, headers: corsHeaders },
        );
      },
    },
  },
});

async function handleSearch(body: { query?: unknown }): Promise<Response> {
  if (typeof body.query !== "string" || body.query.trim().length === 0) {
    return Response.json(
      { error: "A 'query' string is required" },
      { status: 400, headers: corsHeaders },
    );
  }

  const trimmed = body.query.trim();

  // Fetch a wider candidate pool, then re-rank so originals lead.
  const mbResponse = await fetch(
    `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(trimmed)}&fmt=json&limit=50`,
    {
      headers: {
        "User-Agent": musicBrainzUserAgent,
        Accept: "application/json",
      },
    },
  );

  if (!mbResponse.ok) {
    return Response.json(
      { error: `MusicBrainz request failed (${mbResponse.status})` },
      { status: 502, headers: corsHeaders },
    );
  }

  const mbData = (await mbResponse.json()) as { recordings?: MusicBrainzRecording[] };

  if (!mbData.recordings || mbData.recordings.length === 0) {
    return Response.json({ results: [] }, { headers: corsHeaders });
  }

  const results: SongSearchResult[] = mbData.recordings.map((rec) => {
    const artist = rec["artist-credit"]
      ? rec["artist-credit"].map((a) => a.name + (a.joinphrase ?? "")).join("")
      : "Unknown Artist";

    let year: number | null = null;
    if (rec["first-release-date"]) {
      const parsed = parseInt(rec["first-release-date"].slice(0, 4), 10);
      if (!isNaN(parsed)) year = parsed;
    }

    return {
      mbid: rec.id,
      title: rec.title,
      artist,
      year,
      // Ranking helper only; stripped from the response below.
      releaseCount: rec["releases"]?.length ?? 0,
    };
  });

  const ranked = rankRecordings(results, trimmed).map(
    ({ releaseCount: _releaseCount, ...song }) => song,
  );

  return Response.json({ results: ranked }, { headers: corsHeaders });
}

export async function handleAdd(
  body: { mbid?: unknown; [key: string]: unknown },
  suppliedDependencies?: SongAddDependencies,
): Promise<Response> {
  if (typeof body.mbid !== "string" || !isUuid(body.mbid.trim())) {
    return Response.json(
      { error: "A valid UUID 'mbid' is required" },
      { status: 400, headers: corsHeaders },
    );
  }

  const mbid = body.mbid.trim().toLowerCase();
  const dependencies = suppliedDependencies ?? (await createSongAddDependencies());
  const { data: existing, error: existingError } = await dependencies.findExisting(mbid);

  if (existingError) {
    return Response.json({ error: "Could not check the song catalog" }, { status: 500, headers: corsHeaders });
  }

  if (existing) {
    return Response.json(
      { song: existing as SongRow, created: false },
      { headers: corsHeaders },
    );
  }

  let musicBrainzResponse: Response;
  try {
    musicBrainzResponse = await dependencies.fetchRecording(mbid);
  } catch {
    return musicBrainzUnavailableResponse();
  }

  if (musicBrainzResponse.status === 404) {
    return Response.json({ error: "MusicBrainz has no recording with that MBID" }, { status: 404, headers: corsHeaders });
  }
  if (!musicBrainzResponse.ok) {
    return musicBrainzUnavailableResponse();
  }

  let recording: MusicBrainzRecording;
  try {
    recording = (await musicBrainzResponse.json()) as MusicBrainzRecording;
  } catch {
    return musicBrainzUnavailableResponse();
  }

  const title = typeof recording.title === "string" ? recording.title.trim() : "";
  const artist = recording["artist-credit"]
    ?.map((credit) => `${credit.name}${credit.joinphrase ?? ""}`)
    .join("")
    .trim();
  if (recording.id?.toLowerCase() !== mbid || !title || !artist) {
    return musicBrainzUnavailableResponse();
  }

  const yearMatch = recording["first-release-date"]?.match(/^(\d{4})/);
  const year = yearMatch ? Number(yearMatch[1]) : null;
  const { data: inserted, error: insertError } = await dependencies.insertIfAbsent({ mbid, title, artist, year });

  if (insertError) {
    return Response.json(
      { error: "Could not add the song to the catalog" },
      { status: 500, headers: corsHeaders },
    );
  }

  if (inserted) {
    return Response.json({ song: inserted, created: true }, { headers: corsHeaders });
  }

  const { data: rowAfterConflict, error: lookupError } = await dependencies.findAfterConflict(mbid);
  if (lookupError || !rowAfterConflict) {
    return Response.json({ error: "Could not retrieve the song from the catalog" }, { status: 500, headers: corsHeaders });
  }
  return Response.json({ song: rowAfterConflict, created: false }, { headers: corsHeaders });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value);
}

function musicBrainzUnavailableResponse(): Response {
  return Response.json(
    { error: "MusicBrainz is temporarily unavailable. Please try again shortly." },
    { status: 503, headers: corsHeaders },
  );
}

async function createSongAddDependencies(): Promise<SongAddDependencies> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return {
    findExisting: async (mbid) => supabaseAdmin.from("songs").select("*").eq("mbid", mbid).maybeSingle(),
    fetchRecording: async (mbid) =>
      fetch(`https://musicbrainz.org/ws/2/recording/${encodeURIComponent(mbid)}?fmt=json&inc=artists`, {
        headers: { "User-Agent": musicBrainzUserAgent, Accept: "application/json" },
      }),
    insertIfAbsent: async (song) =>
      supabaseAdmin
        .from("songs")
        .upsert(song, { onConflict: "mbid", ignoreDuplicates: true })
        .select("*")
        .maybeSingle(),
    findAfterConflict: async (mbid) => supabaseAdmin.from("songs").select("*").eq("mbid", mbid).maybeSingle(),
  };
}
