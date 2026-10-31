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

- The Photos web application serves `/`; `/event/:eventId` must work on direct navigation and refresh.
- Google and Apple sign-in are explicitly requested demo stubs, not production authentication. Only public sample imagery is used.
- Downloads require demo sign-in. `PAYMENTS_ENABLED` stays `false`; Ziina remains inactive.

## User preferences

- Black and white, Reelmark-style hero; Fit Calendar F-mark only in the header, no wordmark.
- H1 exactly: "Your event. Your photos. One place."
- Subtitle exactly: "Find every shot from the race, the padel night, or the festival, then download them after you sign in."
- Do not add "free" to the subtitle.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
