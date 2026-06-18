from __future__ import annotations

DEFAULT_HARGA = {
    "bata_merah": 1200,
    "semen_portland": 65000,
    "pasir": 250000,
    "beton_k250": 950000,
    "beton_k300": 1050000,
    "besi_ulir": 14500,
    "besi_polos": 13500,
    "bekisting": 180000,
    "keramik": 85000,
    "cat_dinding": 45000,
}


def _fmt(val: float, satuan: str) -> str:
    return f"{val:,.0f} {satuan}".replace(",", ".")


def calculate_rab(totals: dict, harga_satuan: dict | None = None) -> list[dict]:
    h = {**DEFAULT_HARGA, **(harga_satuan or {})}
    items = []

    wall_vol = totals.get("wall_volume", 0) or 0
    wall_area = totals.get("wall_area", 0) or 0
    slab_area = totals.get("slab_area", 0) or 0
    col_vol = totals.get("column_volume", 0) or 0
    beam_vol = totals.get("beam_volume", 0) or 0

    # --- Pasangan Dinding Bata ---
    if wall_vol > 0:
        bata = round(wall_vol * 500)
        semen = round(wall_vol * 8)
        pasir = round(wall_vol * 0.6, 2)
        sub_bata = bata * h["bata_merah"]
        sub_semen = semen * h["semen_portland"]
        sub_pasir = pasir * h["pasir"]
        total = sub_bata + sub_semen + sub_pasir

        items.append({
            "pekerjaan": "Pasangan Dinding Bata",
            "volume": round(wall_vol, 2),
            "satuan_volume": "m³",
            "material": "Batu Bata Merah",
            "kebutuhan": _fmt(bata, "bh"),
            "harga_satuan": h["bata_merah"],
            "subtotal": total,
            "sub_items": [
                {
                    "material": "Semen Portland",
                    "kebutuhan": _fmt(semen, "zak"),
                    "satuan": "zak",
                    "harga_satuan": h["semen_portland"],
                    "subtotal": sub_semen,
                },
                {
                    "material": "Pasir Pasang",
                    "kebutuhan": _fmt(pasir, "m³"),
                    "satuan": "m³",
                    "harga_satuan": h["pasir"],
                    "subtotal": sub_pasir,
                },
            ],
        })

        # Cat dinding (2 lapis)
        if wall_area > 0:
            luas_cat = wall_area * 2
            items.append({
                "pekerjaan": "Pengecatan Dinding",
                "volume": round(wall_area, 2),
                "satuan_volume": "m²",
                "material": "Cat Dinding",
                "kebutuhan": _fmt(luas_cat, "m²"),
                "harga_satuan": h["cat_dinding"],
                "subtotal": round(luas_cat * h["cat_dinding"]),
                "sub_items": [],
            })

    # --- Kolom Beton K-300 ---
    if col_vol > 0:
        bekisting_col = round(col_vol * 1.2, 2)
        sub_beton = round(col_vol * h["beton_k300"])
        sub_bek = round(bekisting_col * h["bekisting"])
        items.append({
            "pekerjaan": "Kolom Beton K-300",
            "volume": round(col_vol, 2),
            "satuan_volume": "m³",
            "material": "Beton Readymix K-300",
            "kebutuhan": _fmt(col_vol, "m³"),
            "harga_satuan": h["beton_k300"],
            "subtotal": sub_beton + sub_bek,
            "sub_items": [
                {
                    "material": "Bekisting Kolom",
                    "kebutuhan": _fmt(bekisting_col, "m²"),
                    "satuan": "m²",
                    "harga_satuan": h["bekisting"],
                    "subtotal": sub_bek,
                }
            ],
        })

    # --- Balok Beton K-250 ---
    if beam_vol > 0:
        bekisting_beam = round(beam_vol * 1.5, 2)
        sub_beton = round(beam_vol * h["beton_k250"])
        sub_bek = round(bekisting_beam * h["bekisting"])
        items.append({
            "pekerjaan": "Balok Beton K-250",
            "volume": round(beam_vol, 2),
            "satuan_volume": "m³",
            "material": "Beton Readymix K-250",
            "kebutuhan": _fmt(beam_vol, "m³"),
            "harga_satuan": h["beton_k250"],
            "subtotal": sub_beton + sub_bek,
            "sub_items": [
                {
                    "material": "Bekisting Balok",
                    "kebutuhan": _fmt(bekisting_beam, "m²"),
                    "satuan": "m²",
                    "harga_satuan": h["bekisting"],
                    "subtotal": sub_bek,
                }
            ],
        })

    # --- Plat Lantai Beton K-250 ---
    if slab_area > 0:
        slab_vol = round(slab_area * 0.12, 2)
        besi_kg = round(slab_vol * 150)
        sub_beton = round(slab_vol * h["beton_k250"])
        sub_besi = round(besi_kg * h["besi_ulir"])
        items.append({
            "pekerjaan": "Plat Lantai Beton K-250",
            "volume": round(slab_area, 2),
            "satuan_volume": "m²",
            "material": "Beton Readymix K-250",
            "kebutuhan": _fmt(slab_vol, "m³"),
            "harga_satuan": h["beton_k250"],
            "subtotal": sub_beton + sub_besi,
            "sub_items": [
                {
                    "material": "Besi Ulir D13",
                    "kebutuhan": _fmt(besi_kg, "kg"),
                    "satuan": "kg",
                    "harga_satuan": h["besi_ulir"],
                    "subtotal": sub_besi,
                }
            ],
        })

        # Lantai keramik
        keramik_m2 = round(slab_area * 1.1, 2)
        items.append({
            "pekerjaan": "Lantai Keramik",
            "volume": round(slab_area, 2),
            "satuan_volume": "m²",
            "material": "Keramik Lantai",
            "kebutuhan": _fmt(keramik_m2, "m²"),
            "harga_satuan": h["keramik"],
            "subtotal": round(keramik_m2 * h["keramik"]),
            "sub_items": [],
        })

    return items


def total_rab(items: list[dict]) -> float:
    return sum(item["subtotal"] for item in items)
