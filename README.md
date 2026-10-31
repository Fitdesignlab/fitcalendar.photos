# Fit Calendar Photos

Source of truth: https://github.com/Fitdesignlab/fitcalendar.photos (branch `main`).

The Photos application lives in `artifacts/fitcalendar-photos` and serves the web root `/`. It uses Vite, React, and TypeScript. Existing workspace support packages are retained to preserve Replit's managed routing and tooling; the Photos skeleton does not require a database or the API server.

## Develop

```sh
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/fitcalendar-photos run dev
```

In Replit, run the managed **Fit Calendar Photos** web workflow instead; it supplies the port and root path.

## Validate and build

```sh
pnpm --filter @workspace/fitcalendar-photos run typecheck
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/fitcalendar-photos run build
```

Build output: `artifacts/fitcalendar-photos/dist/public`.

## Routes

- `/` — photo discovery homepage.
- `/event/:eventId` — event gallery, including a missing-event state.

The production artifact serves static build output at `/`, with an SPA rewrite to `/index.html` for direct event links.

## Sign-in and payments

Google and Apple sign-in are **explicit demo stubs**, not real OAuth. They do not collect credentials, create real accounts, or secure private images. A session-only demo sign-in unlocks downloads of public sample images. Replace these stubs with managed authentication and server-authorized downloads before adding private event photography.

`PAYMENTS_ENABLED` is hardcoded to `false`. Ziina is not connected, no payment credentials are needed, and no charge or checkout is initiated.

All example events and photos are demonstration content, not a live event catalogue.

## Republish

The Photos artifact's `.replit-artifact/artifact.toml` is the deployment configuration: static output at `/`, with deep-link rewrites. Use Replit's **Publish/Republish** action to update the existing deployment. Development changes do not alter the currently published site until republishing completes. Keep the existing `fitcalendar.photos` custom-domain assignment.

## GitHub

This workspace repository is connected to `Fitdesignlab/fitcalendar.photos` as `origin`; use `main` for the Photos source. Keep secrets, dependency folders, and generated build output out of commits.
