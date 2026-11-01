import assert from 'node:assert/strict';
import { CAROUSEL_PITCH, carouselCardCount, carouselGeometry } from '../src/lib/carousel-geometry.ts';

const screens = [[390, 844], [820, 900], [1366, 768], [1440, 900], [1920, 1080], [2560, 1440], [3440, 1440], [3840, 2160], [5120, 1440], [7680, 2160]];
for (const [width, height] of screens) {
  const scale = width <= 820 ? width / 640 : Math.min(width / 1440, height / 1080, 1);
  const bandWidth = width / scale;
  const left = 720 - bandWidth / 2;
  const right = left + bandWidth;
  const count = carouselCardCount(bandWidth);
  const loop = count * CAROUSEL_PITCH;
  assert(count >= 60 && count % 10 === 0);
  assert.equal(carouselGeometry(0, bandWidth).w, 170);
  assert(carouselGeometry(loop / 2, bandWidth).xl > right, 'right seam must be offscreen');
  assert(carouselGeometry(-loop / 2, bandWidth).xr < left, 'left seam must be offscreen');
  for (let phase = 0; phase < loop; phase += 17) {
    const visible = [];
    for (let i = 0; i < count; i++) {
      let t = ((i * CAROUSEL_PITCH - phase) % loop + loop) % loop;
      if (t > loop / 2) t -= loop;
      const g = carouselGeometry(t, bandWidth);
      if (g.xr <= left || g.xl >= right) continue;
      visible.push(g);
      assert(g.w <= 234, 'cards must not grow to fill wide screens');
      assert(Math.max(g.hl, g.hr) <= 429, 'edge cards must stay bounded');
    }
    assert(visible.length > 1, 'row must never become a lone card');
    // Preserve the intentional inter-card spacing, but never leave frame gutters.
    assert(Math.min(...visible.map((g) => g.xl)) <= left + 55);
    assert(Math.max(...visible.map((g) => g.xr)) >= right - 55);
  }
  console.log(`PASS ${width}x${height}: ${count} looping cards, bounded sizes, both edges covered throughout loop`);
}
