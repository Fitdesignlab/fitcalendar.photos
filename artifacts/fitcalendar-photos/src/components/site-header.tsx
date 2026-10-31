import { Link } from 'wouter';
import { LogOut } from 'lucide-react';
import { FMark } from './f-mark';
import { useDemoAuth } from '@/context/demo-auth';

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const { user, openSignIn, signOut } = useDemoAuth();
  const tone = overlay ? 'text-[#ffffff]' : 'text-foreground';
  return (
    <header className={(overlay ? 'absolute inset-x-0 top-0 z-30 ' : 'sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md ') + tone}>
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10">
        <Link href="/" aria-label="Fit Calendar Photos home" data-testid="link-home" className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <FMark className="h-9 w-9" />
        </Link>
        <nav className="flex items-center gap-2 font-mono-ui text-[11px] uppercase">
          <span className={'hidden sm:inline rounded-full border px-2.5 py-1 ' + (overlay ? 'border-white/25 text-white/70' : 'border-border text-muted-foreground')} data-testid="status-demo">Demo</span>
          {user ? (
            <>
              <span className={'hidden md:inline ' + (overlay ? 'text-white/80' : 'text-muted-foreground')} data-testid="text-user">{user.name}</span>
              <button onClick={signOut} data-testid="button-signout"
                className={'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' + (overlay ? 'bg-white/10 hover:bg-white/20' : 'bg-secondary hover:bg-muted')}>
                <LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out
              </button>
            </>
          ) : (
            <button onClick={() => openSignIn()} data-testid="button-signin"
              className={'rounded-full px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' + (overlay ? 'bg-[#ffffff] text-[#0a0a0a] hover:bg-white' : 'bg-primary text-primary-foreground hover:opacity-90')}>
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
