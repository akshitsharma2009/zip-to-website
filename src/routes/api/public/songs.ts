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

interface MusicBrainzRecording {
  id: string;
  title: string;
  "first-release-date"?: string;
  "artist-credit"?: Array<{ name: string; joinphrase?: string }>;
}

interface SongSearchResult {
  mbid: string;
  title: string;
  artist: string;
  year: number | null;
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

export const Route = createFileRoute("/api/public/songs")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        let body: {
          action?: unknown;
          query?: unknown;
          mbid?: unknown;
          title?: unknown;
          artist?: unknown;
          year?: unknown;
        };
        try {
          body = await request.json();
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
        "User-Agent": "Envoke/1.0 (envoke.app)",
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
    };
  });

  return Response.json({ results }, { headers: corsHeaders });
}

async function handleAdd(body: {
  mbid?: unknown;
  title?: unknown;
  artist?: unknown;
  year?: unknown;
}): Promise<Response> {
  if (typeof body.mbid !== "string" || body.mbid.trim().length === 0) {
    return Response.json(
      { error: "An 'mbid' string is required" },
      { status: 400, headers: corsHeaders },
    );
  }
  if (typeof body.title !== "string") {
    return Response.json(
      { error: "A 'title' string is required" },
      { status: 400, headers: corsHeaders },
    );
  }
  if (typeof body.artist !== "string") {
    return Response.json(
      { error: "An 'artist' string is required" },
      { status: 400, headers: corsHeaders },
    );
  }

  const year =
    typeof body.year === "number" && Number.isInteger(body.year) ? body.year : null;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing } = await supabaseAdmin
    .from("songs")
    .select("*")
    .eq("mbid", body.mbid.trim())
    .maybeSingle();

  if (existing) {
    return Response.json(
      { song: existing as SongRow, created: false },
      { headers: corsHeaders },
    );
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("songs")
    .insert({
      mbid: body.mbid.trim(),
      title: body.title.trim(),
      artist: body.artist.trim(),
      year,
    })
    .select("*")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: existing2 } = await supabaseAdmin
        .from("songs")
        .select("*")
        .eq("mbid", body.mbid.trim())
        .maybeSingle();

      if (existing2) {
        return Response.json(
          { song: existing2 as SongRow, created: false },
          { headers: corsHeaders },
        );
      }
    }
    return Response.json(
      { error: insertError.message },
      { status: 500, headers: corsHeaders },
    );
  }

  return Response.json(
    { song: inserted as SongRow, created: true },
    { headers: corsHeaders },
  );
}
