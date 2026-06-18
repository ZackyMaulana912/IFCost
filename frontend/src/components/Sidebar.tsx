import { useState } from 'react'
import type { AnalysisResponse } from '../types/ifc'

interface SidebarProps {
  data: AnalysisResponse | null
}

const layers: { label: string; icon: string; keys: string[]; color: string }[] = [
  { label: 'Dinding', icon: 'view_day', keys: ['IfcWall', 'IfcWallStandardCase'], color: '#22C55E' },
  { label: 'Lantai', icon: 'layers', keys: ['IfcSlab'], color: '#D97706' },
  { label: 'Kolom', icon: 'view_column', keys: ['IfcColumn'], color: '#8B5CF6' },
  { label: 'Balok', icon: 'horizontal_rule', keys: ['IfcBeam'], color: '#EF4444' },
  { label: 'Jendela', icon: 'window', keys: ['IfcWindow'], color: '#6B7280' },
  { label: 'Pintu', icon: 'sensor_door', keys: ['IfcDoor'], color: '#3B82F6' },
]

export default function Sidebar({ data }: SidebarProps) {
  const [expanded, setExpanded] = useState(true)

  const summary = data?.summary ?? {}
  const rows = layers.map((l) => ({
    ...l,
    count: l.keys.reduce((acc, k) => acc + (summary[k] ?? 0), 0),
  }))
  const jenisAda = rows.filter((r) => r.count > 0).length

  return (
    <aside
      style={{
        width: 220,
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(22px) saturate(150%)',
        WebkitBackdropFilter: 'blur(22px) saturate(150%)',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '18px 14px 10px' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: '8px 10px',
            borderRadius: 10,
            cursor: 'pointer',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Lapisan</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
              {data ? `${jenisAda} Jenis Elemen` : 'Belum ada model'}
            </div>
          </div>
          <span
            className="material-icons-round"
            style={{
              fontSize: 22,
              color: 'var(--text-2)',
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }}
          >
            expand_more
          </span>
        </button>

        {expanded && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {rows.map((row) => (
              <div
                key={row.label}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 12px',
                  borderRadius: 10,
                  opacity: row.count > 0 ? 1 : 0.4,
                }}
              >
                <span
                  className="material-icons-round"
                  style={{ fontSize: 20, color: row.count > 0 ? row.color : 'var(--text-2)' }}
                >
                  {row.icon}
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', flex: 1 }}>{row.label}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: row.count > 0 ? 'var(--text)' : 'var(--text-2)',
                    background: row.count > 0 ? 'var(--surface-2)' : 'transparent',
                    borderRadius: 999,
                    padding: '2px 9px',
                    minWidth: 26,
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {data ? row.count : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />
    </aside>
  )
}
