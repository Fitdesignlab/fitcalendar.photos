import { and, eq, desc } from "drizzle-orm";
import { db, eventPhotosTable, type EventPhotoRow } from "@workspace/db";

export type PhotoReservation = Omit<EventPhotoRow, "createdAt" | "previewPath" | "status">;
export interface GalleryRepository {
  list(): Promise<EventPhotoRow[]>;
  find(id: string): Promise<EventPhotoRow | undefined>;
  insert(row: PhotoReservation): Promise<EventPhotoRow>;
  publish(id: string, paths: { objectPath: string; previewPath: string }): Promise<EventPhotoRow>;
  remove(id: string): Promise<void>;
}
type GalleryDb = Pick<typeof db, "select" | "insert" | "update" | "delete">;
export const createGalleryRepository = (source: GalleryDb = db): GalleryRepository => ({
  list: () => source.select().from(eventPhotosTable).where(and(eq(eventPhotosTable.eventId, "369"), eq(eventPhotosTable.status, "ready"))).orderBy(desc(eventPhotosTable.createdAt)),
  async find(id) { return (await source.select().from(eventPhotosTable).where(and(eq(eventPhotosTable.id, id), eq(eventPhotosTable.eventId, "369"))))[0]; },
  async insert(row) { return (await source.insert(eventPhotosTable).values(row).returning())[0]!; },
  async publish(id, paths) { return (await source.update(eventPhotosTable).set({ ...paths, status: "ready" }).where(and(eq(eventPhotosTable.id, id), eq(eventPhotosTable.eventId, "369"))).returning())[0]!; },
  async remove(id) { await source.delete(eventPhotosTable).where(and(eq(eventPhotosTable.id, id), eq(eventPhotosTable.eventId, "369"))); },
});
export const galleryRepository = createGalleryRepository();
