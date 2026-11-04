/**
 * Re-ranking for MusicBrainz recording search results.
 *
 * MusicBrainz's default relevance buries the original studio recording under
 * covers, tributes, mashups and 8-bit variants (observed with "Hotel
 * California"). These helpers score each result so an exact artist-and-title
 * match with no variant keywords outranks covers and mashups while keeping
 * MusicBrainz's own order as the tiebreaker.
 */

export interface RankableSong {
  mbid: string;
  title: string;
  artist: string;
  year: number | null;
}

/** Keywords that mark a result as a cover / variant rather than the original. */
const VARIANT_PATTERN = new RegExp(
  [
    "covers?",
    "covered",
    "tributes?",
    "karaoke",
    "mash[- ]?ups?",
    "\\bvs\\.?\\b",
    "versus",
    "remix(?:es|ed)?",
    "rework(?:ed|s)?",
    "\\bmedley\\b",
    "\\bmix(?:ed|es)?\\b",
    "acoustic(?:ally)?",
    "unplugged",
    "instrumental",
    "8[- ]?bit",
    "chiptune",
    "emulation",
    "parod(?:y|ies)",
    "spoof",
    "in the style of",
    "\\blive\\b",
    "bootleg",
  ].join("|"),
  "i",
);

const STOPWORDS = new Set(["the", "a", "an"]);

/** Lowercase, strip punctuation and bracketed qualifiers, drop stopwords. */
function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[([{][^)\]}]*[)\]}]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

/**
 * Query tokens that belong to an artist's name rather than a song title:
 * tokens that appear in some candidate's full artist name when that whole
 * name is present in the query (e.g. "eagles" for "Hotel California Eagles").
 */
function artistLikeTokens(recordings: RankableSong[], queryTokens: string[]): Set<string> {
  const tokens = new Set<string>();
  for (const recording of recordings) {
    const artistTokens = tokenize(recording.artist);
    if (artistTokens.length > 0 && artistTokens.every((t) => queryTokens.includes(t))) {
      artistTokens.forEach((t) => tokens.add(t));
    }
  }
  return tokens;
}

/**
 * Score one recording against the raw query. Higher is better; identical
 * scores fall back to MusicBrainz's original ordering (stable sort).
 *
 * `artistNames` (from {@link artistLikeTokens}) keeps tokens that belong to a
 * queried artist's name from earning title credit — otherwise cover titles
 * like "Song - The Eagles" outscore the original.
 */
export function scoreRecording(
  song: RankableSong,
  rawQuery: string,
  artistNames: ReadonlySet<string> = new Set(),
): number {
  const queryTokens = tokenize(rawQuery);
  const artistTokens = tokenize(song.artist);
  const titleTokens = tokenize(song.title).filter(
    (t) => !artistNames.has(t) || artistTokens.includes(t),
  );
  // Variant keywords are scanned on the raw text so bracketed qualifiers such
  // as "(Eagles cover)" are caught too.
  const haystack = `${song.title} ${song.artist}`.toLowerCase();

  let score = 0;

  const titleMatches = queryTokens.filter((t) => titleTokens.includes(t));
  const artistMatches = queryTokens.filter((t) => artistTokens.includes(t));
  score += 10 * titleMatches.length;
  score += 5 * artistMatches.length;

  // The full title (and artist) appear in the query — strong original signal.
  if (titleTokens.length > 0 && titleTokens.every((t) => queryTokens.includes(t))) {
    score += 15;
  }
  if (artistTokens.length > 0 && artistTokens.every((t) => queryTokens.includes(t))) {
    score += 20;
  }

  // Exact title-only match when the query names just the song.
  const queryText = queryTokens.join(" ");
  if (titleTokens.join(" ") === queryText) {
    score += 25;
  }

  // Penalise covers, mashups and other variants. The penalty must outweigh
  // the extra title-token credit variant titles collect (e.g. medleys that
  // name several songs), so it stays above that ceiling.
  const variants = haystack.match(new RegExp(VARIANT_PATTERN.source, "gi"));
  score -= 25 * Math.min(variants?.length ?? 0, 3);

  return score;
}

/**
 * Re-rank recordings so originals lead; keeps MusicBrainz order on ties and
 * caps the list at `limit` entries (default 20).
 */
export function rankRecordings<T extends RankableSong>(
  recordings: T[],
  rawQuery: string,
  limit = 20,
): T[] {
  const artistNames = artistLikeTokens(recordings, tokenize(rawQuery));

  return recordings
    .map((recording, index) => ({
      recording,
      index,
      score: scoreRecording(recording, rawQuery, artistNames),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        yearTiebreak(a.recording.year, b.recording.year) ||
        a.index - b.index,
    )
    .slice(0, limit)
    .map(({ recording }) => recording);
}

/** Earlier release years win the tie — originals predate their covers. */
function yearTiebreak(a: number | null, b: number | null): number {
  if (a === null || b === null) return (a === null ? 1 : 0) - (b === null ? 1 : 0);
  return a - b;
}
