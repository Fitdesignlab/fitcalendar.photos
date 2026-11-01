import sharp from "sharp";
import type { Response } from "express";
import type { EventPhotoRow } from "@workspace/db";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
export class InvalidImageError extends Error {}

export async function createPhotoPreview(bytes: Buffer, mime: string): Promise<Buffer> {
  if (!bytes.length || bytes.length > MAX_PHOTO_BYTES) throw new InvalidImageError("Photos must be no larger than 20 MB.");
  try {
    const image = sharp(bytes, { limitInputPixels: 40_000_000, failOn: "warning" });
    const metadata = await image.metadata();
    const formats: Record<string, string> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
    const actualMime = formats[metadata.format ?? ""];
    if (actualMime !== mime || (metadata.pages ?? 1) > 1) throw new Error("Unsupported image");
    // Autorotate and remove EXIF/location metadata from publicly browsable previews.
    return await image.rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  } catch {
    throw new InvalidImageError("Use a valid, single-frame JPEG, PNG or WebP image under 40 megapixels.");
  }
}

export class GalleryStorage {
  private objects = new ObjectStorageService();
  async reserve() {
    const uploadUrl = await this.objects.getObjectEntityUploadURL();
    const objectPath = this.objects.normalizeObjectEntityPath(uploadUrl);
    if (!/^\/objects\/uploads\/[a-f0-9-]{36}$/i.test(objectPath)) throw new Error("Invalid storage reservation");
    return { uploadUrl, objectPath };
  }
  async publish(row: EventPhotoRow) {
    const file = await this.objects.getObjectEntityFile(row.objectPath);
    const [metadata] = await file.getMetadata();
    if (Number(metadata.size) !== row.size || row.size > MAX_PHOTO_BYTES) throw new InvalidImageError("The uploaded file size does not match the reservation.");
    const [bytes] = await file.download();
    if (bytes.length !== row.size) throw new InvalidImageError("The uploaded file is incomplete.");
    const preview = await createPhotoPreview(bytes, row.mime);
    // Publish to server-only paths. A still-valid staging PUT URL cannot replace
    // an already validated original or its preview.
    const original = file.bucket.file(file.name + "-original");
    const thumbnail = file.bucket.file(file.name + "-preview.jpg");
    await original.save(bytes, { resumable: false, metadata: { contentType: row.mime, cacheControl: "private, no-store" } });
    await thumbnail.save(preview, { resumable: false, metadata: { contentType: "image/jpeg", cacheControl: "private, no-store" } });
    return { objectPath: row.objectPath + "-original", previewPath: row.objectPath + "-preview.jpg" };
  }
  async removePath(objectPath: string) {
    try { const file = await this.objects.getObjectEntityFile(objectPath); await file.delete({ ignoreNotFound: true }); }
    catch (error) { if (!(error instanceof ObjectNotFoundError)) throw error; }
  }
  async serve(objectPath: string, res: Response, name?: string) {
    const file = await this.objects.getObjectEntityFile(objectPath);
    if (name) res.attachment(name).type("application/octet-stream");
    else res.type("image/jpeg");
    file.createReadStream().on("error", () => {
      if (!res.headersSent) res.status(503).json({ error: "The photo is temporarily unavailable." });
      else res.destroy();
    }).pipe(res);
  }
}
