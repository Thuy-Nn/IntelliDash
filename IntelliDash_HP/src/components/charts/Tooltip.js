export default function HorrorTooltip({ active, payload, label, theme }) {
  const fontFamily = theme?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: `rgba(167, 139, 250, 0.6)`,
          border: `1px solid rgba(167, 139, 250, 0.3)`,
          boxShadow: '0 12px 36px rgba(167, 139, 250, 0.15)',
          padding: '0.5rem 0.5rem',
          fontSize: '0.7rem',
          color: '#fff',
          fontFamily: fontFamily,
          letterSpacing: '0.05em'
        }}
      >
        {label && <div style={{ color: '#fff', marginBottom: '4px' }}>
          {label}
        </div>}
        {payload.map((p, i) => (
          <div key={i}>
            {p.name}: <strong>{p.value.toLocaleString()}</strong>
          </div>
        ))}
      </div>
    )
  };

}