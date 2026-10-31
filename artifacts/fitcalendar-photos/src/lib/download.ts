import { photoUrl, type EventPhoto } from './events';

export async function downloadPhoto(photo: EventPhoto, eventId: string): Promise<void> {
  const res = await fetch(photoUrl(photo.file));
  if (!res.ok) throw new Error('Could not fetch photo (' + res.status + ')');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitcalendar-${eventId}-${photo.id}.jpg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
