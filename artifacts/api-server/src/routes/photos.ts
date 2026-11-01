import { fileURLToPath } from "node:url";
import path from "node:path";
import { Router, type IRouter } from "express";
import { DownloadEventPhotoQueryParams } from "@workspace/api-zod";
import { noStore, readUser } from "../lib/auth-security";

// Both development and production execute the bundled api-server/dist/index.mjs.
const publicDir = fileURLToPath(new URL("../../fitcalendar-photos/public/", import.meta.url));
const allowedFile = /^(?:landing\/sport-[0-9]\.jpg|(?:hero|race-[12]|padel-[12]|fest-[12])\.jpg)$/;

export function createPhotosRouter(root = publicDir): IRouter {
const router: IRouter = Router();
router.get("/photos/download", (req, res): void => {
  noStore(res);
  if (!readUser(req)) { res.status(401).json({ error: "Sign in with Google to download photos." }); return; }
  const query = DownloadEventPhotoQueryParams.safeParse(req.query);
  if (!query.success || !allowedFile.test(query.data.file)) {
    res.status(404).json({ error: "Photo not found." }); return;
  }
  const { file, eventId, photoId } = query.data;
  const location = path.join(root, file.startsWith("landing/") ? file : `photos/${file}`);
  res.download(location, `fitcalendar-${eventId}-${photoId}.jpg`, (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: "Photo not found." });
  });
});
return router;
}
export default createPhotosRouter();
