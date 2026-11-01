import { Link } from 'wouter';
import { LogoLockup } from './logo-lockup';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
const lk = 'rounded text-[15px] text-[#5E5E61] transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black';
const hd = 'mb-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-black';

export function LandingFooter({ showPoweredBy = false }: { showPoweredBy?: boolean }) {
  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <footer className="border-t border-[#EDEDED] bg-[#FAFAFA] font-sans text-black" data-testid="footer-landing">
      {showPoweredBy && (
        <div className="flex flex-col items-center gap-[3px] px-6 pt-8" data-testid="footer-powered-by">
          <span className="text-[11px] leading-4 text-[#6E6E73]">Powered by</span>
          <LogoLockup variant="lockup" className="text-[18px]" />
        </div>
      )}
      <div className="mx-auto max-w-[1280px] px-6 pb-10 pt-16 md:px-10 md:pt-24">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Link href="/" onClick={toTop} aria-label="FitCalendar home" data-testid="link-footer-home" className="inline-block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
              <LogoLockup variant="mark" className="text-[60px]" />
            </Link>
            <p className="mt-6 max-w-[22rem] text-[15px] leading-[1.65] text-[#5E5E61]">Find sports events, experts, and local communities in one place.</p>
            <p className="mt-4 font-['Inter_Tight',_'Inter',_sans-serif] text-[20px] font-semibold tracking-[-0.02em]">Train. Compete. Connect. Travel.</p>
          </div>
          <nav aria-label="Explore" className="md:col-span-2">
            <h2 className={hd}>Explore</h2>
            <ul className="space-y-3">
              <li><a {...ext} className={lk} href="https://fitcalendar.com/events" data-testid="link-footer-events">Events</a></li>
              <li><a {...ext} className={lk} href="https://fitcalendar.com/trainers" data-testid="link-footer-experts">Experts</a></li>
              <li><a {...ext} className={lk} href="https://fitcalendar.com/communities" data-testid="link-footer-communities">Communities</a></li>
            </ul>
          </nav>
          <nav aria-label="FitCalendar" className="md:col-span-2">
            <h2 className="mb-5 flex h-[18px] items-center"><LogoLockup className="text-[17px]" /></h2>
            <ul className="space-y-3">
              <li><a {...ext} className={lk} href="https://fitcalendar.com/companies-dashboard" data-testid="link-footer-organizers">Organizers</a></li>
              <li><a {...ext} className={lk} href="https://fitcalendar.com/about" data-testid="link-footer-about">About us</a></li>
            </ul>
          </nav>
          <div className="md:col-span-3">
            <h2 className={hd}>Get in touch</h2>
            <ul className="space-y-3">
              <li><a className={lk + ' break-all'} href="mailto:hello@fitdesignlab.com" data-testid="link-footer-email">hello@fitdesignlab.com</a></li>
              <li><a {...ext} className={lk} href="https://fitcalendar.com/contact" data-testid="link-footer-contact">Contact us</a></li>
              <li className="flex gap-5 pt-2">
                <a {...ext} className={lk} href="https://www.instagram.com/fitcalendar.app/" data-testid="link-footer-instagram">Instagram</a>
                <a {...ext} className={lk} href="https://www.linkedin.com/company/fitcalendar-app" data-testid="link-footer-linkedin">LinkedIn</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-[#E6E6E6] pt-8 text-[13px] text-[#6E6E73] md:mt-24 md:flex-row md:items-center md:justify-between">
          <p data-testid="text-copyright">© 2026 FitCalendar. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li><a {...ext} className="hover:text-black" href="https://fitcalendar.com/privacy" data-testid="link-footer-privacy">Privacy Policy</a></li>
            <li><Link href="/terms" className="hover:text-black" data-testid="link-footer-terms">Terms of Use</Link></li>
            <li><a {...ext} className="hover:text-black" href="https://fitcalendar.com/legal" data-testid="link-footer-legal">Legal Notice</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
