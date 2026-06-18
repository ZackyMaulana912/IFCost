import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface ViewerTabProps {
  ifcFile: File | null
}

export default function ViewerTab({ ifcFile }: ViewerTabProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTool, setActiveTool] = useState('home')
  const [showProps, setShowProps] = useState(false)
  const [viewerReady, setViewerReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingModel, setLoadingModel] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const componentsRef = useRef<any>(null)

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

        const world = worlds.create()
        world.scene = new OBC.SimpleScene(components)
        world.renderer = new OBCF.PostproductionRenderer(components, container)
        world.camera = new OBC.OrthoPerspectiveCamera(components)

        components.init()

        world.camera.controls?.setLookAt(12, 6, 8, 0, 0, -10)
        ;(world.scene as any).setup()

        const grids = components.get(OBC.Grids)
        grids.create(world)

        const fragmentsManager = components.get(OBC.FragmentsManager)

        // FragmentsManager v3 harus di-init dengan worker sebelum load IFC
        const workerUrl = await OBC.FragmentsManager.getWorker()
        await fragmentsManager.init(workerUrl)

        // v3: fragments butuh update eksplisit agar ter-render & culling
        // jalan saat kamera bergerak. Tanpa ini model tidak akan tampil.
        world.camera.controls?.addEventListener('rest', () => fragmentsManager.core.update(true))
        world.camera.controls?.addEventListener('update', () => fragmentsManager.core.update())

        const ifcLoader = components.get(OBC.IfcLoader)

        // Set WASM path ke file lokal di /public supaya tidak depend CDN
        await ifcLoader.setup({
          autoSetWasm: false,
          wasm: {
            path: '/',
            absolute: false,
          },
        })

        if (!destroyed) {
          componentsRef.current = { components, world, fragmentsManager, ifcLoader }
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
      const { world, fragmentsManager, ifcLoader } = componentsRef.current

      setLoadingModel(true)
      setLoadError(null)

      try {
        // Hapus model lama dari scene (v3: fragmentsManager.list -> FragmentsModel)
        for (const [id, old] of fragmentsManager.list) {
          world.scene.three.remove(old.object)
          await fragmentsManager.core.disposeModel(id)
        }

        const buffer = await ifcFile!.arrayBuffer()
        const data = new Uint8Array(buffer)

        // v3: ifcLoader.load() return FragmentsModel (BUKAN Object3D).
        // Yang ditambahkan ke scene adalah model.object, lalu wajib update().
        const model = await ifcLoader.load(data, true, ifcFile!.name)
        model.useCamera(world.camera.three)
        world.scene.three.add(model.object)
        await fragmentsManager.core.update(true)

        // Fit camera ke model — pakai model.box (THREE.Box3 bawaan v3)
        try {
          const bbox = model.box
          const center = bbox.getCenter(new THREE.Vector3())
          const size = bbox.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z) || 10
          await world.camera.controls?.setLookAt(
            center.x + maxDim, center.y + maxDim * 0.8, center.z + maxDim,
            center.x, center.y, center.z,
            true
          )
        } catch {
          await world.camera.controls?.setLookAt(20, 15, 20, 0, 0, 0, true)
        }
        // render ulang setelah kamera menetap
        await fragmentsManager.core.update(true)
      } catch (err) {
        console.error('IFC load error:', err)
        setLoadError(`Gagal memuat model 3D: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoadingModel(false)
      }
    }

    loadIFC()
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

      {/* Empty state — belum ada file */}
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

      {/* Loading model overlay */}
      {loadingModel && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(13,17,23,0.75)',
            backdropFilter: 'blur(4px)',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid rgba(255,255,255,0.15)',
              borderTopColor: '#3B82F6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Memuat model 3D...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error state */}
      {loadError && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 13,
            color: '#B91C1C',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span className="material-icons-round" style={{ fontSize: 16 }}>error_outline</span>
          {loadError}
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
            <button onClick={() => setShowProps(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <span className="material-icons-round" style={{ fontSize: 16, color: 'var(--text-2)' }}>close</span>
            </button>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>ENTITAS</div>
            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>Dinding — IfcWallStandardCase</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>GLOBALID</div>
            <div style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              2B$k_n98124uV$0I$Q$s$v
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[{ label: 'Volume', value: '1.47 m³' }, { label: 'Tinggi', value: '2.80 m' }].map((item) => (
              <div key={item.label} style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hint bar */}
      {ifcFile && !loadingModel && !loadError && (
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
    </div>
  )
}
