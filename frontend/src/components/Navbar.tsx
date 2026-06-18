import type { TabId } from '../types/ifc'

interface NavbarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onUploadClick: () => void
  fileName: string | null
}

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'viewer', label: 'Penampil 3D', icon: 'view_in_ar' },
  { id: 'qto', label: 'Daftar Kuantitas', icon: 'list_alt' },
  { id: 'rab', label: 'Estimasi Biaya', icon: 'payments' },
  { id: 'summary', label: 'Ringkasan Proyek', icon: 'dashboard' },
]

export default function Navbar({ activeTab, onTabChange, onUploadClick, fileName }: NavbarProps) {
  return (
    <nav
      style={{
        height: 56,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'stretch',
        padding: '0 24px',
        gap: 0,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginRight: 32,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: 'var(--blue)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="material-icons-round" style={{ color: 'white', fontSize: 16 }}>
            corporate_fare
          </span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          IFCost
        </span>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 4, flex: 1 }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 14px',
                fontSize: 14,
                fontWeight: 500,
                color: active ? 'var(--blue)' : 'var(--text-2)',
                background: 'none',
                border: 'none',
                borderBottom: active ? '2px solid var(--blue)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
                borderRadius: 0,
                fontFamily: 'Inter, sans-serif',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)'
              }}
            >
              <span className="material-icons-round" style={{ fontSize: 16 }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Right: filename + upload button + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {fileName && (
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-2)',
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {fileName}
          </span>
        )}
        <button className="btn-primary" onClick={onUploadClick}>
          <span className="material-icons-round" style={{ fontSize: 16 }}>
            upload_file
          </span>
          Unggah IFC
        </button>
      </div>
    </nav>
  )
}
