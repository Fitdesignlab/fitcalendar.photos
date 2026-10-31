export function FMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <img src={`${import.meta.env.BASE_URL}fitcalendar-mark.png`} alt="Fit Calendar" className={className + ' object-contain'} />
  );
}
