import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SiGoogle, SiApple } from 'react-icons/si';
import { useDemoAuth } from '@/context/demo-auth';
import { FMark } from './f-mark';

export function SignInDialog() {
  const { dialogOpen, closeSignIn, signIn, pending } = useDemoAuth();
  return (
    <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) closeSignIn(); }}>
      <DialogContent className="max-w-md rounded-md border-border bg-card p-0 overflow-hidden" data-testid="dialog-signin">
        <div className="bg-[#151311] px-7 pb-6 pt-7 text-[#f4f1ec]">
          <FMark className="h-8 w-8 text-[#f4f1ec]" />
          <p className="mt-5 font-mono-ui text-[10px] uppercase text-[#ea4a1f]">Demo sign-in, not real OAuth</p>
          <DialogHeader className="mt-1 text-left">
            <DialogTitle className="font-display text-3xl font-semibold text-[#f4f1ec]">
              {pending ? 'Sign in to download.' : 'Sign in.'}
            </DialogTitle>
            <DialogDescription className="text-sm text-white/65">
              {pending
                ? 'Your download of "' + pending.photo.caption + '" will start right after.'
                : 'Unlock downloads for the sample galleries.'}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="space-y-3 px-7 py-6">
          <button onClick={() => signIn('google')} data-testid="button-signin-google"
            className="flex w-full items-center justify-center gap-3 rounded-md border border-input bg-background py-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <SiGoogle className="h-4 w-4" aria-hidden /> Continue with Google (demo)
          </button>
          <button onClick={() => signIn('apple')} data-testid="button-signin-apple"
            className="flex w-full items-center justify-center gap-3 rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <SiApple className="h-4 w-4" aria-hidden /> Continue with Apple (demo)
          </button>
          <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
            This is a stub. No account is contacted and no credentials are requested. The session lasts until you close this tab.
            Photos here are public sample images, not private photo access.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
