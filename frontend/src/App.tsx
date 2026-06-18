import { useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ViewerTab from './components/tabs/ViewerTab'
import QTOTab from './components/tabs/QTOTab'
import RABTab from './components/tabs/RABTab'
import SummaryTab from './components/tabs/SummaryTab'
import UploadZone from './components/ui/UploadZone'
import { useAnalysis } from './hooks/useAnalysis'
import type { TabId } from './types/ifc'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('viewer')
  const [showUpload, setShowUpload] = useState(false)
  const [ifcFile, setIfcFile] = useState<File | null>(null)
  const { data, loading, error, fileName, analyze } = useAnalysis()

  async function handleFile(file: File) {
    setIfcFile(file)
    setActiveTab('viewer')
    setShowUpload(false)
    await analyze(file)
    setActiveTab('qto')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUploadClick={() => setShowUpload(true)}
        fileName={fileName}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar data={data} />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {/* Error banner */}
          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 0,
                padding: '10px 24px',
                fontSize: 13,
                color: '#B91C1C',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <span className="material-icons-round" style={{ fontSize: 16 }}>error_outline</span>
              {error}
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(248,249,250,0.8)',
                backdropFilter: 'blur(4px)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  border: '4px solid var(--border)',
                  borderTopColor: 'var(--blue)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>Menganalisis file IFC...</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Backend sedang mengekstrak data QTO</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Tab content — semua tab tetap mounted, hanya visibility yang berubah
              supaya ViewerTab tidak re-init setiap ganti tab */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: activeTab === 'viewer' ? 'flex' : 'none', flex: 1, flexDirection: 'column' }}>
              <ViewerTab ifcFile={ifcFile} />
            </div>
            <div style={{ display: activeTab === 'qto' ? 'flex' : 'none', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
              <QTOTab data={data} />
            </div>
            <div style={{ display: activeTab === 'rab' ? 'flex' : 'none', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
              <RABTab data={data} />
            </div>
            <div style={{ display: activeTab === 'summary' ? 'flex' : 'none', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
              <SummaryTab data={data} />
            </div>
          </div>
        </main>
      </div>

      {showUpload && (
        <UploadZone
          onFile={handleFile}
          loading={loading}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  )
}
