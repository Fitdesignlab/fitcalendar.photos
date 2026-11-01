export type Category = 'race' | 'padel' | 'festival' | 'cycling' | 'triathlon';

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
  photos: EventPhoto[];
}

// Files prefixed with "landing/" resolve to public/landing; anything else stays in public/photos.
export const photoUrl = (file: string) =>
  file.startsWith('landing/') ? `${import.meta.env.BASE_URL}${file}` : `${import.meta.env.BASE_URL}photos/${file}`;

export const CATEGORY_LABEL: Record<Category, string> = {
  race: 'Race',
  padel: 'Padel',
  festival: 'Festival',
  cycling: 'Cycling',
  triathlon: 'Triathlon',
};

export const EVENTS: PhotoEvent[] = [
  {
    id: 'harbour-half-2025',
    name: 'Harbour Half Marathon',
    category: 'race',
    city: 'Dubai Marina',
    date: '2025-02-16',
    cover: 'landing/sport-0.jpg',
    blurb: '21.1 km along the waterfront, shot from kilometre 4, the bridge climb and the finish arch.',
    photos: [
      { id: 'hh-01', file: 'landing/sport-0.jpg', caption: 'Coast road, kilometre 9', tags: ['course', 'solo'], bib: '1184', time: '07:42', photographer: 'Mira Okafor' },
      { id: 'hh-02', file: 'landing/sport-5.jpg', caption: 'Finish arch, first wave', tags: ['finish', 'group'], bib: '0207', time: '08:51', photographer: 'Tomas Reyes' },
      { id: 'hh-03', file: 'landing/sport-7.jpg', caption: 'Bridge climb at sunrise', tags: ['course', 'landscape'], bib: '2391', time: '07:18', photographer: 'Mira Okafor' },
      { id: 'hh-04', file: 'landing/sport-8.jpg', caption: 'Last 400 metres', tags: ['finish', 'solo'], bib: '0566', time: '09:04', photographer: 'Tomas Reyes' },
    ],
  },
  {
    id: 'ridge-trail-24k',
    name: 'Hatta Ridge Trail 24K',
    category: 'race',
    city: 'Hatta',
    date: '2025-01-11',
    cover: 'landing/sport-7.jpg',
    blurb: 'Dawn start on the ridge line. Two photographers on the high switchbacks.',
    photos: [
      { id: 'rt-01', file: 'landing/sport-7.jpg', caption: 'Ridge line, first light', tags: ['landscape', 'group'], bib: '312', time: '06:27', photographer: 'Leah Hamdan' },
      { id: 'rt-02', file: 'landing/sport-0.jpg', caption: 'Descent to aid station two', tags: ['course', 'solo'], bib: '087', time: '07:55', photographer: 'Leah Hamdan' },
      { id: 'rt-03', file: 'landing/sport-5.jpg', caption: 'Finish chute', tags: ['finish', 'group'], bib: '145', time: '09:30', photographer: 'Sami Kader' },
    ],
  },
  {
    id: 'glasshouse-padel-night',
    name: 'Glasshouse Padel Night',
    category: 'padel',
    city: 'Al Quoz',
    date: '2025-03-07',
    cover: 'landing/sport-6.jpg',
    blurb: 'Americano format, 32 players, eight courts under the lights until midnight.',
    photos: [
      { id: 'gp-01', file: 'landing/sport-1.jpg', caption: 'Court 3, the bandeja', tags: ['action', 'solo'], time: '21:14', photographer: 'Noor Valdés' },
      { id: 'gp-02', file: 'landing/sport-6.jpg', caption: 'Match point, court 1', tags: ['celebration', 'group'], time: '22:47', photographer: 'Noor Valdés' },
      { id: 'gp-03', file: 'landing/sport-1.jpg', caption: 'Back-glass rescue', tags: ['action', 'solo'], time: '21:58', photographer: 'Ivo Brandt' },
      { id: 'gp-04', file: 'landing/sport-6.jpg', caption: 'Final round handshake', tags: ['celebration', 'group'], time: '23:36', photographer: 'Ivo Brandt' },
    ],
  },
  {
    id: 'saltflat-sound-2025',
    name: 'Saltflat Sound',
    category: 'festival',
    city: 'Al Qudra',
    date: '2025-03-22',
    cover: 'landing/sport-4.jpg',
    blurb: 'Two stages in the desert. Crowd, sunset sets and everything between.',
    photos: [
      { id: 'ss-01', file: 'landing/sport-4.jpg', caption: 'Main stage, golden hour', tags: ['crowd', 'stage'], time: '18:03', photographer: 'Ana Ferreira' },
      { id: 'ss-02', file: 'fest-2.jpg', caption: 'Under the string lights', tags: ['friends', 'group'], time: '19:40', photographer: 'Ana Ferreira' },
      { id: 'ss-03', file: 'landing/sport-4.jpg', caption: 'Hands up for the closer', tags: ['crowd', 'stage'], time: '23:12', photographer: 'Kofi Mensah' },
      { id: 'ss-04', file: 'fest-1.jpg', caption: 'Between sets', tags: ['friends', 'group'], time: '20:26', photographer: 'Kofi Mensah' },
    ],
  },
  {
    id: 'qudra-loop-ride-2025',
    name: 'Al Qudra Loop Ride',
    category: 'cycling',
    city: 'Al Qudra',
    date: '2025-02-01',
    cover: 'landing/sport-2.jpg',
    blurb: 'Sunrise group ride on the desert cycle track, 50 km and 100 km loops.',
    photos: [
      { id: 'ql-01', file: 'landing/sport-2.jpg', caption: 'Lead group, first loop', tags: ['peloton', 'group'], time: '06:12', photographer: 'Sami Kader' },
      { id: 'ql-02', file: 'landing/sport-8.jpg', caption: 'Transition to the long loop', tags: ['course', 'solo'], time: '07:34', photographer: 'Sami Kader' },
      { id: 'ql-03', file: 'landing/sport-0.jpg', caption: 'Cool-down jog at the car park', tags: ['course', 'solo'], time: '09:05', photographer: 'Leah Hamdan' },
    ],
  },
  {
    id: 'kite-beach-tri-2025',
    name: 'Kite Beach Sprint Triathlon',
    category: 'triathlon',
    city: 'Umm Suqeim',
    date: '2025-03-01',
    cover: 'landing/sport-3.jpg',
    blurb: '750 m swim, 20 km bike, 5 km run. Photographers on the beach exit and run course.',
    photos: [
      { id: 'kb-01', file: 'landing/sport-3.jpg', caption: 'Swim start, wave two', tags: ['swim', 'group'], bib: '418', time: '06:45', photographer: 'Mira Okafor' },
      { id: 'kb-02', file: 'landing/sport-8.jpg', caption: 'Bike out of T1', tags: ['bike', 'solo'], bib: '233', time: '07:09', photographer: 'Tomas Reyes' },
      { id: 'kb-03', file: 'landing/sport-5.jpg', caption: 'Run course, final kilometre', tags: ['run', 'solo'], bib: '591', time: '08:02', photographer: 'Mira Okafor' },
    ],
  },
  {
    id: 'courtside-open-2025',
    name: 'Courtside Open Qualifiers',
    category: 'padel',
    city: 'Jumeirah',
    date: '2025-04-05',
    cover: 'landing/sport-9.jpg',
    blurb: 'Gallery is being uploaded by the photographers. Check back after the weekend.',
    photos: [],
  },
];

// Compatibility alias: the original skeleton linked to /event/demo.
const ALIASES: Record<string, string> = { demo: 'harbour-half-2025' };
export const getEvent = (id: string) => EVENTS.find((e) => e.id === (ALIASES[id] ?? id));

export const formatDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const TOTAL_PHOTOS = EVENTS.reduce((n, e) => n + e.photos.length, 0);
