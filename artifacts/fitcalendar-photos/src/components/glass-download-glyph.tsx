/** Maria's tray-arrow glyph. The glass circle (fill, border, backdrop blur) stays on the button. */
export function GlassDownloadGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 30" fill="none" className={'glass-download-glyph ' + className} aria-hidden="true">
      <path d="M15 10V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 14.5L15 17.5L18 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 19.5H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
