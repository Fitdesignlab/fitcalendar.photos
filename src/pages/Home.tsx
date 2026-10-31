import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { signIn, getSession, signOut, type Provider } from '../lib/auth'
import { photo, PHOTO_COUNT } from '../lib/photos'

const N = 10, PITCH = 196, CX = 720, HALF = 706, SPEED = 50

function Carousel() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!; const cards = Array.from(el.children) as HTMLElement[]
    let off = 0, vel = 0, drag = false, lastX = 0, lastT = performance.now(), raf = 0
    const span = N * PITCH
    const down = (e: PointerEvent) => { drag = true; lastX = e.clientX; vel = 0; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing' }
    const move = (e: PointerEvent) => {
      if (!drag) return
      const u = el.getBoundingClientRect().width / 1440
      const dx = (e.clientX - lastX) / u; lastX = e.clientX; off += dx; vel = dx * 60
    }
    const up = () => { drag = false; el.style.cursor = 'grab' }
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up)
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now
      if (!drag) { off += vel * dt; vel *= Math.pow(0.05, dt); if (!reduce) off -= SPEED * dt }
      cards.forEach((c, i) => {
        let t = ((i * PITCH + off) % span + span) % span - span / 2
        const x = CX + t * (1 + 0.083 * (t / HALF) ** 2)
        const d = Math.min(1.2, Math.abs(x - CX) / HALF)
        const w = 170 + 48 * d * d
        const qL = Math.min(1.2, Math.abs(x - w / 2 - CX) / HALF), qR = Math.min(1.2, Math.abs(x + w / 2 - CX) / HALF)
        const hL = 280 + 92 * qL ** 2.6, hR = 280 + 92 * qR ** 2.6
        const cy = 687 - 12 * d * d, H = Math.max(hL, hR)
        Object.assign(c.style, { left: `${(x - w / 2) / 14.4}%`, top: `${(cy - H / 2) / 10.8}%`, width: `${w / 14.4}%`, height: `${H / 10.8}%` })
        const yl = (H - hL) / 2 / H * 100, yr = (H - hR) / 2 / H * 100
        c.style.clipPath = `polygon(0% ${yl}%, 100% ${yr}%, 100% ${100 - yr}%, 0% ${100 - yl}%)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="carousel" ref={ref}>
      {Array.from({ length: N }, (_, i) => (
        <div className="card" key={i}><img src={photo(i % PHOTO_COUNT)} alt="" draggable={false} /><span className="dl">↓</span></div>
      ))}
    </div>
  )
}

export default function Home() {
  const [params] = useSearchParams(); const nav = useNavigate()
  const [open, setOpen] = useState(false); const [session, setSession] = useState(getSession())
  const next = params.get('next') || '/event/demo'
  useEffect(() => { if (params.get('next')) setOpen(true) }, [params])
  const login = (p: Provider) => { signIn(p); setSession(getSession()); nav(next) }
  return (
    <div className="stage"><div className="frame">
      <header className="top">
        <img className="mark" src="/fitcalendar-mark.png" alt="Fit Calendar" />
        <div className="pills">
          {session ? <button className="pill light" onClick={() => { signOut(); setSession(null) }}>Log out</button>
            : <button className="pill light" onClick={() => setOpen(true)}>Log in</button>}
          <button className="pill dark" onClick={() => session ? nav(next) : setOpen(true)}>{session ? 'My photos' : 'Sign up'}</button>
        </div>
      </header>
      <div className="badge">Trusted by UAE movers</div>
      <h1>Your event. Your photos.<br />One place.</h1>
      <p className="sub">Find every shot from the race, the padel night, or the festival, then download them after you sign in.</p>
      <div className="note n1">Be seen.</div>
      <svg className="arrow a1" viewBox="0 0 120 200"><path d="M60 5 C110 60 100 130 40 190 M40 190 l4 -18 M40 190 l17 -6" /></svg>
      <Carousel />
      <button className="cta" onClick={() => session ? nav(next) : setOpen(true)}><span>Get your photos</span></button>
      <div className="note n2">Free to download</div>
      {open && !session && (
        <div className="modal" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <img src="/fitcalendar-mark.png" alt="" width={48} />
            <h2>Sign in to get your photos</h2>
            <button className="auth" onClick={() => login('google')}>Continue with Google</button>
            <button className="auth apple" onClick={() => login('apple')}>Continue with Apple</button>
            <small>Free. No payment needed.</small>
          </div>
        </div>
      )}
    </div></div>
  )
}
