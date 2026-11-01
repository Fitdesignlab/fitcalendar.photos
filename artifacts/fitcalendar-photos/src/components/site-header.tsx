import { Link, useLocation } from 'wouter';
import { LogOut } from 'lucide-react';
import { FMark } from './f-mark';
import { useDemoAuth } from '@/context/demo-auth';

export function SiteHeader() {
  const { user, openSignIn, signOut } = useDemoAuth();
  const [loc] = useLocation();
  const onEvents = loc === '/events' || loc.startsWith('/event/');
  return (
    <header className="sticky top-0 z-30 border-b border-[#EDEDED] bg-white/90 text-[#101410] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-5 md:h-[72px] md:px-10">
        <Link href="/" aria-label="Fit Calendar Photos home" data-testid="link-home" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
          <FMark className="h-8 w-8 brightness-0" />
        </Link>
        <nav className="flex items-center gap-1.5 text-[14px] font-medium sm:gap-2" aria-label="Main">
          <Link href="/events" data-testid="link-nav-events" aria-current={onEvents ? 'page' : undefined}
            className={'rounded-full px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ' + (onEvents ? 'bg-[#F2F2F2] text-[#101410]' : 'text-[#5E5E61] hover:text-[#101410]')}>
            Events
          </Link>
          {user ? (
            <>
              <span className="hidden text-[13px] text-[#6E6E73] md:inline" data-testid="text-user">{user.name}</span>
              <button onClick={signOut} aria-label="Sign out" data-testid="button-signout"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#D9D9D9] px-4 transition-colors hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
                <LogOut className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <button onClick={() => openSignIn()} data-testid="button-signin"
              className="h-10 rounded-full bg-black px-5 text-white transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
              Log in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
