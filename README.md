# IFCost — BIM Dashboard (IFC Viewer + QTO + RAB)

Aplikasi web untuk analisis file **IFC** (Building Information Modeling): menampilkan
model **3D** bangunan, menghitung **QTO** (Quantity Take-Off / Daftar Kuantitas), dan
menyusun **RAB** (Rencana Anggaran Biaya) lengkap dengan ekspor Excel.

> Platform: desktop web (min. 1280px). Bahasa UI: Indonesia.

## Demo / Live

| Layanan | URL |
|---------|-----|
| Web App (Vercel) | https://ifcost-web.vercel.app |
| Backend API (HuggingFace) | https://zacky912-ifcost-web.hf.space |
| Repository | https://github.com/ZackyMaulana912/IFCost |

> Backend di HF free-tier bisa "tidur" — request pertama (cold start) butuh sekitar 30 detik.
> Cek status: buka `https://zacky912-ifcost-web.hf.space/` lalu pastikan muncul `{"status":"ok"}`.

## Fitur

- **Penampil 3D** — render model IFC langsung di browser (WebGL via @thatopen/components).
- **Daftar Kuantitas (QTO)** — ekstraksi volume, luas, & dimensi per elemen (dinding, lantai, kolom, balok).
- **Estimasi Biaya (RAB)** — kalkulasi kebutuhan material + biaya, harga satuan bisa diubah.
- **Ringkasan Proyek** — metric cards, distribusi elemen (donut), luas per ruangan (bar chart).
- **Ekspor Excel** — QTO + RAB multi-sheet (.xlsx).

## Arsitektur

```
Frontend (React + Vite + TS)            Backend (FastAPI + Python 3.11)
        Vercel              <------->          HuggingFace Spaces (Docker)
```

File IFC di-parse **dua kali secara independen**:
- **Browser** (@thatopen/components) untuk rendering 3D (geometri).
- **Backend** (ifcopenshell) untuk ekstraksi kuantitas (QTO) dari `IfcElementQuantity`/pset.

> Catatan: QTO **dibaca dari quantity yang tersimpan di file** (bukan diukur dari mesh 3D).
> RAB dihitung dari QTO memakai koefisien standar (mis. 500 bata/m³) sehingga bersifat **estimasi**.

```
User upload .ifc
  -> Frontend: parse & render 3D di browser
  -> Frontend: kirim file ke POST /api/analyze
  -> Backend: ifcopenshell -> QTO -> JSON
  -> Frontend: hitung RAB + isi semua tab
```

## Struktur

```
IFCost/
├── frontend/      # React + Vite + TypeScript  -> Vercel   (lihat frontend/README.md)
├── backend/       # FastAPI + ifcopenshell      -> HF Space (lihat backend/README.md)
├── scripts/       # generate_house.py — generator file IFC contoh
└── .github/workflows/deploy-backend.yml  # auto-deploy backend ke HF Spaces
```

## Menjalankan secara lokal

**Backend** (port 8000):
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend** (port 5173):
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

## File IFC contoh

- `scripts/generate_house.py` — generator rumah 2 lantai (dinding, kolom, balok, tangga,
  kolam renang, ruangan ber-QTO). Jalankan: `python3 scripts/generate_house.py`.
- File contoh ada di `MASALAH/` (duplex.ifc, contoh.ifc, rumah_2lantai.ifc).

## Tech Stack

**Frontend:** React 18, Vite, TypeScript, Tailwind, @thatopen/components, Recharts, axios.
**Backend:** FastAPI, ifcopenshell, pandas, numpy, openpyxl, Docker.

## Deployment

- **Frontend -> Vercel.** Set env `VITE_API_URL = https://zacky912-ifcost-web.hf.space`, lalu redeploy.
- **Backend -> HuggingFace Spaces (Docker, port 7860).** Otomatis via GitHub Actions saat push ke `backend/**` (butuh secret `HF_TOKEN`).
