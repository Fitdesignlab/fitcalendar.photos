import { createHash } from "node:crypto";
import type { GoogleUser } from "./auth-security";

// Fixed product policy, not an editable role, domain allowlist or first-user
// promotion. Store the normalized identity hash instead of a personal address
// in this public repository. Runtime configuration cannot add another admin.
const ONLY_ADMIN_EMAIL_SHA256 = "554be5e909b4cd2a0030b80d9b10a011539cf128980f9f5935d225c190ff45aa";

export function isPhotosAdmin(user: GoogleUser | null): boolean {
  return Boolean(user?.provider === "google" &&
    createHash("sha256").update(user.email.trim().toLowerCase()).digest("hex") === ONLY_ADMIN_EMAIL_SHA256);
}
