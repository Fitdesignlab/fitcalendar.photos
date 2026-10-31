import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { downloadPhoto } from '@/lib/download';
import type { EventPhoto } from '@/lib/events';
import { useToast } from '@/hooks/use-toast';

export type DemoProvider = 'google' | 'apple';
interface DemoUser { provider: DemoProvider; name: string }
interface PendingDownload { photo: EventPhoto; eventId: string }

interface Ctx {
  user: DemoUser | null;
  dialogOpen: boolean;
  pending: PendingDownload | null;
  openSignIn: () => void;
  closeSignIn: () => void;
  signIn: (p: DemoProvider) => void;
  signOut: () => void;
  requestDownload: (photo: EventPhoto, eventId: string) => void;
  downloadingId: string | null;
}

const KEY = 'fitcal-demo-session';
const AuthCtx = createContext<Ctx | null>(null);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<DemoUser | null>(() => {
    try { const s = sessionStorage.getItem(KEY); return s ? (JSON.parse(s) as DemoUser) : null; } catch { return null; }
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState<PendingDownload | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    try { if (user) sessionStorage.setItem(KEY, JSON.stringify(user)); else sessionStorage.removeItem(KEY); } catch { /* ignore */ }
  }, [user]);

  const run = useCallback(async (photo: EventPhoto, eventId: string) => {
    setDownloadingId(photo.id);
    try {
      await downloadPhoto(photo, eventId);
      toastRef.current({ title: 'Download started', description: photo.caption + ' (sample photo)' });
    } catch (e) {
      toastRef.current({ title: 'Download failed', description: e instanceof Error ? e.message : 'Try again.', variant: 'destructive' });
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const requestDownload = useCallback((photo: EventPhoto, eventId: string) => {
    if (!user) { setPending({ photo, eventId }); setDialogOpen(true); return; }
    void run(photo, eventId);
  }, [user, run]);

  const signIn = useCallback((provider: DemoProvider) => {
    setUser({ provider, name: provider === 'google' ? 'Demo runner (Google)' : 'Demo runner (Apple)' });
    setDialogOpen(false);
    setPending((p) => {
      if (p) setTimeout(() => void run(p.photo, p.eventId), 120);
      return null;
    });
    toastRef.current({ title: 'Signed in for this session', description: 'Demo sign-in only. Nothing was sent anywhere.' });
  }, [run]);

  const signOut = useCallback(() => {
    setUser(null);
    toastRef.current({ title: 'Signed out', description: 'Downloads are locked again.' });
  }, []);

  return (
    <AuthCtx.Provider value={{
      user, dialogOpen, pending, downloadingId,
      openSignIn: () => setDialogOpen(true),
      closeSignIn: () => { setDialogOpen(false); setPending(null); },
      signIn, signOut, requestDownload,
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useDemoAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useDemoAuth outside provider');
  return c;
}
