import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { EventCard } from '@/components/event-card';
import { CATEGORY_LABEL, EVENTS, TOTAL_PHOTOS, photoUrl, type Category } from '@/lib/events';

type Filter = 'all' | Category;
const FILTERS: Filter[] = ['all', 'race', 'padel', 'festival'];

export default function Home() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return EVENTS.filter((e) => (filter === 'all' || e.category === filter) && (!s ||
      [e.name, e.city, e.blurb, CATEGORY_LABEL[e.category]].join(' ').toLowerCase().includes(s) ||
      e.photos.some((p) => p.bib === s || p.caption.toLowerCase().includes(s) || p.photographer.toLowerCase().includes(s))));
  }, [q, filter]);

  return (
    <div className="min-h-[100dvh]">
      <section className="grain relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#0f0e0d] text-[#f4f1ec]">
        <SiteHeader overlay />
        <img src={photoUrl('hero.jpg')} alt="" aria-hidden className="slowzoom absolute inset-0 h-full w-full object-cover opacity-60 grayscale contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0d] via-[#0f0e0d]/30 to-[#0f0e0d]/50" />
        <div className="relative z-10 mx-auto mt-auto w-full max-w-[1400px] px-5 pb-14 md:px-10 md:pb-20">
          <p className="rise font-mono-ui text-[11px] uppercase text-white/60">Race / Padel / Festival</p>
          <h1 className="rise mt-4 max-w-5xl font-display text-[clamp(2.75rem,8.5vw,8rem)] font-semibold leading-[0.9]" style={{ animationDelay: '120ms' }}>
            Your event. Your photos. <span className="font-editorial font-normal">One place.</span>
          </h1>
          <p className="rise mt-6 max-w-xl text-base text-white/75 md:text-lg" style={{ animationDelay: '240ms' }}>
            Find every shot from the race, the padel night, or the festival, then download them after you sign in.
          </p>
          <form role="search" onSubmit={(e) => { e.preventDefault(); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="rise mt-9 flex max-w-2xl items-center gap-2 rounded-full bg-[#f4f1ec] p-1.5 pl-5 text-[#151311]" style={{ animationDelay: '360ms' }}>
            <Search className="h-5 w-5 shrink-0 opacity-50" aria-hidden />
            <label htmlFor="hero-search" className="sr-only">Search events, cities, or bib numbers</label>
            <input id="hero-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} data-testid="input-search"
              placeholder="Event, city, or bib number" className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-[#151311]/45" />
            <button type="submit" data-testid="button-search" className="rounded-full bg-[#151311] px-5 py-2.5 text-sm font-medium text-[#f4f1ec] hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea4a1f]">Find</button>
          </form>
          <dl className="rise mt-12 flex gap-10 border-t border-white/15 pt-5 font-mono-ui text-[11px] uppercase text-white/55" style={{ animationDelay: '480ms' }}>
            <div><dt>Example events</dt><dd className="mt-1 font-display text-2xl normal-case text-[#f4f1ec]">{EVENTS.length}</dd></div>
            <div><dt>Sample photos</dt><dd className="mt-1 font-display text-2xl normal-case text-[#f4f1ec]">{TOTAL_PHOTOS}</dd></div>
            <div className="hidden sm:block"><dt>Search by</dt><dd className="mt-1 font-display text-2xl normal-case text-[#f4f1ec]">Bib, place, name</dd></div>
          </dl>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-10 px-5 py-20 md:grid-cols-3 md:px-10">
        {[['01', 'Find the event', 'Search by name, city or your bib number.'], ['02', 'Find the moment', 'Every frame, sorted by time and photographer.'], ['03', 'Take it home', 'Sign in, and the full-size file is yours.']].map(([n, t, d]) => (
          <div key={n} className="border-t border-foreground pt-4">
            <span className="font-mono-ui text-[11px] text-accent">{n}</span>
            <h2 className="mt-2 font-display text-3xl font-semibold">{t}</h2>
            <p className="mt-2 text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <main id="events" className="mx-auto max-w-[1400px] scroll-mt-20 px-5 pb-24 md:px-10">
        <div className="sticky top-0 z-20 -mx-5 flex flex-col gap-4 border-b border-border bg-background/90 px-5 py-4 backdrop-blur-md md:-mx-10 md:flex-row md:items-center md:justify-between md:px-10">
          <h2 className="font-display text-4xl font-semibold">Events <span className="font-editorial font-normal text-muted-foreground">({results.length})</span></h2>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by type">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} data-testid={'button-filter-' + f}
                className={'rounded-full border px-4 py-1.5 font-mono-ui text-[11px] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
                  (filter === f ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground')}>
                {f === 'all' ? 'All' : CATEGORY_LABEL[f]}
              </button>
            ))}
            {q && (
              <button onClick={() => setQ('')} data-testid="button-clear-search" className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 font-mono-ui text-[11px] uppercase hover:bg-secondary">
                "{q}" <X className="h-3 w-3" aria-label="Clear search" />
              </button>
            )}
          </div>
        </div>
        {results.length ? (
          <div key={filter + q} className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {results.map((e, i) => <EventCard key={e.id} event={e} index={i} feature={i === 0 && filter === 'all' && !q} />)}
          </div>
        ) : (
          <div className="rise mx-auto mt-16 max-w-md py-16 text-center" data-testid="status-no-results">
            <p className="font-editorial text-5xl">Nothing yet.</p>
            <p className="mt-3 text-muted-foreground">No example event matches that. Try a city, a sport, or a bib like 1184.</p>
            <button onClick={() => { setQ(''); setFilter('all'); }} data-testid="button-reset" className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90">Show all events</button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
