<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Envoke was migrated from an external Bolt-built archive (user-uploads://Envoke-main.zip). Keep the source URL set intact: /auth is the entry screen (/ redirects there), plus /dashboard, /terms, /privacy, /community-guidelines. Auth component pages live in src/components/envoke/, route files in src/routes/.
- The dark ink/brass theme and Envoke colors (ink, cream, panel, meta-light, meta-dark, brass, brass-hover, sage) are semantic tokens in src/styles.css; never hardcode them in components. Fonts load via <link> in src/routes/__root.tsx.
- The song catalog API stays at POST /api/public/songs (search via MusicBrainz, add via supabaseAdmin with mbid dedup). songs has no client-side INSERT policy by design; mbid is the only valid song identity key and its UNIQUE constraint must never be removed.
- consent_log is insert-only (no UPDATE/DELETE policies) to preserve the signup consent audit trail; POLICY_VERSION in src/lib/envoke-constants.ts must match the policy pages' "Last updated" date.
