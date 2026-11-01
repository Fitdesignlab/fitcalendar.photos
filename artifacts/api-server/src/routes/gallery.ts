import { randomUUID } from "node:crypto";
import { Router, type Request, type Response, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { RequestGalleryUploadBody } from "@workspace/api-zod";
import type { EventPhotoRow } from "@workspace/db";
import { galleryRepository, type GalleryRepository } from "../lib/gallery-repository";
import { GalleryStorage, InvalidImageError } from "../lib/gallery-storage";
import { ObjectNotFoundError } from "../lib/objectStorage";
import { isAllowedOrigin, noStore, readUser, type GoogleUser } from "../lib/auth-security";
import { isPhotosAdmin } from "../lib/admin-policy";

const photoJson = (row: EventPhotoRow) => ({
  id: row.id, originalName: row.originalName, caption: row.originalName,
  file: `api/events/369/photos/${row.id}/preview`, tags: [] as string[], time: "", photographer: "",
});
const validId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function createGalleryRouter(
  repo: GalleryRepository = galleryRepository,
  storage: Pick<GalleryStorage, "reserve" | "publish" | "removePath" | "serve"> = new GalleryStorage(),
  isAdmin: (user: GoogleUser | null) => boolean = isPhotosAdmin,
): IRouter {
  const router: IRouter = Router();
  const writes = rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false });
  router.use("/events/:eventId/photos", (req, res, next) => {
    noStore(res);
    if (req.params.eventId !== "369") { res.status(404).json({ error: "Event not available." }); return; }
    if (req.method !== "GET") {
      if (!isAllowedOrigin(req)) { res.status(403).json({ error: "This origin cannot modify the gallery." }); return; }
      const user = readUser(req);
      if (!user) { res.status(401).json({ error: "Sign in with Google first." }); return; }
      if (!isAdmin(user)) { res.status(403).json({ error: "Only the gallery admin can upload or remove photos." }); return; }
      writes(req, res, next); return;
    }
    next();
  });
  const endpoint = (handler: (req: Request, res: Response) => Promise<void>) =>
    (req: Request, res: Response) => { void handler(req, res).catch((error: unknown) => {
      if (res.headersSent) { res.destroy(); return; }
      if (error instanceof InvalidImageError) res.status(400).json({ error: error.message });
      else if (error instanceof ObjectNotFoundError) res.status(404).json({ error: "Uploaded photo not found." });
      else {
        req.log?.error({ errorType: error instanceof Error ? error.name : "unknown" }, "Gallery operation failed");
        res.status(503).json({ error: "The gallery is temporarily unavailable. Please try again." });
      }
    }); };

  router.get("/events/:eventId/photos", endpoint(async (req, res) => {
    res.json({ eventId: "369", canUpload: isAdmin(readUser(req)), photos: (await repo.list()).map(photoJson) });
  }));
  router.post("/events/:eventId/photos/uploads", endpoint(async (req, res) => {
    const input = RequestGalleryUploadBody.safeParse(req.body);
    if (!input.success) { res.status(400).json({ error: "Choose JPEG, PNG or WebP photos up to 20 MB each." }); return; }
    const { uploadUrl, objectPath } = await storage.reserve();
    const id = randomUUID();
    await repo.insert({
      id, eventId: "369", objectPath, originalName: input.data.name.replace(/[\\/\u0000-\u001f\u007f]/g, "_"),
      mime: input.data.mime, size: input.data.size, uploadedBy: readUser(req)!.id,
    });
    res.status(201).json({ id, uploadUrl });
  }));
  router.post("/events/:eventId/photos/:photoId/complete", endpoint(async (req, res) => {
    if (!validId(String(req.params.photoId))) { res.status(404).json({ error: "Upload not found." }); return; }
    const row = await repo.find(String(req.params.photoId));
    if (!row || row.uploadedBy !== readUser(req)!.id) { res.status(404).json({ error: "Upload not found." }); return; }
    if (row.status === "ready") { res.json(photoJson(row)); return; }
    if (Date.now() - row.createdAt.getTime() > 15 * 60_000) { res.status(400).json({ error: "This upload expired. Please select the file again." }); return; }
    const paths = await storage.publish(row);
    const published = await repo.publish(row.id, paths);
    // Removing a staging object is housekeeping, not a reason to report a
    // successfully published photo as failed. It is never served by this API.
    void storage.removePath(row.objectPath).catch(() => req.log?.warn("Staging photo cleanup failed"));
    res.json(photoJson(published));
  }));
  router.delete("/events/:eventId/photos/:photoId", endpoint(async (req, res) => {
    if (!validId(String(req.params.photoId))) { res.status(404).json({ error: "Photo not found." }); return; }
    const row = await repo.find(String(req.params.photoId));
    if (!row) { res.status(404).json({ error: "Photo not found." }); return; }
    await repo.remove(row.id);
    // Delete metadata first so the photo immediately becomes inaccessible.
    const paths = [row.objectPath, row.previewPath].filter((p): p is string => Boolean(p));
    const cleanup = await Promise.allSettled(paths.map((p) => storage.removePath(p)));
    if (cleanup.some((r) => r.status === "rejected")) req.log?.warn("Removed photo storage cleanup incomplete");
    res.sendStatus(204);
  }));
  router.get("/events/:eventId/photos/:photoId/preview", endpoint(async (req, res) => {
    const row = validId(String(req.params.photoId)) ? await repo.find(String(req.params.photoId)) : undefined;
    if (!row || row.status !== "ready" || !row.previewPath) { res.status(404).json({ error: "Photo not found." }); return; }
    await storage.serve(row.previewPath, res);
  }));
  router.get("/events/:eventId/photos/:photoId/download", endpoint(async (req, res) => {
    if (!readUser(req)) { res.status(401).json({ error: "Sign in with Google to download photos." }); return; }
    const row = validId(String(req.params.photoId)) ? await repo.find(String(req.params.photoId)) : undefined;
    if (!row || row.status !== "ready") { res.status(404).json({ error: "Photo not found." }); return; }
    await storage.serve(row.objectPath, res, row.originalName);
  }));
  return router;
}
