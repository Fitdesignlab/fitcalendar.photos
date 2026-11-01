export function LogoLockup({ className = 'text-[30px]', variant = 'wordmark' }: { className?: string; variant?: 'wordmark' | 'mark' | 'lockup' }) {
  return (
    <span
      className={'inline-flex max-w-full items-center leading-none ' + className}
      data-testid="logo-lockup"
    >
      <img
        src={`${import.meta.env.BASE_URL}fitcalendar-brand-${variant}.svg`}
        alt="FitCalendar"
        className="block h-[.74em] w-auto max-w-full object-contain"
      />
    </span>
  );
}
