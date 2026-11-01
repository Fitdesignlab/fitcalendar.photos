import { Link } from 'wouter';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { CATEGORY_LABEL, formatDate, photoUrl, type PhotoEvent } from '@/lib/events';

export function EventCard({ event, index, feature = false, photoCount }: { event: PhotoEvent; index: number; feature?: boolean; photoCount?: number }) {
  const count = photoCount;
  return (
    <Link href={'/event/' + event.id} data-testid={'link-event-' + event.id}
      className={'rise group flex flex-col rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 ' + (feature ? 'md:col-span-2' : '')}
      style={{ animationDelay: index * 70 + 'ms' }}>
      <div className="relative overflow-hidden rounded-[28px] bg-[#F2F2F2]">
        <img src={photoUrl(event.cover)} alt={event.name} loading="lazy"
          className={'w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ' + (feature ? 'aspect-[4/3] md:aspect-[16/8]' : 'aspect-[4/3]')} />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#101410]">{CATEGORY_LABEL[event.category]}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-45" aria-hidden>
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <span className={'absolute bottom-4 left-4 rounded-full px-3 py-1.5 text-[12px] font-medium backdrop-blur ' + (count ? 'bg-black/55 text-white' : 'bg-white/90 text-[#101410]')} data-testid={'status-count-' + event.id}>
          {count === undefined ? 'View gallery' : count ? count + (count === 1 ? ' photo' : ' photos') : 'No photos yet'}
        </span>
      </div>
      <div className="px-1 pt-4">
        <h3 className="font-[Inter_Tight] text-[22px] font-bold leading-tight tracking-[-0.02em] text-[#101410] md:text-[26px]">{event.name}</h3>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-[#6E6E73]">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" aria-hidden />{formatDate(event.date)}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden />{event.city}</span>
        </p>
      </div>
    </Link>
  );
}
