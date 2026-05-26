// Enactive Loop Mark — Brand Guide v1.0
// Open loop (teal) = active, unresolved
// Closed loop (near-black) = complete

// Scale reference:
//   Inline with text    16px
//   Card icon / UI      24px
//   Section divider     32px
//   Hero / large        48–64px
//   Closure map label   20px

export const OpenLoop = ({ size = 24, color = '#2C5F5A' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth="2"
      strokeDasharray="48 8"
      strokeLinecap="round"
      transform="rotate(-90 12 12)"
    />
  </svg>
);

export const ClosedLoop = ({ size = 24, color = '#1C1B1A' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
  </svg>
);
