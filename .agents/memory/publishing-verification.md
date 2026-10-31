---
name: Publishing verification
description: Prevent confusing a working development preview with the published Photos site.
---

Do not claim the public Photos 404 is fixed solely because the root preview and production build pass. Check the latest published build timestamp against when Photos was added.

**Why:** The user repeatedly reported the no-previewable-artifacts 404 after the app was ready locally; publishing history still contained only the earlier API-only version.

**How to apply:** Validate the committed web artifact manifest and its exact production build, then distinguish “ready to republish” from “verified live.” Publishing remains a user action. Confirm the new published build and public root separately after the user republishes.
