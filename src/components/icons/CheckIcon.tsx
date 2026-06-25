export function CheckIcon({
  style,
  width,
  height,
}: {
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      width={width || "12"}
      height={height || "12"}
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M2 6.5L4.5 9L10 3"
        stroke={style?.color || "currentColor"}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
