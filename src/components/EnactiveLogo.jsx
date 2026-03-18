import React from 'react';

/**
 * Enactive SVG logo mark.
 * variant="light" → white wordmark + blue accent (for dark backgrounds, default)
 * variant="dark"  → navy wordmark + blue accent (for light backgrounds)
 */
export default function EnactiveLogo({ variant = 'light', className = '', style = {} }) {
  const base = variant === 'dark' ? '#0F172A' : '#ffffff';
  const accent = '#2563EB';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 30"
      fill="none"
      role="img"
      aria-label="Enactive"
      className={className}
      style={{ display: 'block', ...style }}
    >
      {/* ── Cognitive node mark ── */}

      {/* Edges (rendered behind nodes) */}
      <line x1="11" y1="7"  x2="3"  y2="23" stroke={base} strokeWidth="1"   opacity="0.35" />
      <line x1="11" y1="7"  x2="21" y2="23" stroke={base} strokeWidth="1"   opacity="0.35" />
      <line x1="3"  y1="23" x2="21" y2="23" stroke={base} strokeWidth="0.8" opacity="0.2"  strokeDasharray="2.5 2" />

      {/* Nodes */}
      <circle cx="11" cy="7"  r="3"   fill={accent} />
      <circle cx="3"  cy="23" r="2"   fill={base} opacity="0.55" />
      <circle cx="21" cy="23" r="2"   fill={base} opacity="0.55" />

      {/* ── Wordmark ── */}
      <text
        x="30"
        y="21"
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="15.5"
        fontWeight="600"
        letterSpacing="0.03em"
      >
        <tspan fill={base}>en</tspan>
        <tspan fill={accent}>act</tspan>
        <tspan fill={base}>ive</tspan>
      </text>
    </svg>
  );
}
