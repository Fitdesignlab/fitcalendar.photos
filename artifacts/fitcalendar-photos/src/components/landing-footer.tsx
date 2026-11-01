import { useId } from 'react';
import { LogoLockup } from './logo-lockup';
import { CookieSettings } from './cookie-settings';
import './landing-footer.css';

const S = 'https://fitcalendar.com';
const svgP = { xmlns: 'http://www.w3.org/2000/svg', width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export function LandingFooter({ showPoweredBy = false }: { showPoweredBy?: boolean }) {
  const maskId = useId().replace(/:/g, '_');
  const markSrc = `${import.meta.env.BASE_URL}fitcalendar-mark.png`;
  const openCookies = () => window.dispatchEvent(new Event('photos:cookie-settings'));
  return (
    <>
      {showPoweredBy && (
        <div className="flex flex-col items-center gap-[3px] px-6 pt-8" data-testid="footer-powered-by">
          <span className="text-[11px] leading-4 text-[#6E6E73]">Powered by</span>
          <LogoLockup variant="lockup" className="text-[18px]" />
        </div>
      )}
      <footer className="fcl-footer" aria-label="Site footer" data-testid="footer-landing">
        <div className="fcl-container">
          <div className="fcl-grid">
            <div className="fcl-brand">
              <a aria-label="FitCalendar home" href={`${S}/`} className="fcl-home" data-testid="link-footer-home">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 678 678" fill="currentColor" role="img" aria-label="FitCalendar" className="fcl-mark">
                  <defs><mask id={maskId} style={{ maskType: 'alpha' }}><image href={markSrc} width="678" height="678" /></mask></defs>
                  <rect width="678" height="678" fill="currentColor" mask={`url(#${maskId})`} />
                </svg>
              </a>
              <p className="fcl-desc">Find sports events, experts, and local communities in one place.</p>
              <p className="fcl-tag">Train. Compete. Connect. Travel.</p>
            </div>
            <nav aria-label="Explore">
              <h2 className="fcl-h">Explore</h2>
              <ul className="fcl-list">
                <li><a href={`${S}/events`} className="fcl-link" data-testid="link-footer-events">Events</a></li>
                <li><a href={`${S}/trainers`} className="fcl-link" data-testid="link-footer-experts">Experts</a></li>
                <li><a href={`${S}/communities`} className="fcl-link" data-testid="link-footer-communities">Communities</a></li>
              </ul>
            </nav>
            <nav aria-label="FitCalendar">
              <h2 className="fcl-h">FitCalendar</h2>
              <ul className="fcl-list">
                <li><a href={`${S}/companies-dashboard`} className="fcl-link" data-testid="link-footer-organizers">Organizers</a></li>
                <li><a href={`${S}/about`} className="fcl-link" data-testid="link-footer-about">About us</a></li>
              </ul>
            </nav>
            <div>
              <h2 className="fcl-h">Get in touch</h2>
              <ul className="fcl-list">
                <li><a href="mailto:hello@fitdesignlab.com" className="fcl-link" data-testid="link-footer-email">hello@fitdesignlab.com</a></li>
                <li><a href={`${S}/contact`} className="fcl-link" data-testid="link-footer-contact">Contact us</a></li>
              </ul>
              <nav className="fcl-socialnav" aria-label="Social media">
                <ul className="fcl-socials">
                  <li>
                    <a href="https://www.instagram.com/fitcalendar.app/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="fcl-social" data-testid="link-footer-instagram">
                      <svg {...svgP} className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                    </a>
                  </li>
                  <li>
                    <a href="https://www.linkedin.com/company/fitcalendar-app" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="fcl-social" data-testid="link-footer-linkedin">
                      <svg {...svgP} className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          <div className="fcl-bottom">
            <div data-testid="text-copyright">© {new Date().getFullYear()} FitCalendar. All rights reserved.</div>
            <nav aria-label="Legal">
              <ul className="fcl-legal">
                <li><a href={`${S}/privacy`} className="fcl-link" data-testid="link-footer-privacy">Privacy Policy</a></li>
                <li><a href={`${S}/terms`} className="fcl-link" data-testid="link-footer-terms">Terms of Use</a></li>
                <li><a href={`${S}/legal`} className="fcl-link" data-testid="link-footer-legal">Legal Notice</a></li>
                <li><button type="button" onClick={openCookies} className="fcl-link" data-testid="button-cookie-settings">Cookie settings</button></li>
              </ul>
            </nav>
          </div>
        </div>
      </footer>
      <CookieSettings />
    </>
  );
}
