import assert from "node:assert/strict";
import { test, after } from "node:test";
import { createHash, randomBytes } from "node:crypto";
import express from "express";
import cookieParser from "cookie-parser";
import sharp from "sharp";
import { db, pool } from "@workspace/db";
import { createGalleryRouter } from "../routes/gallery";
import { createGalleryRepository } from "../lib/gallery-repository";
import { GalleryStorage } from "../lib/gallery-storage";
import { ObjectStorageService } from "../lib/objectStorage";
import { SessionCodec, SESSION_COOKIE } from "../lib/auth-security";
import { RequestGalleryUploadResponse, GetEventGalleryResponse } from "@workspace/api-zod";

after(() => pool.end());
test("real upload, durable SQL metadata, preview, protected original and removal", {
  skip: process.env.RUN_STORAGE_INTEGRATION !== "1",
}, async () => {
  // This test uses a rolled-back SQL transaction and unique private storage
  // objects. Test photographs are never visible to the running gallery.
  process.env.SESSION_SECRET = randomBytes(32).toString("base64url");
  process.env.PHOTOS_ADMIN_EMAIL_SHA256 = createHash("sha256").update("storage-owner@example.test").digest("hex");
  process.env.GOOGLE_ALLOWED_ORIGINS = "https://photos.example.test";
  const user = { id: "storage-verifier", provider: "google", name: "Storage verifier", email: "storage-owner@example.test", picture: null };
  const token = new SessionCodec(process.env.SESSION_SECRET).seal(user, "google-session", 60);
  const headers = { Cookie: `${SESSION_COOKIE}=${token}`, Origin: "https://photos.example.test", "Content-Type": "application/json" };
  const storage = new GalleryStorage();
  const rollback = new Error("Intentional verification rollback");
  let staging: string | undefined;
  try {
    await db.transaction(async (tx) => {
      const repo = createGalleryRepository(tx);
      const app = express();
      app.use(cookieParser(), express.json());
      app.use("/api", createGalleryRouter(repo, storage));
      const server = app.listen(0, "127.0.0.1");
      await new Promise<void>((resolve) => server.once("listening", resolve));
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Verification server failed");
      const base = `http://127.0.0.1:${address.port}/api/events/369/photos`;
      try {
        const bytes = await sharp({ create: { width: 32, height: 20, channels: 3, background: "#333" } }).png().toBuffer();
        const requested = await fetch(base + "/uploads", { method: "POST", headers, body: JSON.stringify({ name: "verification.png", mime: "image/png", size: bytes.length }) });
        assert.equal(requested.status, 201);
        const ticket = RequestGalleryUploadResponse.parse(await requested.json());
        staging = new ObjectStorageService().normalizeObjectEntityPath(ticket.uploadUrl);
        for (const origin of ["https://fitcalendar.photos", "https://fit-fotos.replit.app"]) {
          const preflight = await fetch(ticket.uploadUrl, { method: "OPTIONS", headers: { Origin: origin, "Access-Control-Request-Method": "PUT", "Access-Control-Request-Headers": "content-type" } });
          assert([origin, "*"].includes(preflight.headers.get("access-control-allow-origin") ?? ""), "Production origin must support storage PUT");
        }
        assert.equal((await fetch(ticket.uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: bytes })).status, 200);
        assert.equal((await fetch(base + `/${ticket.id}/complete`, { method: "POST", headers })).status, 200);
        const gallery = GetEventGalleryResponse.parse(await (await fetch(base)).json());
        assert(gallery.photos.some((p) => p.id === ticket.id));
        assert.equal((await repo.find(ticket.id))?.status, "ready");
        const preview = await fetch(base + `/${ticket.id}/preview`);
        assert.equal(preview.status, 200);
        const previewInfo = await sharp(Buffer.from(await preview.arrayBuffer())).metadata();
        assert.equal(previewInfo.format, "jpeg");
        assert.equal((await fetch(base + `/${ticket.id}/download`)).status, 401);
        const unsignedOriginal = new URL(ticket.uploadUrl);
        unsignedOriginal.search = "";
        unsignedOriginal.pathname += "-original";
        assert.notEqual((await fetch(unsignedOriginal)).status, 200, "Private originals must not be directly public in storage");
        const original = await fetch(base + `/${ticket.id}/download`, { headers });
        assert.equal(original.status, 200);
        assert.deepEqual(Buffer.from(await original.arrayBuffer()), bytes);
        assert.equal((await fetch(base + `/${ticket.id}`, { method: "DELETE", headers })).status, 204);
        assert(!(await repo.list()).some((p) => p.id === ticket.id));
      } finally {
        server.closeAllConnections();
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
      throw rollback;
    });
  } catch (error) {
    if (error !== rollback) throw error;
  } finally {
    if (staging) for (const path of [staging, staging + "-original", staging + "-preview.jpg"]) await storage.removePath(path);
  }
});
