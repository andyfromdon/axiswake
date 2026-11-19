export function AxisDirection({ direction = 'next' }: { direction?: 'next' | 'previous' }) {
  return (
    <svg
      className="axis-direction"
      data-direction={direction}
      viewBox="0 0 24 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M2 3h9.5C15.7 3 19 5 22 8c-3 3-6.3 5-10.5 5H2l2.4-5L2 3Zm4.25 4.2v1.6h9.5L17.5 8l-1.75-.8h-9.5Z"
      />
    </svg>
  );
}
