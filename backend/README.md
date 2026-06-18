---
title: IFCost Backend
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# IFCost Backend

API FastAPI untuk analisis file IFC (BIM): ekstraksi QTO (Quantity Take-Off) dan
kalkulasi RAB (Rencana Anggaran Biaya). Bagian dari proyek
[IFCost](https://github.com/ZackyMaulana912/IFCost).

- Live API: https://zacky912-ifcost-web.hf.space
- Web App: https://ifcost-web.vercel.app

## Endpoint

| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/` | Health check, return `{"status":"ok","version":"1.0.0"}` |
| POST | `/api/analyze` | Upload `.ifc` (multipart, field `file`, maks 50MB) -> JSON QTO |
| POST | `/api/export/excel` | Data QTO + RAB -> file `.xlsx` multi-sheet |

Contoh:

```bash
curl https://zacky912-ifcost-web.hf.space/
curl -F "file=@model.ifc" https://zacky912-ifcost-web.hf.space/api/analyze
```

## Jalankan lokal

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Struktur

```
backend/
├── main.py            # FastAPI app, endpoint, CORS, export Excel
├── ifc_parser.py      # parse IFC -> QTO (walls, slabs, columns, beams, spaces)
├── rab_calculator.py  # QTO -> RAB (koefisien material + harga satuan)
├── requirements.txt
├── Dockerfile         # image untuk HF Spaces (port 7860)
└── README.md          # file ini (juga jadi metadata HF Space)
```

## Cara kerja singkat

1. `ifc_parser.py` membaca **quantity yang tersimpan di file** (`IfcElementQuantity`/pset),
   bukan mengukur dari geometri. Mendukung format ArchiCAD (pset tanpa nama) maupun
   Revit (`PSet_Revit_Dimensions`) lewat daftar kandidat nama properti.
2. `rab_calculator.py` mengubah QTO jadi RAB dengan koefisien standar (mis. 500 bata/m³,
   8 zak semen/m³). Harga satuan default bisa di-override dari frontend. Hasilnya **estimasi**.

## CORS

`allow_origins` di `main.py` harus memuat URL frontend (`https://ifcost-web.vercel.app`
dan `http://localhost:5173`).

## Deploy (HuggingFace Spaces)

Docker SDK, port 7860. Deploy otomatis via GitHub Actions
(`.github/workflows/deploy-backend.yml`) saat ada push ke `backend/**` — butuh secret
`HF_TOKEN` di repo GitHub. Saat build, isi `backend/` disalin ke Space `Zacky912/ifcost_web`.

## Stack

FastAPI, ifcopenshell, pandas, numpy, openpyxl, Docker.
