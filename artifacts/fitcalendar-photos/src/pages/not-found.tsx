import { Link } from 'wouter';
import { SiteHeader } from '@/components/site-header';
import { usePageMeta } from '@/lib/use-page-meta';

export default function NotFound() {
  usePageMeta('Page not found | Fit Calendar Photos', 'This page does not exist. Browse available events instead.');
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white text-[#101410]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-5 py-24 md:px-10">
        <p className="text-[14px] font-medium text-[#6E6E73]">404</p>
        <h1 className="mt-3 font-[Inter_Tight] text-[44px] font-bold leading-[1.02] tracking-[-0.035em] md:text-[72px]">Wrong turn.</h1>
        <p className="mt-4 max-w-md text-[17px] text-[#5E5E61]">This page is not on the course map.</p>
        <Link href="/events" data-testid="link-404-events" className="mt-8 inline-flex h-12 w-fit items-center rounded-full bg-black px-6 text-[15px] font-medium text-white hover:opacity-85">Browse events</Link>
      </main>
    </div>
  );
}
