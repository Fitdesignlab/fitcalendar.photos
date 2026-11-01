export const ADMIN_EMAIL = 'mariaucrispirela@gmail.com';
export const LIVE_EVENT_ID = '369';

export function isAdmin(user: { email?: string | null } | null | undefined): boolean {
  return (user?.email ?? '').trim().toLowerCase() === ADMIN_EMAIL;
}
