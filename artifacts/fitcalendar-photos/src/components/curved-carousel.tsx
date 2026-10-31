import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { Download } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;
export const LANDING_PHOTOS = [
  'Running', 'Padel', 'Cycling', 'Triathlon', 'Festival', 'Marathon', 'Padel doubles', 'Marathon finish', 'Triathlon swim', 'Indoor padel',
].map((label, i) => ({ src: `${BASE}landing/sport-${i}.jpg`, label }));

const N = LANDING_PHOTOS.length;
const PITCH = 196;
const LOOP = N * PITCH;
const AUTO = 50; // design units per second, right to left
const DECAY = 0.05; // momentum keeps 5% of itself after one second (95% decays)
const R = 15;

interface Band { left: number; top: number; width: number; height: number }
interface Props { scale: number; band: Band; onPick: () => void; reduced: boolean; className?: string }

function geo(t: number) {
  const x = 720 + t * (1 + 0.083 * (t / 706) ** 2);
  const d = Math.abs(x - 720) / 706;
  const w = 170 + 48 * d * d;
  const xl = x - w / 2, xr = x + w / 2;
  const hl = 280 + 92 * (Math.abs(xl - 720) / 706) ** 2.6;
  const hr = 280 + 92 * (Math.abs(xr - 720) / 706) ** 2.6;
  const cy = 687 - 12 * d * d;
  return { xl, xr, w, hl, hr, cy };
}

function roundedQuad(p: [number, number][]) {
  const n = p.length;
  let s = '';
  for (let i = 0; i < n; i++) {
    const [cx, cy] = p[i];
    const [ax, ay] = p[(i - 1 + n) % n];
    const [bx, by] = p[(i + 1) % n];
    const la = Math.hypot(ax - cx, ay - cy), lb = Math.hypot(bx - cx, by - cy);
    const r1 = Math.min(R, la / 2), r2 = Math.min(R, lb / 2);
    const sx = cx + ((ax - cx) / la) * r1, sy = cy + ((ay - cy) / la) * r1;
    const ex = cx + ((bx - cx) / lb) * r2, ey = cy + ((by - cy) / lb) * r2;
    s += `${i ? 'L' : 'M'}${sx.toFixed(2)} ${sy.toFixed(2)}Q${cx.toFixed(2)} ${cy.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  }
  return `path('${s}Z')`;
}

export function CurvedCarousel({ scale, band, onPick, reduced, className = '' }: Props) {
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const icons = useRef<(HTMLButtonElement | null)[]>([]);
  const st = useRef({ pos: 0, vel: 0, drag: false, lastX: 0, lastT: 0, moved: 0, focus: false });
  const cfg = useRef({ scale, band, reduced });
  cfg.current = { scale, band, reduced };

  useEffect(() => {
    let raf = 0, prev = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const s = st.current, { band: b, reduced: rm } = cfg.current;
      if (!s.drag) {
        if (Math.abs(s.vel) > 2) {
          s.pos += s.vel * dt;
          s.vel *= Math.pow(DECAY, dt);
        } else {
          s.vel = 0;
          if (!rm && !s.focus) s.pos += AUTO * dt;
        }
      }
      for (let i = 0; i < N; i++) {
        const el = cards.current[i];
        if (!el) continue;
        let t = (((i * PITCH - s.pos) % LOOP) + LOOP) % LOOP;
        if (t > LOOP / 2) t -= LOOP;
        const g = geo(t);
        const visible = g.xr > b.left - 20 && g.xl < b.left + b.width + 20;
        el.style.visibility = visible ? 'visible' : 'hidden';
        if (!visible) continue;
        const H = Math.max(g.hl, g.hr);
        const top = g.cy - H / 2;
        const lt = (H - g.hl) / 2, rt = (H - g.hr) / 2;
        el.style.transform = `translate(${g.xl - b.left}px, ${top - b.top}px)`;
        el.style.width = `${g.w}px`;
        el.style.height = `${H}px`;
        el.style.clipPath = roundedQuad([[0, lt], [g.w, rt], [g.w, H - rt], [0, H - lt]]);
        const ic = icons.current[i];
        if (ic) ic.style.transform = `translate(12px, ${H - lt - 12 - 34}px)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const s = st.current;
    s.drag = true; s.focus = false; s.vel = 0; s.moved = 0; s.lastX = e.clientX; s.lastT = performance.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const s = st.current;
    if (!s.drag) return;
    const dx = (e.clientX - s.lastX) / cfg.current.scale;
    const now = performance.now();
    const dt = Math.max(1, now - s.lastT) / 1000;
    s.pos -= dx;
    s.moved += Math.abs(dx);
    s.vel = 0.75 * (-dx / dt) + 0.25 * s.vel;
    s.lastX = e.clientX; s.lastT = now;
  };
  const up = () => {
    const s = st.current;
    if (!s.drag) return;
    s.drag = false;
    if (performance.now() - s.lastT > 90) s.vel = 0;
    s.vel = Math.max(-3000, Math.min(3000, s.vel));
  };
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') { st.current.pos += PITCH; e.preventDefault(); }
    if (e.key === 'ArrowLeft') { st.current.pos -= PITCH; e.preventDefault(); }
  };

  return (
    <div
      className={'carousel ' + className}
      style={{ width: band.width * scale, height: band.height * scale }}
      role="region" aria-roledescription="carousel" aria-label="Photos from UAE events. Drag, or use arrow keys."
      tabIndex={0} onKeyDown={key}
      onFocus={(e) => { st.current.focus = e.target.matches(':focus-visible'); }} onBlur={() => { st.current.focus = false; }}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      onClickCapture={(e) => { if (st.current.moved > 6) { e.preventDefault(); e.stopPropagation(); st.current.moved = 0; } }}
      onDragStart={(e) => e.preventDefault()}
      data-testid="carousel-photos"
    >
      <div className="carousel-layer" style={{ width: band.width, height: band.height, transform: `scale(${scale})` }}>
        {LANDING_PHOTOS.map((p, i) => (
          <div key={i} ref={(el) => { cards.current[i] = el; }} className="carousel-card" data-testid={`card-photo-${i}`}>
            <img src={p.src} alt={p.label + ' photo'} draggable={false} />
            <button ref={(el) => { icons.current[i] = el; }} className="carousel-dl" aria-label={`Download ${p.label} photo`}
              onPointerDown={(e) => { st.current.moved = 0; e.stopPropagation(); }}
              onClick={onPick} data-testid={`button-download-${i}`}>
              <Download className="h-[15px] w-[15px]" strokeWidth={2.2} aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
