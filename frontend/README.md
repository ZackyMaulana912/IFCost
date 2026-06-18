# IFCost — Frontend

Antarmuka web IFCost: penampil 3D IFC, tabel QTO, estimasi RAB, dan ringkasan proyek.
Bagian dari proyek [IFCost](../README.md).

**Live:** https://ifcost-web.vercel.app
**Backend API:** https://zacky912-ifcost-web.hf.space

## Tech Stack

React 18 · Vite · TypeScript · Tailwind CSS · [@thatopen/components](https://docs.thatopen.com/) (viewer 3D) · Recharts (chart) · axios

## Menjalankan lokal

```bash
npm install

# arahkan ke backend (lokal atau HF)
echo "VITE_API_URL=http://localhost:8000" > .env
# atau: echo "VITE_API_URL=https://zacky912-ifcost-web.hf.space" > .env

npm run dev        # http://localhost:5173
```

## Script

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Dev server (Vite, HMR) |
| `npm run build` | Build production → `dist/` (copy WASM + tsc + vite build) |
| `npm run preview` | Preview hasil build |

## Variabel Lingkungan

| Variabel | Contoh | Keterangan |
|----------|--------|------------|
| `VITE_API_URL` | `https://zacky912-ifcost-web.hf.space` | URL backend. **Wajib** di-set, dibaca saat build. |

> `.env` di-gitignore. Di Vercel, set lewat **Settings → Environment Variables**, lalu **Redeploy** (Vite membaca env saat build, bukan runtime).

## Struktur

```
src/
├── components/
│   ├── Navbar.tsx · Sidebar.tsx
│   ├── tabs/        # ViewerTab, QTOTab, RABTab, SummaryTab
│   └── ui/          # MetricCard, UploadZone
├── hooks/useAnalysis.ts     # POST /api/analyze
├── utils/                   # rab.ts, format.ts
└── types/ifc.ts
```

## Catatan teknis

- **WASM:** `web-ifc.wasm` / `web-ifc-mt.wasm` disalin ke `public/` saat build (`copy-wasm.cjs`), loader di-set `autoSetWasm: false` agar tidak bergantung CDN.
- **@thatopen v3:** `ifcLoader.load()` mengembalikan `FragmentsModel` — yang ditambahkan ke scene adalah `model.object`, lalu wajib `fragmentsManager.core.update(true)` untuk render.

## Deploy (Vercel)

Root directory: `frontend/`. Build: `npm run build`, output: `dist`.
`vercel.json` sudah berisi SPA rewrite ke `index.html`.
Jangan lupa set `VITE_API_URL` di Environment Variables.
