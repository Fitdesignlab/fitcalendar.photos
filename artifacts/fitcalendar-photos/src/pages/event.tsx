import { useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowLeft, Camera } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PhotoGrid } from '@/components/photo-grid';
import { Lightbox } from '@/components/lightbox';
import { CATEGORY_LABEL, formatDate, getEvent, photoUrl } from '@/lib/events';
import { useDemoAuth } from '@/context/demo-auth';

export default function EventPage() {
  const { eventId = '' } = useParams<{ eventId: string }>();
  const event = getEvent(eventId);
  const { user, openSignIn } = useDemoAuth();
  const [tag, setTag] = useState('all');
  const [bib, setBib] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const onChange = useCallback((i: number | null) => setOpen(i), []);

  const tags = useMemo(() => Array.from(new Set(event?.photos.flatMap((p) => p.tags) ?? [])), [event]);
  const photos = useMemo(() => (event?.photos ?? []).filter((p) =>
    (tag === 'all' || p.tags.includes(tag)) &&
    (!bib.trim() || (p.bib ?? '').includes(bib.trim()) || p.photographer.toLowerCase().includes(bib.trim().toLowerCase()))), [event, tag, bib]);

  if (!event) {
    return (
      <div className="flex min-h-[100dvh] flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-5 py-24 md:px-10" data-testid="status-unknown-event">
          <p className="font-mono-ui text-[11px] uppercase text-accent">Unknown event</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[0.95] md:text-7xl">We could not find <span className="font-editorial font-normal">that one.</span></h1>
          <p className="mt-5 max-w-lg text-muted-foreground">There is no event with the id <code className="font-mono-ui text-foreground">{eventId}</code>. It may have been renamed, or the link has a typo.</p>
          <Link href="/" data-testid="link-back-home" className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground hover:opacity-90"><ArrowLeft className="h-4 w-4" /> Browse all events</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      <SiteHeader />
      <section className="grain relative overflow-hidden bg-[#0f0e0d] text-[#f4f1ec]">
        <img src={photoUrl(event.cover)} alt="" aria-hidden className="slowzoom absolute inset-0 h-full w-full object-cover opacity-45 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0d] to-transparent" />
        <div className="relative mx-auto max-w-[1400px] px-5 pb-12 pt-20 md:px-10 md:pt-32">
          <Link href="/" data-testid="link-all-events" className="inline-flex items-center gap-2 font-mono-ui text-[11px] uppercase text-white/65 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> All events</Link>
          <p className="rise mt-8 font-mono-ui text-[11px] uppercase"><span className="text-[#ea4a1f]">{CATEGORY_LABEL[event.category]}</span> <span className="text-white/60">/ {event.city} / {formatDate(event.date)} / Example event</span></p>
          <h1 className="rise mt-3 font-display text-5xl font-semibold leading-[0.92] md:text-8xl" data-testid="text-event-name">{event.name}</h1>
          <p className="rise mt-4 max-w-xl text-white/70">{event.blurb}</p>
        </div>
      </section>

      <main className="mx-auto max-w-[1400px] px-5 py-10 md:px-10">
        {!user && event.photos.length > 0 && (
          <div className="mb-8 flex flex-col gap-3 rounded-sm border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Browse everything. Sign in (demo) to download full-size files.</p>
            <button onClick={openSignIn} data-testid="button-banner-signin" className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">Sign in</button>
          </div>
        )}
        {event.photos.length === 0 ? (
          <div className="py-20 text-center" data-testid="status-empty-gallery">
            <Camera className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="mt-4 font-editorial text-4xl">Photos on the way.</p>
            <p className="mx-auto mt-2 max-w-sm text-muted-foreground">The photographers are still uploading this gallery. Check back soon.</p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter photos">
                {['all', ...tags].map((t) => (
                  <button key={t} onClick={() => setTag(t)} aria-pressed={tag === t} data-testid={'button-tag-' + t}
                    className={'rounded-full border px-4 py-1.5 font-mono-ui text-[11px] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' + (tag === t ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground')}>{t}</button>
                ))}
              </div>
              <div>
                <label htmlFor="bib" className="sr-only">Filter by bib or photographer</label>
                <input id="bib" value={bib} onChange={(e) => setBib(e.target.value)} placeholder="Bib or photographer" data-testid="input-bib"
                  className="w-full rounded-full border border-input bg-card px-4 py-2 text-sm outline-none focus:border-foreground md:w-64" />
              </div>
            </div>
            <p className="mb-4 font-mono-ui text-[11px] uppercase text-muted-foreground" data-testid="text-photo-count">{photos.length} sample photos</p>
            {photos.length ? (
              <PhotoGrid key={tag + bib} photos={photos} eventId={event.id} onOpen={setOpen} />
            ) : (
              <div className="py-16 text-center" data-testid="status-no-photos">
                <p className="font-editorial text-4xl">No match in this gallery.</p>
                <button onClick={() => { setTag('all'); setBib(''); }} data-testid="button-clear-filters" className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Clear filters</button>
              </div>
            )}
            <Lightbox photos={photos} index={open} eventId={event.id} onChange={onChange} />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
