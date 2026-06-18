import { useEffect, useRef, useState } from 'react'

interface ViewerTabProps {
  ifcFile: File | null
}

export default function ViewerTab({ ifcFile }: ViewerTabProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTool, setActiveTool] = useState('home')
  const [showProps, setShowProps] = useState(false)
  const [viewerReady, setViewerReady] = useState(false)
  const componentsRef = useRef<{
    viewer: unknown
    world: unknown
    fragmentsManager: unknown
    ifcLoader: unknown
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let destroyed = false

    async function initViewer() {
      try {
        const OBC = await import('@thatopen/components')
        const OBCF = await import('@thatopen/components-front')

        const container = containerRef.current!
        const components = new OBC.Components()
        const worlds = components.get(OBC.Worlds)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const world: any = worlds.create()

        world.scene = new OBC.SimpleScene(components)
        world.renderer = new OBCF.PostproductionRenderer(components, container)
        world.camera = new OBC.OrthoPerspectiveCamera(components)

        components.init()

        world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10)
        world.scene.setup()

        const grids = components.get(OBC.Grids)
        grids.create(world)

        const fragmentsManager = components.get(OBC.FragmentsManager)
        const ifcLoader = components.get(OBC.IfcLoader)
        await ifcLoader.setup()

        if (!destroyed) {
          componentsRef.current = { viewer: components, world, fragmentsManager, ifcLoader }
          setViewerReady(true)
        }
      } catch (err) {
        console.error('Viewer init error:', err)
      }
    }

    initViewer()

    return () => {
      destroyed = true
    }
  }, [])

  useEffect(() => {
    if (!ifcFile || !viewerReady || !componentsRef.current) return

    async function loadIFC() {
      const { ifcLoader, fragmentsManager } = componentsRef.current!
      const loader = ifcLoader as { load: (data: Uint8Array) => Promise<unknown> }
      const manager = fragmentsManager as { groups: Map<string, unknown>; dispose: () => void }

      manager.dispose()

      const buffer = await ifcFile!.arrayBuffer()
      const data = new Uint8Array(buffer)
      await loader.load(data)
    }

    loadIFC().catch(console.error)
  }, [ifcFile, viewerReady])

  const tools = [
    { id: 'home', icon: 'home', label: 'Reset tampilan' },
    { id: 'grid', icon: 'grid_on', label: 'Grid' },
    { id: 'rotate', icon: '3d_rotation', label: 'Rotasi' },
    { id: 'section', icon: 'content_cut', label: 'Potongan' },
  ]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0D1117' }}>
      {/* Canvas container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Empty state */}
      {!ifcFile && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 50%, #1a2035 0%, #0D1117 70%)',
            pointerEvents: 'none',
          }}
        >
          {/* Dot grid background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <span
              className="material-icons-round"
              style={{ fontSize: 64, color: 'rgba(255,255,255,0.12)', marginBottom: 16, display: 'block' }}
            >
              view_in_ar
            </span>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
              Belum ada model IFC
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)' }}>
              Klik "Unggah IFC" untuk memuat model 3D
            </div>
          </div>
        </div>
      )}

      {/* Floating toolbar */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 4,
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 999,
          padding: '6px 10px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {tools.map((tool) => {
          const isActive = activeTool === tool.id
          return (
            <button
              key={tool.id}
              title={tool.label}
              onClick={() => setActiveTool(tool.id)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? 'rgba(59,130,246,0.7)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <span
                className="material-icons-round"
                style={{ fontSize: 18, color: isActive ? 'white' : 'rgba(255,255,255,0.7)' }}
              >
                {tool.icon}
              </span>
            </button>
          )
        })}
      </div>

      {/* Properties panel demo trigger */}
      {ifcFile && (
        <button
          onClick={() => setShowProps(!showProps)}
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999,
            padding: '6px 16px',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span className="material-icons-round" style={{ fontSize: 14 }}>info</span>
          Klik elemen untuk melihat properti
        </button>
      )}

      {/* Properties panel */}
      {showProps && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 260,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.8)',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-icons-round" style={{ fontSize: 16, color: 'var(--blue)' }}>info</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Properti</span>
            </div>
            <button
              onClick={() => setShowProps(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
            >
              <span className="material-icons-round" style={{ fontSize: 16, color: 'var(--text-2)' }}>close</span>
            </button>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              ENTITAS
            </div>
            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
              Dinding — IfcWallStandardCase
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              GLOBALID
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text)',
                fontFamily: 'JetBrains Mono, monospace',
                background: 'var(--surface-2)',
                padding: '4px 8px',
                borderRadius: 6,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              2B$k_n98124uV$0I$Q$s$v
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Volume', value: '1.47 m³' },
              { label: 'Tinggi', value: '2.80 m' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: 'var(--surface-2)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
