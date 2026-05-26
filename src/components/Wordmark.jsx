// Enactive Wordmark — Brand Guide v1.0
// Two-tone: "en" in Open (#2C5F5A), "active" in Closed (#1C1B1A)
// Plus Jakarta Sans, weight 500, letter-spacing -0.02em

const Wordmark = ({ size = 28 }) => (
  <span
    style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: size,
      fontWeight: 500,
      letterSpacing: '-0.02em',
      lineHeight: 1,
      color: '#1C1B1A',
      userSelect: 'none',
    }}
  >
    <span style={{ color: '#2C5F5A' }}>en</span>active
  </span>
);

export default Wordmark;
