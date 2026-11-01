---
name: Production glass CSS
description: A production-only backdrop-filter declaration loss found during a live UI audit.
---

Verify glass effects against production CSS and browser computed styles, not just source declarations or the Vite development server.

**Why:** A live audit found that the published stylesheet retained only the WebKit-prefixed backdrop-filter declaration. The source included both forms and development-browser tests had computed an 8px blur, but published Chrome computed no blur. The translucent fill, icon sizing and placement still looked correct, masking the difference.

**How to apply:** After changing glass styling, inspect the production build for the standard backdrop-filter declaration as well as the Safari-prefixed form. Check actual computed blur in a Chromium browser, and avoid claiming blur works from a development screenshot or source inspection alone.
