import { randomBytes } from "node:crypto";
import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { GetGoogleAuthConfigResponse, GetAuthSessionResponse, GoogleSignInBody, GoogleSignInResponse } from "@workspace/api-zod";
import { allowedOrigins, cookieOptions, isAllowedOrigin, matchingNonce, noStore, NONCE_COOKIE, NONCE_SECONDS, readUser, SESSION_COOKIE, SESSION_SECONDS, sessionCodec } from "../lib/auth-security";
import { verifyGoogleCredential } from "../lib/google-identity";

// Dependency injection is for isolated security tests only. The application
// always constructs this router with the official Google verifier.
export function createAuthRouter(verify = verifyGoogleCredential): IRouter {
  const router: IRouter = Router();
  router.use("/auth", (_req, res, next) => { noStore(res); next(); });
  const loginLimit = rateLimit({
    windowMs: 10 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false,
    message: { error: "Too many sign-in attempts. Please try again in a few minutes." },
  });

  router.get("/auth/config", loginLimit, (_req, res): void => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId || allowedOrigins().length === 0) {
      res.status(503).json({ error: "Google sign-in is not configured." }); return;
    }
    const nonce = randomBytes(32).toString("base64url");
    res.cookie(NONCE_COOKIE, sessionCodec().seal(nonce, "login-nonce", NONCE_SECONDS), { ...cookieOptions(), maxAge: NONCE_SECONDS * 1000 });
    res.json(GetGoogleAuthConfigResponse.parse({ clientId, nonce, allowedOrigins: allowedOrigins() }));
  });

  router.get("/auth/session", (req, res): void => {
    res.json(GetAuthSessionResponse.parse({ user: readUser(req) }));
  });

  router.post("/auth/google", loginLimit, async (req, res): Promise<void> => {
    if (!isAllowedOrigin(req)) {
      res.status(403).json({ error: "Sign in from an authorized Fit Calendar Photos website." }); return;
    }
    const body = GoogleSignInBody.safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: "Invalid sign-in request." }); return; }
    const nonce = sessionCodec().open(req.cookies?.[NONCE_COOKIE], "login-nonce");
    // Explicit nonce + HttpOnly challenge cookie + exact Origin check protect
    // the JS credential callback against login CSRF and token substitution.
    if (!matchingNonce(nonce, body.data.nonce)) {
      res.status(401).json({ error: "Sign-in expired. Close this dialog and try again." }); return;
    }
    try {
      const user = await verify(body.data.credential, body.data.nonce);
      const session = GoogleSignInResponse.parse({ user });
      res.clearCookie(NONCE_COOKIE, cookieOptions());
      res.cookie(SESSION_COOKIE, sessionCodec().seal(user, "google-session", SESSION_SECONDS), { ...cookieOptions(), maxAge: SESSION_SECONDS * 1000 });
      res.json(session);
    } catch {
      // Never log the credential, profile or cookie.
      req.log?.warn("Google credential verification failed");
      res.status(401).json({ error: "Google sign-in could not be verified. Please try again." });
    }
  });

  router.post("/auth/logout", (req, res): void => {
    // Also allow same-origin development logout; GIS login itself is restricted
    // to the explicitly authorized production origins.
    const origin = req.get("origin");
    const ownOrigin = `${req.protocol}://${req.get("host")}`;
    if (!origin || (!isAllowedOrigin(req) && origin !== ownOrigin)) {
      res.status(403).json({ error: "Request origin is not allowed." }); return;
    }
    res.clearCookie(SESSION_COOKIE, cookieOptions());
    res.clearCookie(NONCE_COOKIE, cookieOptions());
    res.sendStatus(204);
  });
  return router;
}
