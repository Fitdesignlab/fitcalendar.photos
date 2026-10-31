// MOCK auth. Replace with real Google / Apple OAuth (e.g. Firebase Auth, Auth.js, Supabase).
export type Provider = 'google' | 'apple'
const COOKIE = 'fcp_session'

export function signIn(provider: Provider) {
  const session = { provider, user: `demo-${provider}-user`, at: Date.now() }
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}
export function signOut() {
  document.cookie = `${COOKIE}=; path=/; max-age=0`
}
export function getSession(): { provider: Provider; user: string } | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`))
  if (!m) return null
  try { return JSON.parse(decodeURIComponent(m[1])) } catch { return null }
}
