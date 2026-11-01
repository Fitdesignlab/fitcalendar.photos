import path from "node:path";
import { Router, type IRouter, type Request, type Response } from "express";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { isAdminEmail, LIVE_EVENT_ID } from "../lib/admin";
import { noStore, readUser, type GoogleUser } from "../lib/auth-security";
import { EventPhotoStore, type StoredPhoto } from "../lib/event-photo-store";

const defaultRoot = path.join(process.cwd(), "data", "event-photos");

function toGalleryPhoto(photo: StoredPhoto) {
  const time = new Date(photo.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return {
    id: photo.id,
    file: `uploads/${photo.eventId}/${photo.id}`,
    caption: photo.caption,
    tags: [] as string[],
    time,
    photographer: "FitCalendar",
  };
}

function sendFile(res: Response, store: EventPhotoStore, photo: StoredPhoto, downloadName?: string) {
  const file = store.filePath(photo);
  if (!file) { res.status(404).json({ error: "Photo not found." }); return; }
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.type(photo.contentType);
  if (downloadName) res.download(file, downloadName, (error) => {
    if (error && !res.headersSent) res.status(404).json({ error: "Photo not found." });
  });
  else res.sendFile(file, (error) => {
    if (error && !res.headersSent) res.status(404).json({ error: "Photo not found." });
  });
}

export function createEventPhotosRouter(store = new EventPhotoStore(defaultRoot), read: (req: Request) => GoogleUser | null = readUser): IRouter {
  const router: IRouter = Router();
  const uploadLimit = rateLimit({
    windowMs: 10 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false,
    message: { error: "Too many uploads. Please try again in a few minutes." },
  });

  router.get("/events/:eventId/photos", (req, res): void => {
    noStore(res);
    if (req.params.eventId !== LIVE_EVENT_ID) { res.status(404).json({ error: "Event not found." }); return; }
    res.json({ photos: store.listPublic(req.params.eventId).map(toGalleryPhoto) });
  });

  router.get("/events/:eventId/photos/:photoId/file", (req, res): void => {
    const photo = store.get(req.params.eventId, req.params.photoId);
    if (!photo) { res.status(404).json({ error: "Photo not found." }); return; }
    res.setHeader("Cache-Control", "private, max-age=60");
    sendFile(res, store, photo);
  });

  router.get("/events/:eventId/photos/:photoId/download", (req, res): void => {
    noStore(res);
    if (!read(req)) { res.status(401).json({ error: "Sign in with Google to download photos." }); return; }
    const photo = store.get(req.params.eventId, req.params.photoId);
    if (!photo) { res.status(404).json({ error: "Photo not found." }); return; }
    sendFile(res, store, photo, `fitcalendar-${photo.eventId}-${photo.id}.${photo.ext}`);
  });

  router.post("/events/:eventId/photos", uploadLimit, express.raw({ type: ["image/jpeg", "image/png", "image/webp", "application/octet-stream"], limit: "8mb" }), (req, res): void => {
    noStore(res);
    if (req.params.eventId !== LIVE_EVENT_ID) { res.status(404).json({ error: "Event not found." }); return; }
    const user = read(req);
    if (!user) { res.status(401).json({ error: "Sign in with Google to upload photos." }); return; }
    if (!isAdminEmail(user.email)) { res.status(403).json({ error: "This account cannot upload photos." }); return; }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) { res.status(400).json({ error: "Choose a JPEG, PNG, or WebP photo." }); return; }
    const caption = typeof req.query.caption === "string" ? req.query.caption : "";
    const photo = store.insert(req.body, caption, user.email);
    if (!photo) { res.status(400).json({ error: "Choose a JPEG, PNG, or WebP photo." }); return; }
    res.status(201).json({ photo: toGalleryPhoto(photo) });
  });

  router.delete("/events/:eventId/photos/:photoId", (req, res): void => {
    noStore(res);
    if (req.params.eventId !== LIVE_EVENT_ID) { res.status(404).json({ error: "Event not found." }); return; }
    const user = read(req);
    if (!user) { res.status(401).json({ error: "Sign in with Google to upload photos." }); return; }
    if (!isAdminEmail(user.email)) { res.status(403).json({ error: "This account cannot upload photos." }); return; }
    if (!store.get(req.params.eventId, req.params.photoId) || !store.remove(req.params.photoId)) {
      res.status(404).json({ error: "Photo not found." }); return;
    }
    res.sendStatus(204);
  });

  return router;
}
