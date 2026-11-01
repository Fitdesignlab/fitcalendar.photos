import { PAYMENTS_ENABLED } from '@/lib/config';

export function SiteFooter() {
  return (
    <footer className="border-t border-[#EDEDED] bg-white">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-10 text-[13px] text-[#6E6E73] md:flex-row md:items-center md:justify-between md:px-10">
        <p className="font-medium text-[#101410]">Fit Calendar Photos</p>
        <p className="max-w-xl leading-relaxed">
          Example events and illustrative sample photos. Sign in with Google to download. Apple sign-in is not active.
          {PAYMENTS_ENABLED ? '' : ' Purchases are not available.'}
        </p>
      </div>
    </footer>
  );
}
