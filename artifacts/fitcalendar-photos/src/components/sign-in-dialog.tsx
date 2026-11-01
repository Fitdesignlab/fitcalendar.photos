import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SiGoogle, SiApple } from 'react-icons/si';
import { useDemoAuth } from '@/context/demo-auth';
import { FMark } from './f-mark';

export function SignInDialog() {
  const { dialogOpen, closeSignIn, signIn, pending } = useDemoAuth();
  return (
    <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) closeSignIn(); }}>
      <DialogContent className="max-w-[400px] rounded-[28px] border border-[#E6E6E6] bg-white p-8 text-[#000] shadow-none sm:rounded-[28px]" data-testid="dialog-signin">
        <FMark className="h-9 w-9 brightness-0" />
        <DialogHeader className="mt-4 space-y-2 text-left">
          <DialogTitle className="font-[Inter_Tight] text-[30px] font-bold leading-[1.05] tracking-[-0.03em] text-[#000]">
            {pending ? 'Sign in to download.' : 'Sign in to get your photos.'}
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-6 text-[#5E5E61]">
            {pending
              ? 'Your download of "' + pending.photo.caption + '" starts right after.'
              : 'One tap and you are in the gallery.'}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-2.5">
          <button onClick={() => signIn('google')} data-testid="button-signin-google"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#D9D9D9] bg-white text-[15px] font-medium text-[#000] transition-colors hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
            <SiGoogle className="h-4 w-4" aria-hidden /> Continue with Google
          </button>
          <button onClick={() => signIn('apple')} data-testid="button-signin-apple"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-black text-[15px] font-medium text-white transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
            <SiApple className="h-4 w-4" aria-hidden /> Continue with Apple
          </button>
        </div>
        <p className="mt-5 rounded-2xl border border-[#E6E6E6] bg-[#F5F5F5] px-4 py-3 text-xs leading-relaxed text-[#6E6E73]" data-testid="text-demo-note">
          Demo sign-in. Neither button contacts Google or Apple and no credentials are requested. The session lasts until you close this tab, and photos are public samples.
        </p>
      </DialogContent>
    </Dialog>
  );
}
