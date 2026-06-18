import { useState } from 'react'
import type { AnalysisResponse } from '../types/ifc'

interface SidebarProps {
  data: AnalysisResponse | null
}

const layers: { label: string; icon: string; keys: string[]; color: string }[] = [
  { label: 'Dinding', icon: 'square', keys: ['IfcWall', 'IfcWallStandardCase'], color: '#22C55E' },
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
        width: 200,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px 12px 8px' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: '4px 8px',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Lapisan</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
              {data ? `${jenisAda} Jenis Elemen` : 'Belum ada model'}
            </div>
          </div>
          <span
            className="material-icons-round"
            style={{
              fontSize: 18,
              color: 'var(--text-2)',
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }}
          >
            expand_more
          </span>
        </button>

        {expanded && (
          <div style={{ marginTop: 4 }}>
            {rows.map((row) => (
              <div
                key={row.label}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 8px',
                  borderRadius: 6,
                  opacity: row.count > 0 ? 1 : 0.4,
                }}
              >
                <span
                  className="material-icons-round"
                  style={{ fontSize: 15, color: row.count > 0 ? row.color : 'var(--text-2)' }}
                >
                  {row.icon}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{row.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>
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
