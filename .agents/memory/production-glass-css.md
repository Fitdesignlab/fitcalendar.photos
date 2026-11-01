---
name: Production glass CSS
description: A production-only backdrop-filter declaration loss found during a live UI audit.
---

Declare the WebKit-prefixed backdrop-filter before the standard backdrop-filter, with identical values. Keep the standard declaration last, and verify glass effects against production CSS and browser computed styles.

**Why:** This build pipeline dropped the standard declaration when the WebKit-prefixed declaration came last. Development-browser tests computed blur while published Chrome computed none. Prefix-first, standard-last ordering preserves both in the minified production stylesheet. Translucent fill and correct sizing can mask the missing blur in screenshots.

**How to apply:** After changing glass styling, inspect the production build for the standard backdrop-filter declaration as well as the Safari-prefixed form. Check actual computed blur in a Chromium browser, and avoid claiming blur works from a development screenshot or source inspection alone.
