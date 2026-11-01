import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { getGetAuthSessionQueryKey, useGetAuthSession, useGoogleSignIn, useLogoutAuth, type AuthUser, type AuthSession } from '@workspace/api-client-react';
import { downloadPhoto } from '@/lib/download';
import type { EventPhoto } from '@/lib/events';
import { useToast } from '@/hooks/use-toast';
import { disableGoogleAutoSelect } from '@/lib/google-identity';

interface PendingDownload { photo: EventPhoto; eventId: string }
interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signingIn: boolean;
  signingOut: boolean;
  dialogOpen: boolean;
  pending: PendingDownload | null;
  downloadingId: string | null;
  openSignIn: (opts?: { redirectTo?: string }) => void;
  closeSignIn: () => void;
  signInWithGoogle: (credential: string, nonce: string) => Promise<void>;
  signOut: () => void;
  requestDownload: (photo: EventPhoto, eventId: string) => void;
}
const AuthContext = createContext<AuthContextValue | null>(null);
const statusOf = (error: unknown) => error && typeof error === 'object' && 'status' in error ? error.status : null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const cache = useQueryClient();
  const sessionKey = getGetAuthSessionQueryKey();
  const session = useGetAuthSession({
    query: { queryKey: sessionKey, staleTime: 30_000, refetchOnWindowFocus: true, refetchInterval: 60_000, retry: 1 },
    request: { credentials: 'same-origin' },
  });
  // Only a server-validated session can unlock downloads. Old demo browser
  // state is deliberately ignored and removed.
  const user = session.isError ? null : session.data?.user ?? null;
  const login = useGoogleSignIn({ request: { credentials: 'same-origin' } });
  const logout = useLogoutAuth({ request: { credentials: 'same-origin' } });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState<PendingDownload | null>(null);
  const pendingRef = useRef<PendingDownload | null>(null);
  const redirectRef = useRef('/events');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    try { sessionStorage.removeItem('fitcal-demo-session'); } catch { /* storage can be disabled */ }
  }, []);

  const setWaiting = (download: PendingDownload | null) => {
    pendingRef.current = download;
    setPending(download);
  };

  const runDownload = useCallback(async (photo: EventPhoto, eventId: string) => {
    setDownloadingId(photo.id);
    try {
      await downloadPhoto(photo, eventId);
      toast({ title: 'Download started', description: `${photo.caption} (sample photo)` });
    } catch (error) {
      if (statusOf(error) === 401) {
        cache.setQueryData<AuthSession>(getGetAuthSessionQueryKey(), { user: null });
        setWaiting({ photo, eventId });
        setDialogOpen(true);
        toast({ title: 'Please sign in again', description: 'Your session expired. Sign in with Google to continue.' });
      } else {
        toast({ title: 'Download failed', description: 'The photo could not be downloaded. Please try again.', variant: 'destructive' });
      }
    } finally { setDownloadingId(null); }
  }, [cache, toast]);

  const requestDownload = (photo: EventPhoto, eventId: string) => {
    if (!user) {
      setWaiting({ photo, eventId });
      setDialogOpen(true);
    } else { void runDownload(photo, eventId); }
  };

  const signInWithGoogle = async (credential: string, nonce: string) => {
    const result = await login.mutateAsync({ data: { credential, nonce } });
    if (!result.user) throw new Error('Google sign-in did not create a session.');
    await cache.cancelQueries({ queryKey: getGetAuthSessionQueryKey() });
    cache.setQueryData<AuthSession>(getGetAuthSessionQueryKey(), result);
    const download = pendingRef.current;
    setWaiting(null);
    setDialogOpen(false);
    toast({ title: 'Signed in with Google', description: `Welcome, ${result.user.name}.` });
    if (download) await runDownload(download.photo, download.eventId);
    else navigate(redirectRef.current);
  };

  const signOut = () => {
    void logout.mutateAsync().then(async () => {
      await cache.cancelQueries({ queryKey: getGetAuthSessionQueryKey() });
      disableGoogleAutoSelect();
      cache.setQueryData<AuthSession>(getGetAuthSessionQueryKey(), { user: null });
      setWaiting(null);
      setDialogOpen(false);
      navigate('/', { replace: true });
      window.scrollTo(0, 0);
    }).catch(() => {
      toast({ title: 'Could not sign out', description: 'Please try again. Your session has not been cleared.', variant: 'destructive' });
    });
  };

  return (
    <AuthContext.Provider value={{
      user, loading: session.isPending, signingIn: login.isPending, signingOut: logout.isPending,
      dialogOpen, pending, downloadingId, requestDownload, signInWithGoogle, signOut,
      openSignIn: (opts) => { redirectRef.current = opts?.redirectTo ?? '/events'; setWaiting(null); setDialogOpen(true); },
      closeSignIn: () => { if (!login.isPending) { setDialogOpen(false); setWaiting(null); } },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used inside AuthProvider');
  return auth;
}
