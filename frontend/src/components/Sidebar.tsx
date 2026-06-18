import { useState } from 'react'
import type { TabId } from '../types/ifc'

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const layers = [
  { id: 'walls', label: 'Dinding', icon: 'wall' },
  { id: 'slabs', label: 'Lantai', icon: 'layers' },
  { id: 'columns', label: 'Kolom', icon: 'view_column' },
  { id: 'beams', label: 'Balok', icon: 'horizontal_rule' },
  { id: 'windows', label: 'Jendela', icon: 'window' },
  { id: 'doors', label: 'Pintu', icon: 'sensor_door' },
]

const bottomNav = [
  { id: 'settings', label: 'Pengaturan', icon: 'settings' },
  { id: 'help', label: 'Bantuan', icon: 'help_outline' },
]

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [layersExpanded, setLayersExpanded] = useState(true)
  const [activeLayer, setActiveLayer] = useState<string | null>(null)

  void activeTab
  void onTabChange

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
      {/* Lapisan section */}
      <div style={{ padding: '16px 12px 8px' }}>
        <button
          onClick={() => setLayersExpanded(!layersExpanded)}
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
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>6 Jenis Elemen</div>
          </div>
          <span
            className="material-icons-round"
            style={{
              fontSize: 18,
              color: 'var(--text-2)',
              transform: layersExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }}
          >
            expand_more
          </span>
        </button>

        {layersExpanded && (
          <div style={{ marginTop: 4 }}>
            {layers.map((layer) => {
              const isActive = activeLayer === layer.id
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(isActive ? null : layer.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '7px 8px',
                    borderRadius: 6,
                    background: isActive ? 'rgba(59,130,246,0.08)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'none'
                  }}
                >
                  <span
                    className="material-icons-round"
                    style={{
                      fontSize: 15,
                      color: isActive ? 'var(--blue)' : 'var(--text-2)',
                    }}
                  >
                    {layer.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      color: isActive ? 'var(--blue)' : 'var(--text)',
                    }}
                  >
                    {layer.label}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom nav */}
      <div style={{ padding: '8px 12px 16px', borderTop: '1px solid var(--border)' }}>
        {bottomNav.map((item) => (
          <button
            key={item.id}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 8px',
              borderRadius: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'none'
            }}
          >
            <span className="material-icons-round" style={{ fontSize: 16, color: 'var(--text-2)' }}>
              {item.icon}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
