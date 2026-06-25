export function SelectModeIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5.785 5.426a.5.5 0 0 0-.61.61l2.297 8.896a.5.5 0 0 0 .925.11l2.224-4.17 4.17-2.225a.5.5 0 0 0-.11-.925Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}
