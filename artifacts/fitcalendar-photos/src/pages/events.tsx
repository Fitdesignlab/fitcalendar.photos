import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { EventCard } from '@/components/event-card';
import { CATEGORY_LABEL, EVENTS, TOTAL_PHOTOS, type Category } from '@/lib/events';
import { usePageMeta } from '@/lib/use-page-meta';

type Filter = 'all' | Category;

export default function EventsPage() {
  usePageMeta('Events | Fit Calendar Photos', 'Find Sunrise Pilates on a Yacht and its event photo gallery.');
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const cats = useMemo(() => Array.from(new Set(EVENTS.map((e) => e.category))), []);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return [...EVENTS]
      .sort((a, b) => Number(b.photos.length > 0) - Number(a.photos.length > 0) || b.date.localeCompare(a.date))
      .filter((e) => (filter === 'all' || e.category === filter) && (!s || (e.name + ' ' + e.city).toLowerCase().includes(s)));
  }, [filter, q]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white text-[#101410]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 pb-24 pt-12 md:px-10 md:pt-20">
        <section className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="rise max-w-2xl">
            <p className="text-[14px] font-medium text-[#6E6E73]" data-testid="text-events-count">{EVENTS.length} available event{EVENTS.length === 1 ? '' : 's'} / {TOTAL_PHOTOS} photos</p>
            <h1 className="mt-3 font-[Inter_Tight] text-[44px] font-bold leading-[1.02] tracking-[-0.035em] md:text-[72px]" data-testid="text-events-title">
              Find your event.<br /><span className="text-[#9A9A9E]">Take it home.</span>
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-7 text-[#5E5E61]">Open your event to find its details and available photos.</p>
          </div>
          <div className="rise w-full md:w-80" style={{ animationDelay: '120ms' }}>
            <label htmlFor="event-search" className="sr-only">Search events</label>
            <div className="flex h-12 items-center gap-2 rounded-full border border-[#D9D9D9] px-4 focus-within:border-black">
              <Search className="h-4 w-4 text-[#6E6E73]" aria-hidden />
              <input id="event-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search event or place" data-testid="input-event-search"
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-[#9A9A9E]" />
            </div>
          </div>
        </section>

        <div className="mt-10 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by sport">
          {(['all', ...cats] as Filter[]).map((c) => (
            <button key={c} onClick={() => setFilter(c)} aria-pressed={filter === c} data-testid={'button-filter-' + c}
              className={'h-10 shrink-0 rounded-full px-5 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ' + (filter === c ? 'bg-black text-white' : 'border border-[#D9D9D9] text-[#101410] hover:border-black')}>
              {c === 'all' ? 'All sports' : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        {list.length ? (
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3" data-testid="list-events">
            {list.map((e, i) => <EventCard key={e.id} event={e} index={i} feature={i === 0 && filter === 'all' && !q.trim()} />)}
          </div>
        ) : (
          <div className="mt-16 rounded-[28px] bg-[#F5F5F5] px-6 py-20 text-center" data-testid="status-no-events">
            <p className="font-[Inter_Tight] text-[32px] font-bold tracking-[-0.03em]">No events match that.</p>
            <p className="mx-auto mt-2 max-w-sm text-[#6E6E73]">Try another sport or a different place name.</p>
            <button onClick={() => { setFilter('all'); setQ(''); }} data-testid="button-reset-events"
              className="mt-6 h-12 rounded-full bg-black px-6 text-[15px] font-medium text-white hover:opacity-85">Show all events</button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
