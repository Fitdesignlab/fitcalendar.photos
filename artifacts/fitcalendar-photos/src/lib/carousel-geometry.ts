export const CAROUSEL_PITCH = 196;

// Repeat the ten existing assets at least six times. Wider viewports get more
// offscreen cards so wrapping always happens beyond the clipped browser edges.
export function carouselCardCount(width: number) {
  return Math.max(60, Math.ceil((width / CAROUSEL_PITCH + 12) / 10) * 10);
}

export function carouselGeometry(t: number, viewportWidth: number) {
  // Normalize curvature to the actual band, not the original 1440-unit frame.
  // Keep the original phone curvature and the original card dimensions.
  const radius = Math.max(706, viewportWidth / 2 - 14);
  const x = 720 + t * (1 + 0.083 * (t / radius) ** 2);
  const d = Math.min(1.15, Math.abs(x - 720) / radius);
  const w = 170 + 48 * d * d;
  const xl = x - w / 2, xr = x + w / 2;
  const hl = 280 + 92 * Math.min(1.2, Math.abs(xl - 720) / radius) ** 2.6;
  const hr = 280 + 92 * Math.min(1.2, Math.abs(xr - 720) / radius) ** 2.6;
  const cy = 687 - 12 * d * d;
  return { xl, xr, w, hl, hr, cy };
}
