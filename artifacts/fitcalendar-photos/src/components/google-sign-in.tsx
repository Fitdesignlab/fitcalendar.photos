import { useEffect, useRef, useState } from 'react';
import { getGoogleAuthConfig } from '@workspace/api-client-react';
import { useAuth } from '@/context/auth';
import { loadGoogleIdentity } from '@/lib/google-identity';

export function GoogleSignIn() {
  const { signInWithGoogle, signingIn } = useAuth();
  const button = useRef<HTMLDivElement>(null);
  const signInRef = useRef(signInWithGoogle);
  signInRef.current = signInWithGoogle;
  const [status, setStatus] = useState('Loading Google sign-in...');
  const [error, setError] = useState('');
  const [origins, setOrigins] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const abort = new AbortController();
    setError('');
    setOrigins([]);
    setStatus('Loading Google sign-in...');
    const element = button.current;
    if (element) element.replaceChildren();
    void (async () => {
      try {
        const config = await getGoogleAuthConfig({ credentials: 'same-origin', signal: abort.signal });
        if (!active) return;
        if (!config.allowedOrigins.includes(window.location.origin)) {
          setOrigins(config.allowedOrigins);
          setStatus('');
          return;
        }
        const google = await loadGoogleIdentity();
        if (!active || !element) return;
        google.accounts.id.initialize({
          client_id: config.clientId, nonce: config.nonce, auto_select: false, ux_mode: 'popup',
          callback: ({ credential }) => {
            if (!active) return;
            setError('');
            void signInRef.current(credential, config.nonce).catch(() => {
              if (active) setError('Google sign-in could not be verified. Please retry and choose your Google account again.');
            });
          },
        });
        // This is Google's official button, not an imitation or invisible overlay.
        google.accounts.id.renderButton(element, {
          type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill',
          width: Math.min(320, element.clientWidth || 320), logo_alignment: 'left',
        });
        setStatus('');
      } catch {
        if (active) {
          setStatus('');
          setError('Google sign-in is unavailable. Check your connection and try again.');
        }
      }
    })();
    return () => { active = false; abort.abort(); element?.replaceChildren(); };
  }, [attempt]);

  return (
    <div className="space-y-3">
      <div ref={button} className={signingIn ? 'pointer-events-none flex min-h-11 justify-center opacity-50' : 'flex min-h-11 justify-center'} data-testid="button-signin-google" />
      {(status || signingIn) && <p role="status" className="text-center text-sm text-[#6E6E73]">{signingIn ? 'Verifying your Google account...' : status}</p>}
      {origins.length > 0 && <div className="rounded-2xl bg-[#F5F5F5] p-4 text-sm leading-6 text-[#5E5E61]" data-testid="status-google-origin">
        Google sign-in is enabled on the published websites, not this preview. Open one to sign in:
        <ul>{origins.map((origin) => <li key={origin}><a href={`${origin}/events`} className="underline underline-offset-2" data-testid={`link-google-origin-${new URL(origin).hostname}`}>{new URL(origin).hostname}</a></li>)}</ul>
      </div>}
      {error && <div role="alert" className="text-center text-sm text-black">
        <p>{error}</p>
        <button onClick={() => setAttempt((n) => n + 1)} disabled={signingIn} className="mt-2 rounded-full border border-[#D9D9D9] px-4 py-2 font-medium disabled:opacity-50" data-testid="button-retry-google">Retry Google sign-in</button>
      </div>}
    </div>
  );
}
