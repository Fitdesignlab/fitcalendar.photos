import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { photoUrl, type EventPhoto } from '@/lib/events';
import { useDemoAuth } from '@/context/demo-auth';

interface Props { photos: EventPhoto[]; index: number | null; eventId: string; onChange: (i: number | null) => void }

export function Lightbox({ photos, index, eventId, onChange }: Props) {
  const { user, requestDownload, downloadingId } = useDemoAuth();
  const p = index !== null ? photos[index] : null;
  const n = photos.length;

  useEffect(() => {
    if (index === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onChange((index + 1) % n);
      if (e.key === 'ArrowLeft') onChange((index - 1 + n) % n);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [index, n, onChange]);

  return (
    <Dialog open={p !== null} onOpenChange={(o) => { if (!o) onChange(null); }}>
      <DialogContent className="max-w-5xl border-none bg-[#151311] p-0 text-[#f4f1ec] sm:rounded-sm [&>button]:text-white" data-testid="dialog-lightbox">
        {p && index !== null && (
          <div>
            <div className="relative">
              <img key={p.id} src={photoUrl(p.file)} alt={p.caption} className="rise max-h-[72dvh] w-full object-contain" />
              <button onClick={() => onChange((index - 1 + n) % n)} aria-label="Previous photo" data-testid="button-prev"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea4a1f]"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={() => onChange((index + 1) % n)} aria-label="Next photo" data-testid="button-next"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea4a1f]"><ChevronRight className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <DialogTitle className="font-display text-xl font-semibold">{p.caption}</DialogTitle>
                <DialogDescription className="font-mono-ui text-[11px] uppercase text-white/55">
                  Sample photo {index + 1} of {n} / {p.time}{p.bib ? ' / Bib ' + p.bib : ''} / by {p.photographer}
                </DialogDescription>
              </div>
              <button onClick={() => requestDownload(p, eventId)} disabled={downloadingId === p.id} data-testid="button-lightbox-download"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f4f1ec] px-5 py-2.5 text-sm font-medium text-[#151311] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea4a1f] disabled:opacity-60">
                {user ? <Download className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {user ? (downloadingId === p.id ? 'Saving' : 'Download photo') : 'Sign in to download'}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
