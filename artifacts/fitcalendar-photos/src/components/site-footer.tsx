import { FMark } from './f-mark';
import { PAYMENTS_ENABLED } from '@/lib/config';

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
        <FMark className="h-7 w-7 text-foreground" />
        <p className="max-w-xl text-xs leading-relaxed">
          Example events and sample photos for demonstration. Sign-in is a demo stub, not real OAuth, and downloads are public sample images.
          {PAYMENTS_ENABLED ? '' : ' Purchases are not available.'}
        </p>
      </div>
    </footer>
  );
}
