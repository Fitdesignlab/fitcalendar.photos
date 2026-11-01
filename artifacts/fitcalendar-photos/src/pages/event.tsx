import { useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowLeft, CalendarDays, Camera, Lock, MapPin, Search } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PhotoGrid } from '@/components/photo-grid';
import { Lightbox } from '@/components/lightbox';
import { CATEGORY_LABEL, formatDate, getEvent, photoUrl } from '@/lib/events';
import { useAuth } from '@/context/auth';
import { usePageMeta } from '@/lib/use-page-meta';

const pill = 'inline-flex h-12 w-fit items-center gap-2 rounded-full bg-black px-6 text-[15px] font-medium text-white transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2';

export default function EventPage() {
  const { eventId = '' } = useParams<{ eventId: string }>();
  const event = getEvent(eventId);
  const { user, openSignIn } = useAuth();
  const [tag, setTag] = useState('all');
  const [bib, setBib] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const onChange = useCallback((i: number | null) => setOpen(i), []);

  usePageMeta(
    event ? event.name + ' photos | Fit Calendar Photos' : 'Event not found | Fit Calendar Photos',
    event ? 'Event photo gallery for ' + event.name + ', ' + event.city + ', ' + formatDate(event.date) + '.' : 'This event could not be found. Browse available events.',
  );

  const tags = useMemo(() => Array.from(new Set(event?.photos.flatMap((p) => p.tags) ?? [])), [event]);
  const photos = useMemo(() => (event?.photos ?? []).filter((p) =>
    (tag === 'all' || p.tags.includes(tag)) &&
    (!bib.trim() || (p.bib ?? '').includes(bib.trim()) || p.photographer.toLowerCase().includes(bib.trim().toLowerCase()))), [event, tag, bib]);

  if (!event) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-white text-[#101410]">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-5 py-24 md:px-10" data-testid="status-unknown-event">
          <p className="text-[14px] font-medium text-[#6E6E73]">Event not found</p>
          <h1 className="mt-3 max-w-3xl font-[Inter_Tight] text-[44px] font-bold leading-[1.02] tracking-[-0.035em] md:text-[72px]">We could not find<br /><span className="text-[#9A9A9E]">that one.</span></h1>
          <p className="mt-5 max-w-lg text-[17px] text-[#5E5E61]">There is no event with the id <code className="rounded-md bg-[#F2F2F2] px-1.5 py-0.5 text-[#101410]">{eventId}</code>. The link may have a typo.</p>
          <Link href="/events" data-testid="link-back-events" className={pill + ' mt-8'}><ArrowLeft className="h-4 w-4" /> Browse all events</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white text-[#101410]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 pb-24 pt-8 md:px-10 md:pt-12">
        <Link href="/events" data-testid="link-all-events" className="inline-flex items-center gap-2 rounded-full text-[14px] font-medium text-[#6E6E73] hover:text-[#101410] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
          <ArrowLeft className="h-4 w-4" /> All events
        </Link>

        <section className="mt-6 grid items-end gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
          <div className="rise">
            <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium">
              <span className="rounded-full bg-black px-3 py-1.5 text-white">{CATEGORY_LABEL[event.category]}</span>
            </div>
            <h1 className="mt-5 font-[Inter_Tight] text-[42px] font-bold leading-[1.02] tracking-[-0.035em] md:text-[68px]" data-testid="text-event-name">{event.name}</h1>
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-[#6E6E73]">
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" aria-hidden />{formatDate(event.date)}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden />{event.city}</span>
            </p>
            <p className="mt-5 max-w-lg text-[17px] leading-7 text-[#5E5E61]">{event.blurb}</p>
            <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" data-testid="link-source-event" className="mt-4 inline-block text-[14px] font-medium underline underline-offset-4">View original event listing</a>
          </div>
          <div className="rise overflow-hidden rounded-[28px] bg-[#F2F2F2]" style={{ animationDelay: '100ms' }}>
            <img src={photoUrl(event.cover)} alt={event.name} className="aspect-[4/3] w-full object-cover" />
          </div>
        </section>

        {!user && event.photos.length > 0 && (
          <div className="mt-12 flex flex-col gap-4 rounded-[28px] bg-[#F5F5F5] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <p className="flex items-center gap-3 text-[15px] text-[#5E5E61]"><Lock className="h-4 w-4 shrink-0 text-[#101410]" aria-hidden /> Browse everything. Sign in with Google to download photos.</p>
            <button onClick={() => openSignIn()} data-testid="button-banner-signin" className="h-11 shrink-0 rounded-full bg-black px-5 text-[14px] font-medium text-white hover:opacity-85">Log in</button>
          </div>
        )}

        {event.photos.length === 0 ? (
          <div className="mt-12 rounded-[28px] border border-dashed border-[#D9D9D9] px-6 py-20 text-center" data-testid="status-empty-gallery">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2F2F2]"><Camera className="h-6 w-6" aria-hidden /></span>
            <p className="mt-5 font-[Inter_Tight] text-[32px] font-bold tracking-[-0.03em]">No photos available yet.</p>
            <p className="mx-auto mt-2 max-w-sm text-[#6E6E73]">A photo gallery has not been added for this event.</p>
            <Link href="/events" data-testid="link-empty-events" className={pill + ' mx-auto mt-7'}>Back to events</Link>
          </div>
        ) : (
          <>
            <div className="mt-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter photos">
                {['all', ...tags].map((t) => (
                  <button key={t} onClick={() => setTag(t)} aria-pressed={tag === t} data-testid={'button-tag-' + t}
                    className={'h-10 shrink-0 rounded-full px-4 text-[14px] font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ' + (tag === t ? 'bg-black text-white' : 'border border-[#D9D9D9] hover:border-black')}>{t === 'all' ? 'All photos' : t}</button>
                ))}
              </div>
              <div className="flex h-11 items-center gap-2 rounded-full border border-[#D9D9D9] px-4 focus-within:border-black md:w-72">
                <Search className="h-4 w-4 text-[#6E6E73]" aria-hidden />
                <label htmlFor="bib" className="sr-only">Filter by bib or photographer</label>
                <input id="bib" value={bib} onChange={(e) => setBib(e.target.value)} placeholder="Bib or photographer" data-testid="input-bib"
                  className="w-full bg-transparent text-[15px] outline-none placeholder:text-[#9A9A9E]" />
              </div>
            </div>
            <p className="mb-5 mt-6 text-[14px] text-[#6E6E73]" data-testid="text-photo-count">{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</p>
            {photos.length ? (
              <PhotoGrid key={tag + bib} photos={photos} eventId={event.id} onOpen={setOpen} />
            ) : (
              <div className="rounded-[28px] bg-[#F5F5F5] px-6 py-16 text-center" data-testid="status-no-photos">
                <p className="font-[Inter_Tight] text-[32px] font-bold tracking-[-0.03em]">No match in this gallery.</p>
                <p className="mt-2 text-[#6E6E73]">Try another bib number or clear the filters.</p>
                <button onClick={() => { setTag('all'); setBib(''); }} data-testid="button-clear-filters" className="mt-6 h-12 rounded-full bg-black px-6 text-[15px] font-medium text-white hover:opacity-85">Clear filters</button>
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
