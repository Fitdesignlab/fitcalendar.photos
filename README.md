# Fit Calendar Photos — fitcalendar.photos

Free event photo downloads, linked from Fit Calendar event pages. Independent from the Fit Calendar Repl (do not edit Fit Calendar from here).

## Run
```
npm install
npm run dev      # http://localhost:5173
npm run build && npm run preview
```

## Routes
- `/` — hero (Reelmark-style layout: badge, H1, curved draggable photo carousel, CTA) + login sheet.
- `/event/{eventId}` — **deep link from Fit Calendar** event page. Use the same eventId as Fit Calendar
  (e.g. `https://fitcalendar.photos/event/{eventId}`). Guard redirects unauthenticated users to `/?next=/event/{eventId}`;
  after login they return to the gallery.

## Auth
`src/lib/auth.ts` is a MOCK: "Continue with Google / Apple" sets a `fcp_session` cookie. Replace with real OAuth
(Firebase Auth / Supabase / Auth.js). Guard: `src/lib/RequireAuth.tsx`.

## Payments
`src/lib/ziina.ts` — Ziina Payment Intent stub, `PAYMENTS_ENABLED = false`. Downloads are free. Kept for later reactivation (server-side token + webhook TODOs).

## Brand (Fit Calendar, B&W)
- Logo: `public/fitcalendar-mark.png` (F mark from fitcalendar.com, 678×678). Header = F mark only, no wordmark.
- Colors: white `#FFFFFF`, soft `#F5F5F5`, ink `#000000`, secondary `#6E6E73`, hairlines `#E0E0E0`. Photos stay full color.
- Type: Inter Tight 700 (headline), Inter 400/500 (UI), Caveat 600 (hand notes).
- Placeholder photos: Unsplash sports images in `src/lib/photos.ts`.
