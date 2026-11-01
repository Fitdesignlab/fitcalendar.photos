import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { CookieOptions, Request, Response } from "express";
import { GetAuthSessionResponse } from "@workspace/api-zod";

export type GoogleUser = NonNullable<ReturnType<typeof GetAuthSessionResponse.parse>["user"]>;
export const SESSION_COOKIE = "fitcal_session";
export const NONCE_COOKIE = "fitcal_login";
export const SESSION_SECONDS = 7 * 24 * 60 * 60;
export const NONCE_SECONDS = 10 * 60;

// Encrypted, authenticated cookies work across deployment replicas without an
// in-memory session store. Purpose binding prevents a login nonce becoming a session.
export class SessionCodec {
  private key: Buffer;
  constructor(secret: string) {
    if (!secret || secret.length < 16) throw new Error("SESSION_SECRET must contain at least 16 characters.");
    this.key = createHash("sha256").update(secret).digest();
  }
  seal(value: unknown, purpose: string, seconds: number): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    cipher.setAAD(Buffer.from(purpose));
    const ciphertext = Buffer.concat([cipher.update(JSON.stringify({ value, expires: Date.now() + seconds * 1000 })), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64url");
  }
  open(token: unknown, purpose: string): unknown {
    try {
      if (typeof token !== "string" || token.length > 6000) return null;
      const data = Buffer.from(token, "base64url");
      if (data.length < 29) return null;
      const decipher = createDecipheriv("aes-256-gcm", this.key, data.subarray(0, 12));
      decipher.setAAD(Buffer.from(purpose));
      decipher.setAuthTag(data.subarray(12, 28));
      const { value, expires } = JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString());
      return typeof expires === "number" && expires > Date.now() ? value : null;
    } catch { return null; }
  }
}

let codec: SessionCodec | undefined;
export function sessionCodec() {
  return codec ??= new SessionCodec(process.env.SESSION_SECRET ?? "");
}

export function allowedOrigins(): string[] {
  return (process.env.GOOGLE_ALLOWED_ORIGINS ?? "").split(",").map((v) => v.trim()).filter(Boolean);
}

export function isAllowedOrigin(req: Request): boolean {
  return allowedOrigins().includes(req.get("origin") ?? "");
}

export function cookieOptions(): CookieOptions {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api" };
}

export function readUser(req: Request): GoogleUser | null {
  const user = sessionCodec().open(req.cookies?.[SESSION_COOKIE], "google-session");
  const parsed = GetAuthSessionResponse.safeParse({ user });
  return parsed.success ? parsed.data.user : null;
}

export function noStore(res: Response) {
  res.set({ "Cache-Control": "no-store, private", Pragma: "no-cache", Vary: "Cookie" });
}

export function matchingNonce(a: unknown, b: unknown): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
