---
name: Wordmark provenance
description: Origin and limitations of the Photos header SVG and FitCalendar footer brand assets.
---

The active SVG logos reuse artwork from the main FitCalendar site's public `/wordmark.webp` and `/fitcalendar-mark.png` assets. Those white-on-transparent assets were normalized to black. The Photos header combines the wordmark with embedded Michroma lettering in one self-contained SVG; the footer uses the real stylized F mark and wordmark.

These SVGs contain embedded raster brand artwork, not newly traced vector paths or an official Figma export. The older standalone PNG wordmark was a browser export using Racing Sans One and Archivo Black; it is retained for compatibility, but is no longer the active header/footer logo.

**Why:** The user requested a single-line FITCALENDAR.PHOTOS SVG on every page and the actual main-site F mark in the footer. Reusing the site's artwork avoids another font-based approximation and preserves the image-only branding rule.

**How to apply:** Reuse the image rather than reconstructing the brand with HTML text. Do not describe the asset as retrieved from Figma. If an original official asset becomes available, use it as the reference for any replacement.
