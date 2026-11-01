import type { EventPhoto } from './events';
import { downloadEventPhoto } from '@workspace/api-client-react';

export async function downloadPhoto(photo: EventPhoto, eventId: string): Promise<void> {
  const blob = await downloadEventPhoto({ file: photo.file, eventId, photoId: photo.id }, { credentials: 'same-origin' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitcalendar-${eventId}-${photo.id}.jpg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
