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

- `/` — black-and-white Reelmark-style hero with a curved photo carousel.
- `/events` — sample event cards with name, date, place and cover photo.
- `/event/:eventId` — event gallery, including a missing-event state.

The production artifact serves static build output at `/`, with an SPA rewrite to `/index.html` for direct event links.

## Sign-in and payments

Google sign-in uses Google's official Identity Services button. The API verifies the ID token's signature, audience, issuer, expiry, verified email and login nonce with `google-auth-library`. A seven-day encrypted HttpOnly cookie stores the verified user's Google subject ID, name, email and picture. The cookie is Secure in production, SameSite=Lax, host-only and scoped to `/api`. Browser storage is not accepted as authentication.

Configuration is server-side: `GOOGLE_CLIENT_ID` (public Web Client ID), `GOOGLE_ALLOWED_ORIGINS` (comma-separated exact origins), and the existing `SESSION_SECRET` (secret, used to encrypt/authenticate cookies). No Google client secret is needed for this GIS ID-token flow. The frontend receives the public Client ID and a short-lived nonce from `/api/auth/config`, so the static frontend does not require a Client ID baked into its build.

Google's configured JavaScript origins are `https://fitcalendar.photos` and `https://fit-fotos.replit.app`. Sign-in on other origins, including the development preview, is intentionally unavailable with clear links to the published sites. Do not add a demo fallback. Real Google account selection and consent must be confirmed on an authorized origin after republishing.

Normal sign-in goes to `/events`. Sign-in requested by a download resumes that download without leaving its gallery. `/api/photos/download` requires a valid Google session and only serves allowlisted sample files. Apple is disabled with a clear message and cannot create a session or unlock downloads.

The sample display images still live in public static folders and can be viewed without authentication. They are not private photos. Before adding private event photography, move originals to private storage with server-authorized access rather than treating these public preview URLs as secure.

Run `pnpm --filter @workspace/api-server test` for authentication/session/download security tests. Successful profile issuance tests use a synthetic verifier only inside an isolated test server; the running app always uses Google's verifier. A full real-account OAuth test requires the user's Google consent on an authorized published origin.

`PAYMENTS_ENABLED` is hardcoded to `false`. Ziina is not connected, no payment credentials are needed, and no charge or checkout is initiated.

All example events and photos are demonstration content, not a live event catalogue.

## Republish

The Photos artifact's `.replit-artifact/artifact.toml` is the deployment configuration: static output at `/`, with deep-link rewrites. Use Replit's **Publish/Republish** action to update the existing deployment. Development changes do not alter the currently published site until republishing completes. Keep the existing `fitcalendar.photos` custom-domain assignment.

## GitHub

This workspace repository is connected to `Fitdesignlab/fitcalendar.photos` as `origin`; use `main` for the Photos source. Keep secrets, dependency folders, and generated build output out of commits.
