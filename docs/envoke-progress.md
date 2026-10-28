# Envoke — Progress Tracker

Update this file as work completes. Keep the current phase marked. Don't start a later phase's tasks before the current one is checked off, unless deliberately reordered with a note why.

## Verified
The project uses **Bolt's own built-in database and auth** (not a separate Supabase project, not Clerk) — confirmed to support Row Level Security. Both previously-open questions are now resolved:
1. **Private buckets + signed URLs: confirmed supported.** The image-privacy design works as designed.
2. **Account auto-linking: confirmed NOT supported.** Bolt's auth does not merge an email/password account with a Google account sharing the same email. Mitigation: check for an existing account by email before completing Google sign-in; if one exists, block it and direct the user to sign in with email/password instead (see Phase 1 task below).

## Phase 1 — Core loop  [CURRENT · v1]
- [x] Bolt project created with its built-in database provisioned
- [x] Auth: Bolt's built-in auth wired (sign up / login), Google OAuth confirmed working
- [ ] Google sign-in checks for an existing account with that email first; if found, blocks the signup and shows "An account with this email already exists — sign in with your email and password instead" (no auto-linking available)
- [x] Signup requires an explicit "I am 18 or older" affirmation
- [x] Privacy Policy, Terms & Conditions, and Community Guidelines drafted (`privacy-policy.md`, `terms-and-conditions.md`, `community-guidelines.md`) — placeholders (legal name, contact email, Grievance Officer, database region) still need filling in before publishing
- [x] Signup requires a separate, unchecked-by-default "I agree to the Terms & Conditions and Privacy Policy" checkbox (linking to both pages) before it can be submitted
- [x] Privacy, Terms, and Community Guidelines each get their own public route (no login required): `/privacy`, `/terms`, `/community-guidelines`
- [ ] Footer links to all three pages, present site-wide
- [x] Signup's Terms/Privacy links open in a new tab (not an in-page redirect), so in-progress signup fields aren't lost
- [x] Community Guidelines is linked from the footer, the memory composer, and the report dialog — no separate signup checkbox (already covered by the Terms' moderation clause)
- [x] `consent_log` table created: `user_id`, `policy_version`, `agreed_at` (default `now()`); RLS allows insert and select of own rows only — no update, no delete
- [x] Signup flow inserts one `consent_log` row immediately after a successful `auth.signUp()`, using the policy's current "Last updated" date as `policy_version`
- [ ] Account deletion: full deletion — removes the account plus every memory and image it owns (DPDP Section 12(3) erasure right)
- [ ] "Export my data" button next to account deletion — client-side aggregation of the user's own account info, memories, and `consent_log` rows (all already readable under existing RLS) into a downloaded JSON file; no new backend logic required
- [ ] `songs` table with `mbid` (MusicBrainz ID) as a **UNIQUE** column — this must exist before any song-insert logic is built
- [ ] Song search/insert flow: query MusicBrainz first, then `INSERT ... ON CONFLICT (mbid) DO NOTHING` to avoid duplicate races
- [x] `memories` table with `is_public` flag + RLS policy (public OR owner)
- [ ] Private `memory-images` storage bucket + `{memory_id}/{filename}` path convention
- [ ] Storage RLS policy on `memory-images` mirroring the memories visibility rule
- [ ] Image display always via short-lived `createSignedUrl()` — no permanent/public URLs anywhere in the app
- [ ] Song detail page (UI)
- [ ] Write-a-memory flow: text + optional image, defaults to private with a one-tap toggle to public, signup wall triggers before entry starts (not mid-draft)
- [ ] User can view their own memories (all, public + private)

## Phase 2 — Public discovery + listen  [v1]
- [ ] Public memory feed per song
- [ ] Homepage: search bar (song/artist) + recent memories feed (no "trending" yet)
- [ ] Browse/search by decade, artist, genre
- [ ] `youtube_video_id` field on `songs`, manually attached per song (admin action, not auto-search)
- [ ] Embedded YouTube playback on song page
- [ ] Report button on public memories

## Phase 3 — Social layer  [v2]
- [ ] Public user profiles (new accounts default to public, changeable anytime)
- [ ] `follows` table with `status` (approved / pending)
- [ ] Public-profile follow: instant, no approval
- [ ] Private-profile follow: creates `pending` request, requires owner approval before `approved`
- [ ] Private-profile enforcement: excluded from general browsing entirely; public memories visible only to approved followers, private memories visible only to the author
- [ ] Extend account deletion's cascade to also remove the user's follows/followers
- [ ] Extend data export to also include the user's follows/followers

## Phase 4 — Interactions  [v2]
- [ ] Likes/reactions — once live, enable real "trending" on the homepage (replaces the recent-only view)
- [ ] Comments (reassess whether still wanted before building)
- [ ] Notifications (follow request, follow approved, like, comment)
- [ ] Block + report users (not just content)
- [ ] Extend account deletion's cascade to also remove the user's likes and comments
- [ ] Extend data export to also include the user's likes and comments

## Phase 5 — Growth & scale  [v2]
- [ ] Home feed (following + trending)
- [ ] Usage analytics (which songs/eras get the most memories)
- [ ] Admin moderation tooling for reports

## Decision log
- Full social platform, not memory-only; building in phases
- Supabase for database (Postgres + RLS fits the privacy model) + Supabase native auth over Clerk (later superseded — see below)
- Switched to Bolt's own built-in database and auth instead of a standalone Supabase project — confirmed RLS-supported, private buckets + signed URLs confirmed supported
- Confirmed Bolt's auth does not auto-link an email/password account to a Google account sharing the same email — mitigated with a pre-signup email-collision check instead
- Open browsing model; signup wall only on write/react/follow, shown before the action starts
- Homepage: recent memories only until Phase 4; no faked "trending"
- Memory content: text + images only, video deferred
- MusicBrainz for song identity (`mbid` as unique key) — Spotify ruled out due to 2026 API access restrictions
- YouTube for playback, manually attached per song
- Two-mode follow system (open for public profiles, approval-gated for private) with private-profile content excluded from general browsing
- Memory images: private storage bucket + `storage.objects` RLS mirroring the memories rule + signed URLs only
- Defaults: new accounts default to public profile; memory composer defaults to private
- v1 = Phase 1-2 only (no social layer); v2 = Phase 3-5 together, so follow-approval (Phase 3) and its notification (Phase 4) ship in the same release
- Switched build platform from Apper to bolt.new (primary), with a git-push fallback to Lovable if Bolt credits run out — Apper required a paid plan to make a project private
- Minimum account age: 18 — avoids DPDP Act's verifiable-parental-consent requirement for under-18 users
- Account deletion: full deletion, not anonymization — per DPDP Act Section 12(3)'s erasure right
- Added `consent_log`: records signup consent with a server-set, insert-only timestamp and policy version
