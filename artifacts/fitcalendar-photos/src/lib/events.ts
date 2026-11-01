export type Category = 'race' | 'padel' | 'festival' | 'cycling' | 'triathlon' | 'pilates';

export interface EventPhoto {
  id: string;
  file: string;
  caption: string;
  tags: string[];
  bib?: string;
  time: string;
  photographer: string;
}

export interface PhotoEvent {
  id: string;
  name: string;
  category: Category;
  city: string;
  date: string; // ISO
  cover: string;
  blurb: string;
  sourceUrl: string;
  photos: EventPhoto[];
}

// Files prefixed with "landing/" resolve to public/landing; anything else stays in public/photos.
export const photoUrl = (file: string) =>
  file.startsWith('https://') ? file :
    file.startsWith('landing/') ? `${import.meta.env.BASE_URL}${file}` : `${import.meta.env.BASE_URL}photos/${file}`;

export const CATEGORY_LABEL: Record<Category, string> = {
  race: 'Race',
  padel: 'Padel',
  festival: 'Festival',
  cycling: 'Cycling',
  triathlon: 'Triathlon',
  pilates: 'Pilates',
};

export const EVENTS: PhotoEvent[] = [
  {
    id: '369',
    name: 'Sunrise Pilates on a Yacht',
    category: 'pilates',
    city: 'Luxury Yacht, Dubai',
    date: '2026-10-31',
    cover: 'https://fitcalendar.app/api/images/07bf3f23-e44d-441e-9f73-cf29ff25b2c6?opt=2&variant=hero',
    blurb: 'Pilates with Wellness Edit at Luxury Yacht, Dubai. Starts at 06:30.',
    sourceUrl: 'https://fitcalendar.app/event/369',
    photos: [],
  },
];

export const getEvent = (id: string) => EVENTS.find((e) => e.id === id);

export const formatDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const TOTAL_PHOTOS = EVENTS.reduce((n, e) => n + e.photos.length, 0);
