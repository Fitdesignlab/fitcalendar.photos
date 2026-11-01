export function PhotosWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={'photos-wordmark ' + className} role="img" aria-label="FITCALENDAR.PHOTOS" data-testid="photos-wordmark">
      <img src={`${import.meta.env.BASE_URL}fitcalendar-wordmark.png`} className="photos-wordmark-image" alt="" aria-hidden="true" />
      <span className="photos-wordmark-suffix" aria-hidden="true">.PHOTOS</span>
    </span>
  );
}
