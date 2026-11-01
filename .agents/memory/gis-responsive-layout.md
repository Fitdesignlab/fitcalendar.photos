---
name: Responsive GIS layout
description: Avoiding a native Google button min-content sizing cycle inside responsive dialogs.
---

Constrain the modal grid track with minmax(0, 1fr) and allow the provider container and GIS host to shrink before measuring the host with ResizeObserver. Preserve Google's official rendered control rather than restyling its internals.

**Why:** A fixed-width native Google control can hold an implicit grid track's min-content width. Merely setting a responsive modal width and watching the host does not help if the host never shrinks. Both provider buttons can have identical dimensions and the outer dialog can fit the viewport while its content still clips and develops a horizontal scrollbar.

**How to apply:** Test opening and resizing the modal on narrow phones in both directions. Assert no horizontal overflow inside the dialog and that controls fit its padded content area, not merely that the two buttons match or that the dialog fits the browser.
