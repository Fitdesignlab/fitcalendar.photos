import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

const key = 'fitcalendar.photos.cookie-preferences';

/** Footer preferences only. This does not install analytics or change auth. */
export function CookieSettings() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const show = () => { setError(false); setOpen(true); };
    window.addEventListener('fitcalendar:cookie-settings', show);
    return () => window.removeEventListener('fitcalendar:cookie-settings', show);
  }, []);

  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify({ version: 1, essential: true, analytics: false, savedAt: Date.now() }));
      setOpen(false);
    } catch {
      setError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[calc(100%_-_2rem)] max-w-[480px] rounded-xl border border-[#E5E7EB] bg-white p-6 font-sans text-[#1D212B]" data-testid="dialog-cookie-settings">
        <DialogHeader className="space-y-3 text-left">
          <DialogTitle className="text-[14px] font-semibold leading-5">Cookie preferences</DialogTitle>
          <DialogDescription className="text-[12px] leading-[19.5px] text-[#6A7181]">
            Essential cookies keep your sign-in session secure and working. They are always on and do not require consent.
          </DialogDescription>
        </DialogHeader>
        <p className="text-[12px] leading-[19.5px] text-[#6A7181]">Optional analytics are not enabled by this Photos app. Saving these preferences keeps them off.</p>
        <a href="https://fitcalendar.com/privacy" className="w-fit text-[12px] text-[#6A7181] underline underline-offset-2 hover:text-[#1D212B]">Privacy Policy</a>
        {error && <p role="alert" className="text-[12px] text-[#6A7181]">We could not save your preferences in this browser. Essential cookies remain the only cookies enabled by this app.</p>}
        <button type="button" onClick={save} className="h-10 rounded-md border border-[#E5E7EB] bg-white px-4 text-[14px] font-medium hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black" data-testid="button-save-cookie-settings">
          Save essential-only preferences
        </button>
      </DialogContent>
    </Dialog>
  );
}
