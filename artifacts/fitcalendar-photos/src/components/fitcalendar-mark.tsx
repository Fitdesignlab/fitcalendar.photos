export function FitCalendarMark({ className = 'h-8 w-auto', alt = '', testId }: { className?: string; alt?: string; testId?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}brand/fitcalendar-f-mark.png`}
      alt={alt}
      data-testid={testId}
      className={className + ' object-contain'}
    />
  );
}
