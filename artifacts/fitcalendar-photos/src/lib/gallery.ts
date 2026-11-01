import type { EventPhoto } from './events';
import { LIVE_EVENT_ID } from './admin';

export async function fetchEventPhotos(eventId: string): Promise<EventPhoto[]> {
  if (eventId !== LIVE_EVENT_ID) return [];
  const response = await fetch(`/api/events/${eventId}/photos`, { credentials: 'same-origin' });
  if (!response.ok) return [];
  const data = await response.json() as { photos?: EventPhoto[] };
  return Array.isArray(data.photos) ? data.photos : [];
}

export async function uploadEventPhoto(eventId: string, file: File): Promise<void> {
  const caption = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  const response = await fetch(`/api/events/${eventId}/photos?caption=${encodeURIComponent(caption)}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (response.ok) return;
  const data = await response.json().catch(() => ({})) as { error?: string };
  const error = new Error(data.error || 'Upload failed.') as Error & { status?: number };
  error.status = response.status;
  throw error;
}

export async function deleteEventPhoto(eventId: string, photoId: string): Promise<void> {
  const response = await fetch(`/api/events/${eventId}/photos/${photoId}`, { method: 'DELETE', credentials: 'same-origin' });
  if (response.ok) return;
  const error = new Error('Could not remove that photo.') as Error & { status?: number };
  error.status = response.status;
  throw error;
}
