import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface ViewerTabProps {
  ifcFile: File | null
}

export default function ViewerTab({ ifcFile }: ViewerTabProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewerReady, setViewerReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingModel, setLoadingModel] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const componentsRef = useRef<any>(null)
  const lastBoxRef = useRef<THREE.Box3 | null>(null)

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
          lastBoxRef.current = bbox
          fitToBox(bbox)
        } catch {
          await world.camera.controls?.setLookAt(20, 15, 20, 0, 0, 0, true)
        }
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

  function fitToBox(bbox: THREE.Box3) {
    const refs = componentsRef.current
    if (!refs) return
    const center = bbox.getCenter(new THREE.Vector3())
    const size = bbox.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 10
    refs.world.camera.controls?.setLookAt(
      center.x + maxDim, center.y + maxDim * 0.8, center.z + maxDim,
      center.x, center.y, center.z,
      true,
    )
  }

  function handleReset() {
    const refs = componentsRef.current
    if (!refs) return
    if (lastBoxRef.current) {
      fitToBox(lastBoxRef.current)
    } else {
      refs.world.camera.controls?.setLookAt(12, 6, 8, 0, 0, -10, true)
    }
    refs.fragmentsManager.core.update(true)
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#1E293B' }}>
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
            background: 'radial-gradient(circle at 50% 45%, #334155 0%, #1E293B 70%)',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <span
              className="material-icons-round"
              style={{ fontSize: 64, color: 'rgba(255,255,255,0.18)', marginBottom: 16, display: 'block' }}
            >
              view_in_ar
            </span>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>
              Belum ada model IFC
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
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
            background: 'rgba(30,41,59,0.75)',
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
            background: 'rgba(248,113,113,0.14)',
            border: '1px solid rgba(248,113,113,0.32)',
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 13,
            color: '#FCA5A5',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span className="material-icons-round" style={{ fontSize: 16 }}>error_outline</span>
          {loadError}
        </div>
      )}

      {/* Reset view button — satu kontrol yang benar-benar berfungsi */}
      {ifcFile && !loadingModel && !loadError && (
        <button
          onClick={handleReset}
          title="Reset tampilan ke model"
          style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999,
            padding: '8px 16px',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span className="material-icons-round" style={{ fontSize: 16 }}>center_focus_strong</span>
          Reset tampilan
        </button>
      )}
    </div>
  )
}
