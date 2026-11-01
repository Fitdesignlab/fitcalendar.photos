import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import type { Server } from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import { createAuthRouter } from "../routes/auth";
import { createPhotosRouter } from "../routes/photos";
import { SessionCodec, SESSION_COOKIE, NONCE_COOKIE } from "../lib/auth-security";
import { verifyGoogleCredential } from "../lib/google-identity";

// This process uses synthetic test configuration. Nothing here can authenticate
// to the running application, and the application never injects a test verifier.
process.env.SESSION_SECRET = randomBytes(32).toString("base64url");
process.env.GOOGLE_CLIENT_ID = "test-client.apps.googleusercontent.com";
process.env.GOOGLE_ALLOWED_ORIGINS = "https://photos.example.test";
process.env.NODE_ENV = "production";
const origin = "https://photos.example.test";
const profile = { id: "test-subject", provider: "google" as const, name: "Test Runner", email: "runner@example.test", picture: "https://example.test/avatar.jpg" };
let server: Server, base: string;
before(async () => {
  const app = express();
  app.use(cookieParser(), express.json());
  app.use("/api", createAuthRouter(async (credential) => {
    if (credential !== "test-valid-credential") throw new Error("Rejected");
    return profile;
  }));
  app.use("/api", createPhotosRouter(fileURLToPath(new URL("../../../fitcalendar-photos/public/", import.meta.url))));
  await new Promise<void>((resolve, reject) => { server = app.listen(0, "127.0.0.1", (error) => error ? reject(error) : resolve()); });
  const address = server.address();
  assert(address && typeof address !== "string");
  base = `http://127.0.0.1:${address.port}/api`;
});
after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
const cookie = (response: Response, name: string) => response.headers.getSetCookie().find((v) => v.startsWith(`${name}=`))?.split(";")[0] ?? "";
async function challenge() {
  const response = await fetch(`${base}/auth/config`);
  assert.equal(response.status, 200);
  const data = await response.json() as { nonce: string };
  return { nonce: data.nonce, cookie: cookie(response, NONCE_COOKIE), response };
}
async function login(nonce: string, cookies: string, credential = "test-valid-credential", requestOrigin = origin) {
  return fetch(`${base}/auth/google`, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: requestOrigin, Cookie: cookies },
    body: JSON.stringify({ credential, nonce }),
  });
}

test("encrypted sessions reject tampering, expiration, wrong keys and wrong purposes", () => {
  const codec = new SessionCodec("synthetic-test-key-not-used-by-app");
  const token = codec.seal(profile, "google-session", 60);
  assert.deepEqual(codec.open(token, "google-session"), profile);
  assert.equal(codec.open(token, "login-nonce"), null);
  assert.equal(new SessionCodec("a-different-synthetic-test-key").open(token, "google-session"), null);
  const bytes = Buffer.from(token, "base64url"); bytes[30] ^= 1;
  assert.equal(codec.open(bytes.toString("base64url"), "google-session"), null);
  assert.equal(codec.open(codec.seal(profile, "google-session", -1), "google-session"), null);
  assert.equal(codec.open("malformed", "google-session"), null);
});
test("unsigned visitors and forged browser state have no session", async () => {
  const response = await fetch(`${base}/auth/session`, { headers: { Cookie: `${SESSION_COOKIE}=forged-demo-state` } });
  assert.deepEqual(await response.json(), { user: null });
  assert.match(response.headers.get("cache-control") ?? "", /no-store/);
});
test("login requires an authorized origin and a matching challenge cookie", async () => {
  const c = await challenge();
  assert.equal((await login(c.nonce, c.cookie, "test-valid-credential", "https://attacker.example")).status, 403);
  assert.equal((await login(c.nonce, "")).status, 401);
  assert.equal((await login("x".repeat(43), c.cookie)).status, 401);
  assert.equal((await login(c.nonce, c.cookie, "invalid-token")).status, 401);
});
test("verified login stores profile in a Secure HttpOnly cookie and survives a session read", async () => {
  const c = await challenge();
  const response = await login(c.nonce, c.cookie);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { user: profile });
  const session = response.headers.getSetCookie().find((s) => s.startsWith(`${SESSION_COOKIE}=`)) ?? "";
  for (const attribute of ["HttpOnly", "Secure", "SameSite=Lax", "Path=/api"]) assert(session.includes(attribute));
  assert(!session.includes(profile.email), "profile must be encrypted, not plain text");
  const me = await fetch(`${base}/auth/session`, { headers: { Cookie: cookie(response, SESSION_COOKIE) } });
  assert.deepEqual(await me.json(), { user: profile });
});
test("downloads require a Google session and reject traversal even when signed in", async () => {
  assert.equal((await fetch(`${base}/photos/download?file=landing/sport-0.jpg&eventId=demo&photoId=one`)).status, 401);
  const c = await challenge();
  const signed = await login(c.nonce, c.cookie);
  const headers = { Cookie: cookie(signed, SESSION_COOKIE) };
  const traversal = await fetch(`${base}/photos/download?file=../../.replit&eventId=demo&photoId=one`, { headers });
  assert.equal(traversal.status, 404);
  const photo = await fetch(`${base}/photos/download?file=landing/sport-0.jpg&eventId=demo&photoId=one`, { headers });
  assert.equal(photo.status, 200);
  assert.match(photo.headers.get("content-type") ?? "", /image\/jpeg/);
  assert.match(photo.headers.get("content-disposition") ?? "", /attachment/);
  assert((await photo.arrayBuffer()).byteLength > 1000);
});
test("logout rejects foreign origins and clears both cookies", async () => {
  assert.equal((await fetch(`${base}/auth/logout`, { method: "POST", headers: { Origin: "https://attacker.example" } })).status, 403);
  const response = await fetch(`${base}/auth/logout`, { method: "POST", headers: { Origin: origin } });
  assert.equal(response.status, 204);
  assert(response.headers.getSetCookie().some((s) => s.startsWith(`${SESSION_COOKIE}=`) && s.includes("Expires=")));
  assert(response.headers.getSetCookie().some((s) => s.startsWith(`${NONCE_COOKIE}=`) && s.includes("Expires=")));
});
test("the real Google verifier rejects a forged unsigned credential", async () => {
  await assert.rejects(verifyGoogleCredential("not.a.google.jwt", "invalid-nonce"));
});
