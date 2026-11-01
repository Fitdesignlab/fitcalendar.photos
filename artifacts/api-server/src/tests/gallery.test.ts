import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { Server } from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import sharp from "sharp";
import { pool, type EventPhotoRow } from "@workspace/db";
import { createGalleryRouter } from "../routes/gallery";
import type { GalleryRepository } from "../lib/gallery-repository";
import { createPhotoPreview, InvalidImageError } from "../lib/gallery-storage";
import { SessionCodec, SESSION_COOKIE } from "../lib/auth-security";
import { GetEventGalleryResponse, RequestGalleryUploadResponse, CompleteGalleryUploadResponse } from "@workspace/api-zod";
import { isPhotosAdmin } from "../lib/admin-policy";

// Isolated synthetic sessions cannot authenticate to the running application.
process.env.SESSION_SECRET = randomBytes(32).toString("base64url");
process.env.PHOTOS_ADMIN_EMAIL_SHA256 = createHash("sha256").update("owner@example.test").digest("hex");
process.env.GOOGLE_ALLOWED_ORIGINS = "https://photos.example.test";
const origin = "https://photos.example.test";
const owner = { id: "owner-subject", provider: "google", name: "Owner", email: process.env.PHOTOS_ADMIN_TEST_EMAIL ?? "owner@example.test", picture: null };
const visitor = { ...owner, id: "visitor-subject", email: "visitor@example.test" };
const rows = new Map<string, EventPhotoRow>();
const repo: GalleryRepository = {
  async list() { return [...rows.values()].filter((r) => r.status === "ready"); },
  async find(id) { return rows.get(id); },
  async insert(row) { const value = { ...row, createdAt: new Date(), previewPath: null, status: "pending" }; rows.set(row.id, value); return value; },
  async publish(id, paths) { const value = { ...rows.get(id)!, ...paths, status: "ready" }; rows.set(id, value); return value; },
  async remove(id) { rows.delete(id); },
};
let invalidImage = false, publishCalls = 0;
const storage = {
  async reserve() { return { uploadUrl: "https://upload.example.test/private", objectPath: "/objects/uploads/" + randomUUID() }; },
  async publish(row: EventPhotoRow) {
    publishCalls++;
    if (invalidImage) throw new InvalidImageError("Invalid test image");
    return { objectPath: row.objectPath + "-original", previewPath: row.objectPath + "-preview.jpg" };
  },
  async removePath() {},
  async serve(_path: string, res: express.Response, name?: string) {
    if (name) res.attachment(name);
    else res.type("image/jpeg");
    res.send(Buffer.from("synthetic image bytes"));
  },
};
let server: Server, base: string;
const cookie = (user = owner) => `${SESSION_COOKIE}=${new SessionCodec(process.env.SESSION_SECRET!).seal(user, "google-session", 60)}`;
const headers = (user = owner) => ({ Cookie: cookie(user), Origin: origin, "Content-Type": "application/json" });
const request = (path = "", options?: RequestInit) => fetch(base + path, options);
const galleryJson = async (response: globalThis.Response) => GetEventGalleryResponse.parse(await response.json());
const uploadJson = async (response: globalThis.Response) => RequestGalleryUploadResponse.parse(await response.json());
const input = { name: "actual-event-photo.png", mime: "image/png", size: 1234 };
before(async () => {
  const app = express();
  app.use(cookieParser(), express.json());
  // Synthetic owner policy only in this isolated test router. An optional
  // runtime-supplied approved identity exercises the actual production policy.
  const testPolicy = process.env.PHOTOS_ADMIN_TEST_EMAIL ? isPhotosAdmin :
    (user: Parameters<typeof isPhotosAdmin>[0]) => Boolean(user?.provider === "google" && user.email.toLowerCase() === owner.email);
  app.use("/api", createGalleryRouter(repo, storage, testPolicy));
  app.use("/strict-api", createGalleryRouter(repo, storage));
  await new Promise<void>((resolve) => { server = app.listen(0, "127.0.0.1", () => resolve()); });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server failed");
  base = `http://127.0.0.1:${address.port}/api/events/369/photos`;
});
after(async () => { await new Promise<void>((resolve) => server.close(() => resolve())); await pool.end(); });

test("only event 369 exists and admin capability comes from the encrypted session", async () => {
  assert.deepEqual(await galleryJson(await request()), { eventId: "369", canUpload: false, photos: [] });
  assert.equal((await fetch(base.replace("/369/", "/demo/"))).status, 404);
  assert.equal((await galleryJson(await request("", { headers: headers(visitor) }))).canUpload, false);
  assert.equal((await galleryJson(await request("", { headers: headers() }))).canUpload, true);
  assert.equal((await galleryJson(await request("", { headers: headers({ ...owner, email: owner.email.toUpperCase() }) }))).canUpload, true);
});
test("runtime allowlists and role flags cannot promote another Google account", async () => {
  const configured = process.env.PHOTOS_ADMIN_EMAIL_SHA256;
  process.env.PHOTOS_ADMIN_EMAIL_SHA256 = createHash("sha256").update(visitor.email).digest("hex");
  try {
    assert.equal(isPhotosAdmin({ ...visitor, provider: "google" }), false);
    const strict = base.replace("/api/", "/strict-api/");
    assert.equal((await galleryJson(await fetch(strict, { headers: headers(visitor) }))).canUpload, false);
    for (const [path, method] of [["/uploads", "POST"], [`/${randomUUID()}/complete`, "POST"], [`/${randomUUID()}`, "DELETE"]]) {
      const response = await fetch(strict + path, {
        method, headers: { ...headers(visitor), "X-Admin": "true" },
        body: JSON.stringify({ ...input, role: "admin", isAdmin: true, email: owner.email }),
      });
      assert.equal(response.status, 403);
    }
    const appleCookie = `${SESSION_COOKIE}=${new SessionCodec(process.env.SESSION_SECRET!).seal({ ...owner, provider: "apple" }, "google-session", 60)}`;
    assert.equal((await fetch(strict + "/uploads", { method: "POST", headers: { ...headers(), Cookie: appleCookie }, body: JSON.stringify(input) })).status, 401);
  } finally { process.env.PHOTOS_ADMIN_EMAIL_SHA256 = configured; }
});
test("anonymous, forged, other-user and cross-origin uploads are rejected", async () => {
  const body = JSON.stringify({ ...input, admin: true, email: owner.email });
  assert.equal((await request("/uploads", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body })).status, 401);
  assert.equal((await request("/uploads", { method: "POST", headers: { ...headers(), Cookie: `${SESSION_COOKIE}=forged` }, body })).status, 401);
  assert.equal((await request("/uploads", { method: "POST", headers: headers(visitor), body })).status, 403);
  assert.equal((await request("/uploads", { method: "POST", headers: { ...headers(), Origin: "https://attacker.example" }, body })).status, 403);
  assert.equal(rows.size, 0);
});
test("upload metadata rejects unsupported files, empty files and oversized files", async () => {
  for (const data of [{ ...input, mime: "image/svg+xml" }, { ...input, size: 0 }, { ...input, size: 20971521 }]) {
    assert.equal((await request("/uploads", { method: "POST", headers: headers(), body: JSON.stringify(data) })).status, 400);
  }
  assert.equal(rows.size, 0);
});
test("owner upload is hidden until validated, then visible with a protected original", async () => {
  const reservation = await request("/uploads", { method: "POST", headers: headers(), body: JSON.stringify({ ...input, uploadedBy: visitor.id }) });
  assert.equal(reservation.status, 201);
  const { id } = await uploadJson(reservation);
  assert.equal(rows.get(id)?.uploadedBy, owner.id);
  assert.equal((await galleryJson(await request())).photos.length, 0);
  assert.equal((await request(`/${id}/preview`)).status, 404);
  assert.equal((await request(`/${id}/complete`, { method: "POST", headers: headers({ ...owner, id: "different-subject" }) })).status, 404);
  assert.equal((await request(`/${id}/complete`, { method: "POST", headers: headers(visitor) })).status, 403);
  const completed = await request(`/${id}/complete`, { method: "POST", headers: headers() });
  assert.equal(completed.status, 200);
  assert.equal(CompleteGalleryUploadResponse.parse(await completed.json()).originalName, input.name);
  const calls = publishCalls;
  assert.equal((await request(`/${id}/complete`, { method: "POST", headers: headers() })).status, 200);
  assert.equal(publishCalls, calls, "completion must be idempotent");
  const gallery = await galleryJson(await request());
  assert.equal(gallery.photos.length, 1);
  assert.equal(gallery.photos[0].file, `api/events/369/photos/${id}/preview`);
  assert(!JSON.stringify(gallery).includes("/objects/"));
  assert(!JSON.stringify(gallery).includes(owner.id));
  assert.equal((await request(`/${id}/preview`)).status, 200);
  assert.equal((await request(`/${id}/download`)).status, 401);
  const download = await request(`/${id}/download`, { headers: headers(visitor) });
  assert.equal(download.status, 200);
  assert(download.headers.get("content-disposition")?.includes(input.name));
  assert.equal((await request(`/${id}`, { method: "DELETE", headers: headers(visitor) })).status, 403);
  assert.equal((await request(`/${id}`, { method: "DELETE", headers: headers() })).status, 204);
  assert.equal((await galleryJson(await request())).photos.length, 0);
  assert.equal((await request(`/${id}/download`, { headers: headers() })).status, 404);
});
test("invalid content and expired reservations never become gallery photos", async () => {
  const reserve = async () => (await uploadJson(await request("/uploads", { method: "POST", headers: headers(), body: JSON.stringify(input) }))).id;
  const id = await reserve();
  invalidImage = true;
  assert.equal((await request(`/${id}/complete`, { method: "POST", headers: headers() })).status, 400);
  invalidImage = false;
  assert.equal(rows.get(id)?.status, "pending");
  rows.get(id)!.createdAt = new Date(Date.now() - 16 * 60_000);
  assert.equal((await request(`/${id}/complete`, { method: "POST", headers: headers() })).status, 400);
  assert.equal((await galleryJson(await request())).photos.length, 0);
  assert.equal((await request("/not-a-uuid/download", { headers: headers() })).status, 404);
});
test("actual bytes are decoded, MIME checked, resized and converted to safe previews", async () => {
  const png = await sharp({ create: { width: 1800, height: 100, channels: 3, background: "#fff" } }).png().toBuffer();
  const preview = await createPhotoPreview(png, "image/png");
  const metadata = await sharp(preview).metadata();
  assert.equal(metadata.format, "jpeg");
  assert.equal(metadata.width, 1600);
  assert.equal(metadata.exif, undefined);
  await assert.rejects(() => createPhotoPreview(png, "image/jpeg"), InvalidImageError);
  await assert.rejects(() => createPhotoPreview(Buffer.from("<svg></svg>"), "image/png"), InvalidImageError);
  await assert.rejects(() => createPhotoPreview(Buffer.from("not an image"), "image/jpeg"), InvalidImageError);
});
