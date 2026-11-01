import { Download, Maximize2 } from 'lucide-react';
import { photoUrl, type EventPhoto } from '@/lib/events';
import { useAuth } from '@/context/auth';

export function PhotoGrid({ photos, eventId, onOpen }: { photos: EventPhoto[]; eventId: string; onOpen: (i: number) => void }) {
  const { user, requestDownload, downloadingId } = useAuth();
  return (
    <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
      {photos.map((p, i) => (
        <li key={p.id} className="rise group relative break-inside-avoid overflow-hidden rounded-[22px] bg-[#F2F2F2]" style={{ animationDelay: i * 60 + 'ms' }} data-testid={'card-photo-' + p.id}>
          <button onClick={() => onOpen(i)} className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2" aria-label={'Open ' + p.caption} data-testid={'button-open-' + p.id}>
            <img src={photoUrl(p.file)} alt={p.caption} loading="lazy"
              className={'w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ' + (i % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[3/2]')} />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/75 to-transparent p-4 pt-16 text-[#ffffff]">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{p.caption}</p>
              <p className="text-[12px] text-white/75">{p.time}{p.bib ? ' / Bib ' + p.bib : ''} / {p.photographer}</p>
            </div>
            <div className="pointer-events-auto flex shrink-0 items-end gap-1.5">
              <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-white/15 sm:flex" aria-hidden><Maximize2 className="h-4 w-4" /></span>
              <button onClick={() => requestDownload(p, eventId)} disabled={downloadingId === p.id}
                aria-busy={downloadingId === p.id}
                aria-label={(user ? 'Download ' : 'Sign in to download ') + p.caption} data-testid={'button-download-' + p.id}
                className="photo-download-glass relative left-1 top-1 disabled:opacity-60">
                <Download className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only">{downloadingId === p.id ? 'Saving' : 'Download'}</span>
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
