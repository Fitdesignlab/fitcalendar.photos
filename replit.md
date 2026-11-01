# Fit Calendar Photos

Event photo discovery for races, padel nights, and festivals. Source of truth: https://github.com/Fitdesignlab/fitcalendar.photos on `main`.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

- The Photos web application serves the unchanged landing hero at `/`, an events list at `/events`, and galleries at `/event/:eventId`. All routes must work on direct navigation and refresh.
- Google sign-in uses the user's existing Web Client through official GIS, not managed Clerk auth. Verify ID tokens on the API server and use encrypted HttpOnly sessions; never accept the old demo browser state.
- The supplied Google origins are fitcalendar.photos and fit-fotos.replit.app. Preview sign-in stays unavailable unless the user explicitly adds an authorized Google origin. Never silently fall back to demo auth.
- Apple remains a disabled stub because no Apple credentials are configured. Show a black button with white Apple logo and "Continue with Apple", matching the official Google button dimensions. Do not restore the removed inactive/coming-soon helper line. Downloads require a server-verified Google session. `PAYMENTS_ENABLED` stays `false`; Ziina remains inactive.
- Sample display images remain public. Server-gated downloads do not make public preview images private; use private storage before accepting private photography.

## User preferences

- White one-screen Reelmark-style landing hero with a curved, draggable sports photo carousel. UI is strictly black, white and neutral grey; full-colour real sports photos are the only colour.
- The homepage carousel must span the browser edge to edge, independently of the scaled hero frame. Fill wide screens with more repeated photo cards, not gigantic cards. Preserve the curved trapezoid shape, auto-scroll and dragging.
- Fit Calendar / FitCalendar must never appear as plain visual brand text; always use the logo image. Keep paragraph/sentence copy unchanged. This applies to homepage header, sign-in modal, landing footer, events/gallery header and events/gallery footer.
- Homepage header uses the black FITCALENDAR wordmark image with small geometric .PHOTOS text next to it. The wordmark has aggressive italic FIT and upright CALENDAR. Implement from supplied specs; do not wait on a Figma connector. No em dashes in rendered UI.
- Homepage "Get your photos" CTA is a standalone solid black pill, without an outer dashed border or outline.
- Image-card downloads match Glass circle 5:9 specs: 30px circle, white fill at 14%, 0.6px white border at 22%, 8px backdrop blur, white 14px tray-arrow glyph, bottom-right inset about 12px. Do not add category chips.
- Landing Log in, Sign up and Get your photos actions open Google sign-in, then go to `/events`. Gallery download sign-in must still resume its pending download without redirecting.
- H1 exactly: "Your event. Your photos. One place."
- Subtitle exactly: "Find every shot from the race, the padel night, or the festival, then download them after you sign in."
- Do not add "free" to the subtitle.
- The landing footer is the full FitCalendar footer with directory/about/contact/social links, copyright and legal links, below the unchanged hero and outside its scaled frame. Keep a centered Powered by block above its columns: small muted label on one line, black wordmark logo image directly below. No App Store/Play badges unless already present.
- Keep the sign-in modal free of the removed grey account-verification/session-data/sample-photos disclaimer box. Preserve its other title, description and provider controls.
- `/terms` reproduces the complete Terms of Use from https://fitcalendar.com/terms, dated 13 October 2026. Do not invent legal text or silently rewrite its substance. Privacy links use https://fitcalendar.com/privacy.
- The source Terms mention Clerk and directory features because the user requested the existing text verbatim. This is not an instruction to migrate Photos authentication from Google GIS to Clerk; Photos-specific legal wording needs operator review.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
