import { Link, useParams } from 'react-router-dom'
import { photo, PHOTO_COUNT } from '../lib/photos'
import { isEventUnlocked } from '../lib/ziina'

// TODO: load real photos for eventId from storage (same eventId as Fit Calendar /event/{eventId}).
export default function EventGallery() {
  const { eventId = '' } = useParams()
  const unlocked = isEventUnlocked(eventId)
  const items = Array.from({ length: 12 }, (_, i) => ({ thumb: photo(i % PHOTO_COUNT, 500), full: photo(i % PHOTO_COUNT, 2000) }))
  return (
    <div className="gallery">
      <header className="gtop"><Link to="/"><img className="mark" src="/fitcalendar-mark.png" alt="Fit Calendar" /></Link></header>
      <div className="badge static">Event {eventId}</div>
      <h2 className="gh">Your event photos</h2>
      <p className="sub static">Free to download. Tap any photo to save the full size.</p>
      <div className="grid">
        {items.map((p, i) => (
          <figure key={i}>
            <img src={p.thumb} alt={`Photo ${i + 1}`} loading="lazy" />
            {unlocked && <a className="pill dark" href={p.full} download={`fitcalendar-${eventId}-${i + 1}.jpg`} target="_blank" rel="noreferrer">Download</a>}
          </figure>
        ))}
      </div>
    </div>
  )
}
