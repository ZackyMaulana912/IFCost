import { useRef, useState } from 'react'

interface UploadZoneProps {
  onFile: (file: File) => void
  loading: boolean
  onClose: () => void
}

export default function UploadZone({ onFile, loading, onClose }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.ifc')) {
      onFile(file)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      onFile(file)
      onClose()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 16,
          padding: 32,
          width: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: 'rgba(59,130,246,0.1)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-icons-round" style={{ color: 'var(--blue)', fontSize: 20 }}>
                upload_file
              </span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Unggah File IFC</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Maksimum 50MB</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span className="material-icons-round" style={{ fontSize: 20, color: 'var(--text-2)' }}>
              close
            </span>
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !loading && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--blue)' : 'var(--border)'}`,
            borderRadius: 12,
            padding: '40px 24px',
            textAlign: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: dragging ? 'rgba(59,130,246,0.04)' : 'var(--surface-2)',
            transition: 'all 0.15s',
          }}
        >
          {loading ? (
            <div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: '3px solid var(--border)',
                  borderTopColor: 'var(--blue)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 16px',
                }}
              />
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Menganalisis file...</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                Backend sedang memproses data IFC
              </div>
            </div>
          ) : (
            <div>
              <span
                className="material-icons-round"
                style={{ fontSize: 40, color: 'var(--text-2)', marginBottom: 12, display: 'block' }}
              >
                cloud_upload
              </span>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
                Seret dan lepas file di sini
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>
                atau klik untuk memilih file
              </div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '4px 12px',
                  fontSize: 11,
                  color: 'var(--text-2)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                .ifc
              </div>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".ifc"
          style={{ display: 'none' }}
          onChange={handleChange}
        />

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
