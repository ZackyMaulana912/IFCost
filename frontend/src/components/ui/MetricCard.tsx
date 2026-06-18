interface MetricCardProps {
  label: string
  value: string
  icon: string
  iconColor: string
  iconBg: string
}

export default function MetricCard({ label, value, icon, iconColor, iconBg }: MetricCardProps) {
  return (
    <div
      className="card"
      style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 400, marginBottom: 8 }}>{label}</div>
        <div
          style={{
            // perkecil font otomatis untuk nominal panjang (mis. "Rp 569.700.000")
            fontSize: value.length > 12 ? 20 : value.length > 9 ? 24 : 32,
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.1,
            wordBreak: 'break-word',
          }}
        >
          {value}
        </div>
      </div>
      <div
        style={{
          width: 40,
          height: 40,
          background: iconBg,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span className="material-icons-round" style={{ fontSize: 20, color: iconColor }}>
          {icon}
        </span>
      </div>
    </div>
  )
}
