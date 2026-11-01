import { Link } from 'wouter';
import { FitCalendarMark } from './fitcalendar-mark';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
const link = 'fc-link rounded-sm text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black';

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const social = [
  { name: 'Instagram', href: 'https://www.instagram.com/fitcalendar.app/', testid: 'link-footer-instagram', Icon: InstagramIcon },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/fitcalendar-app', testid: 'link-footer-linkedin', Icon: LinkedInIcon },
] as const;

export function LandingFooter({ showPoweredBy = false }: { showPoweredBy?: boolean }) {
  const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  return (
    <>
      {showPoweredBy && (
        <div className="flex justify-center bg-white px-6 pb-6 pt-10" data-testid="footer-powered-by">
          <img
            src={`${import.meta.env.BASE_URL}brand/powered-by-fitcalendar.svg`}
            alt="Powered by FitCalendar"
            width={134}
            height={32}
            className="h-8 w-[134px]"
            data-testid="img-powered-by-lockup"
          />
        </div>
      )}
      <footer className={'fc-footer border-t ' + (showPoweredBy ? '' : 'mt-12')} aria-label="Site footer" data-testid="footer-landing">
        <div className="container mx-auto px-4 py-12 md:py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <a href="https://fitcalendar.com/" {...ext} aria-label="FitCalendar home" data-testid="link-footer-home" className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
                <FitCalendarMark testId="img-footer-mark" className="h-8 w-auto" />
              </a>
              <p className="fc-muted mt-4 max-w-xs text-sm leading-relaxed">Find sports events, experts, and local communities in one place.</p>
              <p className="mt-3 text-sm font-medium">Train. Compete. Connect. Travel.</p>
            </div>
            <nav aria-label="Explore">
              <h2>Explore</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a {...ext} className={link} href="https://fitcalendar.com/events" data-testid="link-footer-events">Events</a></li>
                <li><a {...ext} className={link} href="https://fitcalendar.com/trainers" data-testid="link-footer-experts">Experts</a></li>
                <li><a {...ext} className={link} href="https://fitcalendar.com/communities" data-testid="link-footer-communities">Communities</a></li>
              </ul>
            </nav>
            <nav aria-label="FitCalendar">
              <h2 data-testid="text-footer-fitcalendar">FitCalendar</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a {...ext} className={link} href="https://fitcalendar.com/companies-dashboard" data-testid="link-footer-organizers">Organizers</a></li>
                <li><a {...ext} className={link} href="https://fitcalendar.com/about" data-testid="link-footer-about">About us</a></li>
              </ul>
            </nav>
            <div>
              <h2>Get in touch</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a className={link + ' break-all'} href="mailto:hello@fitdesignlab.com" data-testid="link-footer-email">hello@fitdesignlab.com</a></li>
                <li><a {...ext} className={link} href="https://fitcalendar.com/contact" data-testid="link-footer-contact">Contact us</a></li>
              </ul>
              <nav className="mt-4" aria-label="Social media">
                <ul className="flex items-center gap-2">
                  {social.map(({ name, href, testid, Icon }) => (
                    <li key={name}>
                      <a {...ext} href={href} aria-label={name} data-testid={testid} className="fc-social inline-flex size-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
                        <Icon />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
          <div className="fc-legal mt-10 flex flex-col gap-4 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p data-testid="text-copyright">© {new Date().getFullYear()} FitCalendar. All rights reserved.</p>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                <li><a {...ext} className={link} href="https://fitcalendar.com/privacy" data-testid="link-footer-privacy">Privacy Policy</a></li>
                <li><Link href="/terms" onClick={toTop} className={link} data-testid="link-footer-terms">Terms of Use</Link></li>
                <li><a {...ext} className={link} href="https://fitcalendar.com/legal" data-testid="link-footer-legal">Legal Notice</a></li>
                <li>
                  <button type="button" className={link} data-testid="button-cookie-settings" onClick={() => window.dispatchEvent(new Event('fitcalendar:cookie-settings'))}>
                    Cookie settings
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
