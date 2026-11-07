import { describe, expect, it } from "vitest";
import { rankRecordings, scoreRecording } from "@/lib/song-ranking";

// Shaped after real MusicBrainz responses for "Hotel California", including
// the original studio recording (0e0763cb-…) and typical cover/mashup noise.
const RESULTS = [
  { mbid: "wind-rhythms", title: "Hotel California (Eagles)", artist: "Wind Rhythms", year: 2001, releaseCount: 2 },
  { mbid: "the-cover-ops", title: "Hotel California (Eagles)", artist: "The Cover Ops", year: 2016, releaseCount: 1 },
  { mbid: "beast-of-damnation", title: "Hotel California (Eagles cover)", artist: "Beast of Damnation", year: 2019, releaseCount: 1 },
  { mbid: "8bit", title: "Hotel California (8-Bit The Eagles Emulation)", artist: "8-Bit Arcade", year: 2019, releaseCount: 1 },
  { mbid: "pimpdaddy", title: "Hotel California Hurts (Lizzo vs. The Eagles)", artist: "Pimpdaddysupreme", year: 2021, releaseCount: 1 },
  { mbid: "machalski", title: "Hotel California - The Eagles", artist: "Tadeusz Machalski", year: null, releaseCount: 2 },
  { mbid: "original", title: "Hotel California", artist: "Eagles", year: 1977, releaseCount: 30 },
];

describe("rankRecordings", () => {
  it("ranks the original Eagles recording first when the artist is part of the query", () => {
    const ranked = rankRecordings(RESULTS, "Hotel California Eagles");
    expect(ranked[0]!.mbid).toBe("original");
  });

  it("ranks covers and mashups below the original", () => {
    const ranked = rankRecordings(RESULTS, "Hotel California Eagles");
    const positions = new Map(ranked.map((r, i) => [r.mbid, i]));
    expect(positions.get("beast-of-damnation")!).toBeGreaterThan(positions.get("original")!);
    expect(positions.get("pimpdaddy")!).toBeGreaterThan(positions.get("original")!);
    expect(positions.get("8bit")!).toBeGreaterThan(positions.get("original")!);
  });

  it("does not let cover titles naming the artist outscore the original", () => {
    // "Hotel California - The Eagles" by another artist must not beat the
    // original by borrowing the artist's name into its title.
    const ranked = rankRecordings(RESULTS, "Hotel California Eagles");
    const positions = new Map(ranked.map((r, i) => [r.mbid, i]));
    expect(positions.get("machalski")!).toBeGreaterThan(positions.get("original")!);
  });

  it("keeps the original near the top on a title-only query", () => {
    const ranked = rankRecordings(RESULTS, "Hotel California");
    expect(ranked[0]!.mbid).toBe("original");
  });

  it("uses release count to promote an original with no release year over dated covers", () => {
    const undated = [
      { mbid: "cover-1977", title: "Hotel California", artist: "Shuky & Aviva", year: 1977, releaseCount: 2 },
      { mbid: "original-undated", title: "Hotel California", artist: "Eagles", year: null, releaseCount: 30 },
      { mbid: "cover-1994", title: "Hotel California", artist: "The Nashville SuperPickers", year: 1994, releaseCount: 1 },
    ];
    expect(rankRecordings(undated, "Hotel California")[0]!.mbid).toBe("original-undated");
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
    const original = scoreRecording(RESULTS[5]!, query);
    const cover = scoreRecording(RESULTS[2]!, query);
    expect(original).toBeGreaterThan(cover);
  });

  it("penalises bracketed variant keywords such as '(Eagles cover)'", () => {
    const query = "Hotel California";
    const clean = scoreRecording({ mbid: "x", title: "Hotel California", artist: "Someone", year: null }, query);
    const cover = scoreRecording({ mbid: "y", title: "Hotel California (cover)", artist: "Someone", year: null }, query);
    expect(clean).toBeGreaterThan(cover);
  });
});
