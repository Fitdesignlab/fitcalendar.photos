export function PhotosWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={'photos-wordmark ' + className} role="img" aria-label="FITCALENDAR.PHOTOS" data-testid="photos-wordmark">
      <img src={`${import.meta.env.BASE_URL}brand/fitcalendar-photos-wordmark.svg`} className="photos-wordmark-image" alt="" aria-hidden="true" />
    </span>
  );
}
