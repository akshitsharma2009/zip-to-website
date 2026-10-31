import { describe, expect, it } from "vitest";
import { rankRecordings, scoreRecording } from "@/lib/song-ranking";

// Shaped after real MusicBrainz responses for "Hotel California", including
// the original studio recording (0e0763cb-…) and typical cover/mashup noise.
const RESULTS = [
  { mbid: "wind-rhythms", title: "Hotel California (Eagles)", artist: "Wind Rhythms", year: 2001 },
  { mbid: "the-cover-ops", title: "Hotel California (Eagles)", artist: "The Cover Ops", year: 2016 },
  { mbid: "beast-of-damnation", title: "Hotel California (Eagles cover)", artist: "Beast of Damnation", year: 2019 },
  { mbid: "8bit", title: "Hotel California (8-Bit The Eagles Emulation)", artist: "8-Bit Arcade", year: 2019 },
  { mbid: "pimpdaddy", title: "Hotel California Hurts (Lizzo vs. The Eagles)", artist: "Pimpdaddysupreme", year: 2021 },
  { mbid: "original", title: "Hotel California", artist: "Eagles", year: 1977 },
];

describe("rankRecordings", () => {
  it("ranks the original Eagles recording first when the artist is part of the query", () => {
    const ranked = rankRecordings(RESULTS, "Hotel California Eagles");
    expect(ranked[0].mbid).toBe("original");
  });

  it("ranks covers and mashups below the original", () => {
    const ranked = rankRecordings(RESULTS, "Hotel California Eagles");
    const positions = new Map(ranked.map((r, i) => [r.mbid, i]));
    expect(positions.get("beast-of-damnation")!).toBeGreaterThan(positions.get("original")!);
    expect(positions.get("pimpdaddy")!).toBeGreaterThan(positions.get("original")!);
    expect(positions.get("8bit")!).toBeGreaterThan(positions.get("original")!);
  });

  it("keeps the original near the top on a title-only query", () => {
    const ranked = rankRecordings(RESULTS, "Hotel California");
    expect(ranked[0].mbid).toBe("original");
  });

  it("keeps MusicBrainz order for equally scored results", () => {
    const tied = [
      { mbid: "a", title: "Unknown Song", artist: "One", year: null },
      { mbid: "b", title: "Unknown Song", artist: "Two", year: null },
    ];
    expect(rankRecordings(tied, "Nonexistent Query").map((r) => r.mbid)).toEqual(["a", "b"]);
  });
});

describe("scoreRecording", () => {
  it("rewards the exact artist-and-title recording over variants", () => {
    const query = "Hotel California Eagles";
    const original = scoreRecording(RESULTS[5], query);
    const cover = scoreRecording(RESULTS[2], query);
    expect(original).toBeGreaterThan(cover);
  });

  it("penalises bracketed variant keywords such as '(Eagles cover)'", () => {
    const query = "Hotel California";
    const clean = scoreRecording({ mbid: "x", title: "Hotel California", artist: "Someone", year: null }, query);
    const cover = scoreRecording({ mbid: "y", title: "Hotel California (cover)", artist: "Someone", year: null }, query);
    expect(clean).toBeGreaterThan(cover);
  });
});
