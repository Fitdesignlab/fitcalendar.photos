import { OAuth2Client } from "google-auth-library";
import type { GoogleUser } from "./auth-security";

const google = new OAuth2Client();

export async function verifyGoogleCredential(credential: string, nonce: string): Promise<GoogleUser> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Google sign-in is not configured.");
  // The official library verifies Google's signature, audience, issuer and expiry.
  const ticket = await google.verifyIdToken({ idToken: credential, audience: clientId });
  const claims = ticket.getPayload();
  if (!claims?.sub || !claims.email || claims.email_verified !== true ||
      (claims as typeof claims & { nonce?: string }).nonce !== nonce) {
    throw new Error("Google credential is invalid.");
  }
  return {
    id: claims.sub,
    provider: "google",
    name: claims.name || claims.email,
    email: claims.email,
    picture: claims.picture?.startsWith("https://") ? claims.picture : null,
  };
}
