import { useEffect, type ReactNode } from 'react';
import raw from '@/content/terms.md?raw';
import { SiteHeader } from '@/components/site-header';
import { LandingFooter } from '@/components/landing-footer';
import { usePageMeta } from '@/lib/use-page-meta';

type Block = { k: 'h2' | 'p' | 'ul'; text?: string; items?: string[] };

function parse(src: string) {
  let updated = '';
  const blocks: Block[] = [];
  for (const line of src.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('# ')) continue;
    if (t.startsWith('Last updated:')) { updated = t; continue; }
    if (t.startsWith('## ')) blocks.push({ k: 'h2', text: t.slice(3) });
    else if (t.startsWith('- ')) {
      const last = blocks[blocks.length - 1];
      if (last?.k === 'ul') last.items!.push(t.slice(2)); else blocks.push({ k: 'ul', items: [t.slice(2)] });
    } else blocks.push({ k: 'p', text: t });
  }
  return { updated, blocks };
}
const { updated, blocks } = parse(raw);

function inline(s: string): ReactNode {
  const m = s.match(/^\[(.+)\]\((https?:[^)]+)\)$/);
  if (m) return <a href={m[2]} target="_blank" rel="noopener noreferrer" className="font-medium text-black underline underline-offset-4" data-testid="link-terms-privacy">{m[1]}</a>;
  return s;
}

export default function TermsPage() {
  usePageMeta('Terms of Use | Fit Calendar Photos', 'The FitCalendar Terms of Use: rules for using the calendar, listings, accounts and submissions.');
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-[100dvh] bg-white text-black" data-testid="page-terms">
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 pb-24 pt-14 md:pt-24">
        <h1 className="font-['Inter_Tight',_'Inter',_sans-serif] text-[40px] font-bold leading-[1.05] tracking-[-0.035em] md:text-[56px]" data-testid="text-terms-title">Terms of Use</h1>
        <p className="mt-4 text-[14px] text-[#6E6E73]" data-testid="text-terms-updated">{updated}</p>
        <div className="mt-12 border-t border-[#EDEDED] pt-4">
          {blocks.map((b, i) => b.k === 'h2'
            ? <h2 key={i} className="mt-12 font-['Inter_Tight',_'Inter',_sans-serif] text-[22px] font-semibold tracking-[-0.02em]">{b.text}</h2>
            : b.k === 'ul'
              ? <ul key={i} className="mt-5 list-disc space-y-2.5 pl-5 text-[16px] leading-[1.75] text-[#3A3A3D] marker:text-black">{b.items!.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>
              : <p key={i} className="mt-5 text-[16px] leading-[1.75] text-[#3A3A3D]">{b.text}</p>)}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
