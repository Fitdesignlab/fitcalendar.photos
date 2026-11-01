import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const eventPhotosTable = pgTable("event_photos", {
  id: uuid("id").primaryKey(),
  eventId: text("event_id").notNull(),
  objectPath: text("object_path").notNull().unique(),
  previewPath: text("preview_path"),
  originalName: text("original_name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  status: text("status").notNull().default("pending"),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEventPhotoSchema = createInsertSchema(eventPhotosTable).omit({ createdAt: true });
export type EventPhotoRow = typeof eventPhotosTable.$inferSelect;
