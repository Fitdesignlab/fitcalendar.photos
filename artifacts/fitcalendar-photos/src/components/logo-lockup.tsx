export function LogoLockup({ className = 'text-[30px]' }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="FitCalendar"
      className={'inline-flex shrink-0 items-center gap-[0.18em] whitespace-nowrap font-bold leading-none tracking-[-0.04em] text-black ' + className}
      style={{ fontFamily: "'Inter Tight', 'Inter', sans-serif" }}
      data-testid="logo-lockup"
    >
      <img
        src={`${import.meta.env.BASE_URL}fitcalendar-mark.png`}
        alt=""
        aria-hidden="true"
        className="h-[1.35em] w-auto shrink-0 object-contain brightness-0"
      />
      <span aria-hidden="true">FitCalendar</span>
    </span>
  );
}
