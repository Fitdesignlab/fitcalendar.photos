import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { Server } from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import { createEventPhotosRouter } from "../routes/event-photos";
import { EventPhotoStore } from "../lib/event-photo-store";
import { SESSION_COOKIE, sessionCodec } from "../lib/auth-security";

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 16) {
  process.env.SESSION_SECRET = randomBytes(32).toString("base64url");
}

const jpeg = Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUTEhIVFRUVFRUWFxUVFRUVFRUWFxUWFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAADAAIEBQYHCP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGf/9k=", "base64");
const admin = { id: "maria", provider: "google" as const, name: "Maria", email: "MariaUCrispirela@gmail.com", picture: null };
const other = { id: "guest", provider: "google" as const, name: "Guest", email: "guest@example.com", picture: null };

let server: Server, base: string, dir: string, store: EventPhotoStore;
before(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "event-photos-"));
  store = new EventPhotoStore(dir);
  const app = express();
  app.use(cookieParser(), express.json());
  app.use("/api", createEventPhotosRouter(store));
  await new Promise<void>((resolve, reject) => { server = app.listen(0, "127.0.0.1", (error) => error ? reject(error) : resolve()); });
  const address = server.address();
  assert(address && typeof address !== "string");
  base = `http://127.0.0.1:${address.port}/api`;
});
after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())).finally(() => rmSync(dir, { recursive: true, force: true })));

const seal = (user: typeof admin) => `${SESSION_COOKIE}=${sessionCodec().seal(user, "google-session", 600)}`;

test("only the admin can upload, and the gallery lists those photos only", async () => {
  assert.equal((await fetch(`${base}/events/369/photos`, { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: jpeg })).status, 401);
  assert.equal((await fetch(`${base}/events/369/photos`, { method: "POST", headers: { "Content-Type": "image/jpeg", Cookie: seal(other) }, body: jpeg })).status, 403);
  assert.equal((await fetch(`${base}/events/999/photos`, { method: "POST", headers: { "Content-Type": "image/jpeg", Cookie: seal(admin) }, body: jpeg })).status, 404);
  assert.equal((await fetch(`${base}/events/369/photos?caption=Sunrise`, { method: "POST", headers: { "Content-Type": "image/jpeg", Cookie: seal(admin) }, body: Buffer.from("this is not an image file at all!!") })).status, 400);

  const created = await fetch(`${base}/events/369/photos?caption=Sunrise%20on%20deck`, {
    method: "POST", headers: { "Content-Type": "image/jpeg", Cookie: seal(admin) }, body: jpeg,
  });
  assert.equal(created.status, 201);
  const { photo } = await created.json() as { photo: { id: string; file: string; caption: string } };
  assert.equal(photo.caption, "Sunrise on deck");
  assert.match(photo.file, /^uploads\/369\/[a-f0-9]{24}$/);

  store.insert(jpeg, "Not from Maria", "guest@example.com");
  const list = await fetch(`${base}/events/369/photos`);
  assert.equal(list.status, 200);
  const body = await list.json() as { photos: { id: string; caption: string }[] };
  assert.deepEqual(body.photos.map((item) => item.caption), ["Sunrise on deck"]);
  assert.equal((await fetch(`${base}/events/123/photos`)).status, 404);

  const file = await fetch(`${base}/events/369/photos/${photo.id}/file`);
  assert.equal(file.status, 200);
  assert.match(file.headers.get("content-type") ?? "", /image\/jpeg/);
  assert.equal((await fetch(`${base}/events/369/photos/${photo.id}/download`)).status, 401);
  const download = await fetch(`${base}/events/369/photos/${photo.id}/download`, { headers: { Cookie: seal(other) } });
  assert.equal(download.status, 200);
  assert.match(download.headers.get("content-disposition") ?? "", /attachment/);

  assert.equal((await fetch(`${base}/events/369/photos/${photo.id}`, { method: "DELETE", headers: { Cookie: seal(other) } })).status, 403);
  assert.equal((await fetch(`${base}/events/369/photos/${photo.id}`, { method: "DELETE", headers: { Cookie: seal(admin) } })).status, 204);
  assert.deepEqual((await (await fetch(`${base}/events/369/photos`)).json() as { photos: unknown[] }).photos, []);
});
