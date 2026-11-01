import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { LandingFooter } from '@/components/landing-footer';
import { PhotosWordmark } from '@/components/photos-wordmark';
import { CurvedCarousel } from '@/components/curved-carousel';
import { useAuth } from '@/context/auth';

function useViewport() {
  const [v, setV] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setV({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return v;
}
function useReducedMotion() {
  const [r, setR] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setR(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return r;
}

const SUB = 'Find every shot from the race, the padel night, or the festival, then download them after you sign in.';

function Doodles() {
  return (
    <svg className="lp-abs lp-doodle e-draw pointer-events-none" width={1440} height={1080} viewBox="0 0 1440 1080" aria-hidden style={{ left: 0, top: 0 }}>
      <path pathLength={1} d="M263 406 Q269 392 278 382 M273 409 Q280 394 287 384" />
      <path pathLength={1} d="M1262 408 C1300 446 1310 500 1268 530 C1232 556 1196 532 1214 506 C1232 482 1268 506 1248 552 C1236 580 1210 602 1182 616" />
      <path pathLength={1} d="M1196 598 L1180 617 L1205 621" />
      <path pathLength={1} d="M552 948 C576 934 596 932 612 938" />
      <path pathLength={1} d="M600 928 L613 938 L598 947" />
    </svg>
  );
}

export default function Home() {
  const { openSignIn } = useAuth();
  const { w, h } = useViewport();
  const reduced = useReducedMotion();
  const go = () => openSignIn({ redirectTo: '/events' });

  if (w <= 820) {
    const s = w / 640;
    const units = 250 / s;
    return (
      <>
      <div className="lp lpm" data-testid="page-home">
        <header className="lpm-head e-drop">
          <Link href="/" aria-label="FitCalendar Photos home" className="lp-home rounded" data-testid="link-home"><PhotosWordmark /></Link>
          <button onClick={go} className="lp-pill lp-signup" style={{ width: 92, height: 40 }} data-testid="button-signup">Sign up</button>
        </header>
        <span className="lp-badge e-pop mt-8 px-4 py-1.5 text-[14px]" data-testid="text-badge">Trusted by UAE movers</span>
        <h1 className="lp-h1 lpm-h1 mt-5 px-5"><span className="e-l1">Your event. Your photos.</span><span className="e-l2">One place.</span></h1>
        <p className="lp-sub e-sub mt-4 max-w-[30rem] px-6 text-[16px] leading-[25px]">{SUB}</p>
        <div className="e-row mt-6 w-full">
          <CurvedCarousel scale={s} band={{ left: 400, top: 680 - units / 2, width: 640, height: units }} onPick={go} reduced={reduced} />
        </div>
        <div className="mt-auto flex flex-col items-center pt-7">
          <div className="lp-cta-wrap e-cta" style={{ width: 190, height: 74 }}>
            <button onClick={go} className="lp-cta" style={{ width: 172, height: 58 }} data-testid="button-get-photos">Get your photos</button>
          </div>
          <p className="lp-hand e-note mt-3 text-[26px]" style={{ transform: 'rotate(-4deg)' }}>Sign in to download</p>
        </div>
      </div>
      <LandingFooter />
      </>
    );
  }

  const u = Math.min(w / 1440, h / 1080);
  const cardScale = Math.min(u, 1);
  const bandWidth = w / cardScale;
  const bandTop = (h - 1080 * u) / 2 + 687 * u - 227 * cardScale;
  return (
    <>
    <div className="lp lp-stage" data-testid="page-home">
      <div className="lp-carousel-bleed" style={{ top: bandTop }}>
        <div className="e-row">
          <CurvedCarousel scale={cardScale} band={{ left: 720 - bandWidth / 2, top: 460, width: bandWidth, height: 430 }} onPick={go} reduced={reduced} />
        </div>
      </div>
      <div className="lp-frame" style={{ transform: `translate(-50%, -50%) scale(${u})` }}>
        <header className="e-drop">
          <Link href="/" aria-label="FitCalendar Photos home" className="lp-home lp-abs rounded" style={{ left: 37, top: 36 }} data-testid="link-home"><PhotosWordmark /></Link>
          <button onClick={go} className="lp-pill lp-login lp-abs" style={{ left: 1211, top: 29, width: 92, height: 40 }} data-testid="button-login">Log in</button>
          <button onClick={go} className="lp-pill lp-signup lp-abs" style={{ left: 1304, top: 29, width: 97, height: 40 }} data-testid="button-signup">Sign up</button>
        </header>
        <div className="lp-abs flex w-full justify-center" style={{ top: 115 }}>
          <span className="lp-badge e-pop" style={{ fontSize: 16.6, padding: '9px 18px' }} data-testid="text-badge">Trusted by UAE movers</span>
        </div>
        <h1 className="lp-h1 lp-abs w-full" style={{ top: 176, fontSize: 88, lineHeight: '92px' }}>
          <span className="e-l1">Your event. Your photos.</span><span className="e-l2">One place.</span>
        </h1>
        <p className="lp-sub e-sub lp-abs" style={{ top: 394, left: 400, width: 640, fontSize: 20.8, lineHeight: '32px' }}>{SUB}</p>
        <p className="lp-hand e-note lp-abs text-center" style={{ left: 1212, top: 310, fontSize: 36, lineHeight: '36px', transform: 'rotate(16deg)', transformOrigin: 'left top' }}>Be seen<br />with shots</p>
        <Doodles />
        <p className="lp-hand e-note lp-abs" style={{ left: 380, top: 922, fontSize: 32, transform: 'rotate(-14deg)' }}>Sign in to download</p>
        <div className="lp-cta-wrap e-cta lp-abs" style={{ left: 626, top: 901, width: 190, height: 74 }}>
          <button onClick={go} className="lp-cta" style={{ width: 172, height: 58 }} data-testid="button-get-photos">Get your photos</button>
        </div>
      </div>
    </div>
    <LandingFooter />
    </>
  );
}
