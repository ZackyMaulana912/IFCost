---
title: IFCost Backend
emoji: 🏗️
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# IFCost Backend

API FastAPI untuk analisis file IFC (BIM): ekstraksi QTO (Quantity Take-Off)
dan kalkulasi RAB (Rencana Anggaran Biaya).

Frontend: https://github.com/ZackyMaulana912/IFCost

## Endpoint

- `GET /` — health check → `{"status":"ok","version":"1.0.0"}`
- `POST /api/analyze` — upload file `.ifc` (multipart, field `file`), return JSON QTO
- `POST /api/export/excel` — export data QTO + RAB ke `.xlsx`

## Jalankan lokal

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 7860
```

## Stack

FastAPI · ifcopenshell · pandas · numpy · openpyxl · Docker (port 7860)
