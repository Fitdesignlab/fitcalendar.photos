import type { EventPhoto } from './events';
import { downloadEventPhoto } from '@workspace/api-client-react';

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function downloadPhoto(photo: EventPhoto, eventId: string): Promise<void> {
  if (photo.file.startsWith('uploads/')) {
    const response = await fetch(`/api/events/${eventId}/photos/${photo.id}/download`, { credentials: 'same-origin' });
    if (!response.ok) {
      const error = new Error('Download failed.') as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    const type = response.headers.get('content-type') ?? '';
    const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
    saveBlob(await response.blob(), `fitcalendar-${eventId}-${photo.id}.${ext}`);
    return;
  }
  const blob = await downloadEventPhoto({ file: photo.file, eventId, photoId: photo.id }, { credentials: 'same-origin' });
  saveBlob(blob, `fitcalendar-${eventId}-${photo.id}.jpg`);
}
