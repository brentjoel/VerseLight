export function BrandMark({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="16" cy="16" r="14" opacity=".5" />
    <circle cx="16" cy="16" r="10" opacity=".65" />
    <path d="m16 6 2.5 7.5L26 16l-7.5 2.5L16 26l-2.5-7.5L6 16l7.5-2.5Z" />
  </svg>;
}
