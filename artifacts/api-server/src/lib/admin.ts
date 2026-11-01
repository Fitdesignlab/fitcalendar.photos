export const ADMIN_EMAIL = "mariaucrispirela@gmail.com";
export const LIVE_EVENT_ID = "369";

export function isAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === ADMIN_EMAIL;
}
