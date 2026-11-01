---
name: Main-site footer parity
description: Why the Photos landing footer follows the live FitCalendar footer instead of Photos design tokens.
---

The multi-column landing footer must match the currently published fitcalendar.com footer exactly, not a Photos-styled interpretation. The small existing Powered by lockup stays above it.

**Why:** The user explicitly repeated that layout, wording, logo placement, styling, columns and legal controls must be identical. Earlier approximations changed typography, spacing, social controls and the navigation heading.

**How to apply:** Inspect the live footer DOM and rendered styles at desktop, tablet and phone widths before changing it. Use the actual uncropped F artwork and preserve the source navigation heading “FitCalendar” as a navigation label, rather than substituting a stylized wordmark for that heading. Other actual brand marks remain images. Resolve main-site navigation and legal links to the main site; do not install its analytics merely to reproduce the Cookie settings control.

Computed translucent backgrounds alone do not establish visual parity across sites with different page backgrounds. The main site's footer blends over a non-white body; Photos remains white elsewhere. Gradient-based emulation can also round or dither colours differently.

**Why:** Matching the source's alpha declaration over Photos' white body produced a different rendered colour, and layering a gradient over the source base still differed in screenshot pixels.

**How to apply:** Compare the rendered footer colour against the reference and isolate its composited background locally. Do not change the whole Photos page background to compensate.
