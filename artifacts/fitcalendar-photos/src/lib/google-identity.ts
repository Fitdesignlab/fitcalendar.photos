export interface GoogleIdentity {
  accounts: { id: {
    initialize: (options: {
      client_id: string; nonce: string; auto_select: boolean; ux_mode: 'popup';
      callback: (response: { credential: string }) => void;
    }) => void;
    renderButton: (parent: HTMLElement, options: {
      type: 'standard'; theme: 'outline'; size: 'large'; text: 'continue_with';
      shape: 'pill'; width: number; logo_alignment: 'left';
    }) => void;
    disableAutoSelect: () => void;
  } };
}
declare global { interface Window { google?: GoogleIdentity } }
let loading: Promise<GoogleIdentity> | null = null;

export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (window.google?.accounts.id) return Promise.resolve(window.google);
  if (loading) return loading;
  loading = new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    const fail = () => {
      clearTimeout(timer);
      script.remove();
      loading = null;
      reject(new Error('Google sign-in could not load. Check your connection or content blocker and try again.'));
    };
    const timer = window.setTimeout(fail, 15_000);
    script.onload = () => {
      clearTimeout(timer);
      if (window.google?.accounts.id) resolve(window.google);
      else fail();
    };
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return loading;
}
export function disableGoogleAutoSelect() {
  window.google?.accounts.id.disableAutoSelect();
}
