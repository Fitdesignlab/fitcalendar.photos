import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SiApple } from 'react-icons/si';
import { useAuth } from '@/context/auth';
import { LogoLockup } from './logo-lockup';
import { GoogleSignIn } from './google-sign-in';

export function SignInDialog() {
  const { dialogOpen, closeSignIn, pending } = useAuth();
  return (
    <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) closeSignIn(); }}>
      <DialogContent className="max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-[400px] grid-cols-1 overflow-y-auto rounded-[28px] border border-[#E6E6E6] bg-white p-8 text-[#000] shadow-none sm:rounded-[28px]" data-testid="dialog-signin">
        <LogoLockup className="text-[26px]" />
        <DialogHeader className="mt-4 space-y-2 text-left">
          <DialogTitle className="font-[Inter_Tight] text-[30px] font-bold leading-[1.05] tracking-[-0.03em] text-[#000]">
            {pending ? 'Sign in to download.' : 'Sign in to get your photos.'}
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-6 text-[#5E5E61]">
            {pending
              ? 'Your download of "' + pending.photo.caption + '" starts right after.'
              : 'Sign in with your Google account to find your event photos.'}
          </DialogDescription>
        </DialogHeader>
        <div className="mx-auto mt-6 min-w-0 w-full max-w-[320px] space-y-2.5">
          {dialogOpen && <GoogleSignIn />}
          <button disabled data-testid="button-signin-apple"
            className="relative flex h-10 w-full items-center justify-center rounded-[20px] border border-black bg-black px-3 font-[Arial,sans-serif] text-[14px] font-medium tracking-[.25px] text-white disabled:cursor-not-allowed">
            <SiApple className="absolute left-3 h-[18px] w-[18px]" aria-hidden /> Continue with Apple
          </button>
        </div>
        <p className="mt-5 rounded-2xl border border-[#E6E6E6] bg-[#F5F5F5] px-4 py-3 text-xs leading-relaxed text-[#6E6E73]" data-testid="text-auth-note">
          Google verifies your account. We use your name, email and profile picture for your session. Photos and events shown here are illustrative samples.
        </p>
      </DialogContent>
    </Dialog>
  );
}
