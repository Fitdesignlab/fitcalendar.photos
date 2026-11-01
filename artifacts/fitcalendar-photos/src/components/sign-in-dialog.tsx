import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SiApple } from 'react-icons/si';
import { useAuth } from '@/context/auth';
import { LogoLockup } from './logo-lockup';
import { GoogleSignIn } from './google-sign-in';

export function SignInDialog() {
  const { dialogOpen, closeSignIn, pending } = useAuth();
  return (
    <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) closeSignIn(); }}>
      <DialogContent className="max-w-[400px] rounded-[28px] border border-[#E6E6E6] bg-white p-8 text-[#000] shadow-none sm:rounded-[28px]" data-testid="dialog-signin">
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
        <div className="mt-6 space-y-2.5">
          {dialogOpen && <GoogleSignIn />}
          <button disabled aria-describedby="apple-unavailable" data-testid="button-signin-apple"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#D9D9D9] bg-[#F5F5F5] text-[15px] font-medium text-[#6E6E73] disabled:cursor-not-allowed">
            <SiApple className="h-4 w-4" aria-hidden /> Apple sign-in coming soon
          </button>
          <p id="apple-unavailable" className="text-center text-xs text-[#6E6E73]">Apple sign-in is not active. Please use Google.</p>
        </div>
        <p className="mt-5 rounded-2xl border border-[#E6E6E6] bg-[#F5F5F5] px-4 py-3 text-xs leading-relaxed text-[#6E6E73]" data-testid="text-auth-note">
          Google verifies your account. We use your name, email and profile picture for your session. Photos and events shown here are illustrative samples.
        </p>
      </DialogContent>
    </Dialog>
  );
}
