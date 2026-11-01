export function PhotosWordmark({ className = '' }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}brand/fitcalendar-photos-wordmark.svg`}
      alt="FITCALENDAR.PHOTOS"
      className={'photos-wordmark ' + className}
      data-testid="photos-wordmark"
    />
  );
}
