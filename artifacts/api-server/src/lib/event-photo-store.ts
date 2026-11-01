import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { isAdminEmail, LIVE_EVENT_ID } from "./admin";

export type StoredPhoto = {
  id: string;
  eventId: string;
  caption: string;
  ext: "jpg" | "png" | "webp";
  contentType: "image/jpeg" | "image/png" | "image/webp";
  uploadedBy: string;
  createdAt: string;
};

const ID = /^[a-f0-9]{24}$/;

function sniff(bytes: Buffer): Pick<StoredPhoto, "ext" | "contentType"> | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: "png", contentType: "image/png" };
  }
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") {
    return { ext: "webp", contentType: "image/webp" };
  }
  return null;
}

function isStoredPhoto(value: unknown): value is StoredPhoto {
  if (!value || typeof value !== "object") return false;
  const photo = value as StoredPhoto;
  return ID.test(photo.id)
    && photo.eventId === LIVE_EVENT_ID
    && typeof photo.caption === "string"
    && (photo.ext === "jpg" || photo.ext === "png" || photo.ext === "webp")
    && typeof photo.contentType === "string"
    && typeof photo.uploadedBy === "string"
    && typeof photo.createdAt === "string";
}

export class EventPhotoStore {
  readonly root: string;
  constructor(root: string) {
    this.root = path.resolve(root);
    fs.mkdirSync(path.join(this.root, "files"), { recursive: true });
  }

  private indexPath() {
    return path.join(this.root, "index.json");
  }

  private read(): StoredPhoto[] {
    try {
      const parsed: unknown = JSON.parse(fs.readFileSync(this.indexPath(), "utf8"));
      return Array.isArray(parsed) ? parsed.filter(isStoredPhoto) : [];
    } catch {
      return [];
    }
  }

  private write(all: StoredPhoto[]) {
    const tmp = this.indexPath() + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(all));
    fs.renameSync(tmp, this.indexPath());
  }

  /** Public gallery: only photos the sole admin account uploaded. */
  listPublic(eventId: string): StoredPhoto[] {
    if (eventId !== LIVE_EVENT_ID) return [];
    return this.read().filter((photo) => isAdminEmail(photo.uploadedBy));
  }

  filePath(photo: StoredPhoto): string | null {
    if (!ID.test(photo.id)) return null;
    const file = path.resolve(this.root, "files", `${photo.id}.${photo.ext}`);
    const filesDir = path.resolve(this.root, "files");
    if (!file.startsWith(filesDir + path.sep)) return null;
    return file;
  }

  get(eventId: string, id: string): StoredPhoto | null {
    if (eventId !== LIVE_EVENT_ID || !ID.test(id)) return null;
    return this.listPublic(eventId).find((photo) => photo.id === id) ?? null;
  }

  insert(bytes: Buffer, caption: string, uploadedBy: string): StoredPhoto | null {
    const kind = sniff(bytes);
    if (!kind || bytes.length < 32 || bytes.length > 8 * 1024 * 1024) return null;
    const id = randomBytes(12).toString("hex");
    const photo: StoredPhoto = {
      id,
      eventId: LIVE_EVENT_ID,
      caption: caption.replace(/\s+/g, " ").trim().slice(0, 80) || "Event photo",
      ext: kind.ext,
      contentType: kind.contentType,
      uploadedBy: uploadedBy.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    const file = this.filePath(photo);
    if (!file) return null;
    fs.writeFileSync(file, bytes);
    try {
      const all = this.read();
      all.push(photo);
      this.write(all);
    } catch (error) {
      fs.rmSync(file, { force: true });
      throw error;
    }
    return photo;
  }

  remove(id: string): boolean {
    if (!ID.test(id)) return false;
    const all = this.read();
    const photo = all.find((item) => item.id === id);
    if (!photo) return false;
    const file = this.filePath(photo);
    if (file) fs.rmSync(file, { force: true });
    this.write(all.filter((item) => item.id !== id));
    return true;
  }
}
