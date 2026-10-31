import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORY_LABEL, formatDate, photoUrl, type PhotoEvent } from '@/lib/events';

export function EventCard({ event, index, feature = false }: { event: PhotoEvent; index: number; feature?: boolean }) {
  return (
    <Link href={'/event/' + event.id} data-testid={'link-event-' + event.id}
      className={'rise group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 ' + (feature ? 'md:col-span-2' : '')}
      style={{ animationDelay: index * 70 + 'ms' }}>
      <div className="relative overflow-hidden rounded-sm bg-muted">
        <img src={photoUrl(event.cover)} alt="" loading="lazy"
          className={'w-full object-cover grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0 ' + (feature ? 'aspect-[16/9]' : 'aspect-[4/3]')} />
        <span className="absolute left-3 top-3 rounded-full bg-[#151311]/80 px-2.5 py-1 font-mono-ui text-[10px] uppercase text-[#f4f1ec] backdrop-blur">Example event</span>
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f1ec] text-[#151311] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><ArrowUpRight className="h-4 w-4" /></span>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-xl font-semibold md:text-2xl">{event.name}</h3>
        <span className="shrink-0 font-mono-ui text-[11px] uppercase text-muted-foreground">{event.photos.length ? event.photos.length + ' photos' : 'Uploading'}</span>
      </div>
      <p className="mt-1 font-mono-ui text-[11px] uppercase text-muted-foreground">
        <span className="text-accent">{CATEGORY_LABEL[event.category]}</span> / {event.city} / {formatDate(event.date)}
      </p>
    </Link>
  );
}
