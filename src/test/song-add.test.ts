import { describe, expect, it, vi } from "vitest";
import { handleAdd } from "@/routes/api/public/songs";

const realMbid = "f18334f8-a985-4719-b14a-d4e54572ee1f";
const row = {
  id: "c10292f3-4d1f-4f26-9535-26e2ee74a0ed",
  mbid: realMbid,
  title: "Hotel California",
  artist: "Eagles",
  year: 1977,
  youtube_video_id: null,
  created_at: "2026-11-12T00:00:00.000Z",
};

function makeDependencies(overrides: Record<string, unknown> = {}) {
  return {
    findExisting: vi.fn(async () => ({ data: null, error: null })),
    fetchRecording: vi.fn(async () =>
      Response.json({
        id: realMbid,
        title: "Hotel California",
        "first-release-date": "1977-12-08",
        "artist-credit": [{ name: "Eagles" }],
      }),
    ),
    insertIfAbsent: vi.fn(async () => ({ data: row, error: null })),
    findAfterConflict: vi.fn(async () => ({ data: row, error: null })),
    ...overrides,
  };
}

async function readResponse(response: Response) {
  return { status: response.status, body: await response.json() };
}

describe("handleAdd", () => {
  it("rejects a malformed MBID without calling the catalog or MusicBrainz", async () => {
    const dependencies = makeDependencies();
    const response = await handleAdd({ mbid: "not-a-uuid" }, dependencies);

    expect(response.status).toBe(400);
    expect(dependencies.findExisting).not.toHaveBeenCalled();
    expect(dependencies.fetchRecording).not.toHaveBeenCalled();
  });

  it("reuses an existing song without requesting MusicBrainz", async () => {
    const dependencies = makeDependencies({ findExisting: vi.fn(async () => ({ data: row, error: null })) });
    const response = await handleAdd({ mbid: realMbid, title: "tampered" }, dependencies);

    expect(await readResponse(response)).toEqual({ status: 200, body: { song: row, created: false } });
    expect(dependencies.fetchRecording).not.toHaveBeenCalled();
  });

  it("returns 404 and inserts nothing when MusicBrainz does not know the MBID", async () => {
    const dependencies = makeDependencies({ fetchRecording: vi.fn(async () => new Response(null, { status: 404 })) });
    const response = await handleAdd({ mbid: realMbid }, dependencies);

    expect(response.status).toBe(404);
    expect(dependencies.insertIfAbsent).not.toHaveBeenCalled();
  });

  it("stores MusicBrainz metadata and ignores caller-supplied song fields", async () => {
    const dependencies = makeDependencies();
    const response = await handleAdd(
      { mbid: realMbid, title: "Wrong title", artist: "Wrong artist", year: 1900 },
      dependencies,
    );

    expect(await readResponse(response)).toEqual({ status: 200, body: { song: row, created: true } });
    expect(dependencies.insertIfAbsent).toHaveBeenCalledWith({
      mbid: realMbid,
      title: "Hotel California",
      artist: "Eagles",
      year: 1977,
    });
  });

  it("returns the existing row when a concurrent add wins the unique-MBID insert", async () => {
    const dependencies = makeDependencies({ insertIfAbsent: vi.fn(async () => ({ data: null, error: null })) });
    const response = await handleAdd({ mbid: realMbid }, dependencies);

    expect(await readResponse(response)).toEqual({ status: 200, body: { song: row, created: false } });
    expect(dependencies.findAfterConflict).toHaveBeenCalledWith(realMbid);
  });

  it("returns a retry-shortly error and inserts nothing when MusicBrainz is unavailable", async () => {
    const dependencies = makeDependencies({ fetchRecording: vi.fn(async () => new Response(null, { status: 503 })) });
    const response = await handleAdd({ mbid: realMbid }, dependencies);

    expect(await readResponse(response)).toEqual({
      status: 503,
      body: { error: "MusicBrainz is temporarily unavailable. Please try again shortly." },
    });
    expect(dependencies.insertIfAbsent).not.toHaveBeenCalled();
  });
});