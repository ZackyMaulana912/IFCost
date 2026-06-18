import type { QTOTotals, HargaSatuan, RABItem } from '../types/ifc'

export const DEFAULT_HARGA: HargaSatuan = {
  bata_merah: 1200,
  semen_portland: 65000,
  pasir: 250000,
  beton_k250: 950000,
  beton_k300: 1050000,
  besi_ulir: 14500,
  besi_polos: 13500,
  bekisting: 180000,
  keramik: 85000,
  cat_dinding: 45000,
}

export function calculateRAB(totals: QTOTotals, harga: HargaSatuan): RABItem[] {
  const items: RABItem[] = []

  // Dinding — volume dinding m³ -> bata, semen, pasir
  if (totals.wall_volume > 0) {
    const vol = totals.wall_volume
    const bataBh = Math.round(vol * 500)
    const semenZak = Math.round(vol * 8)
    const pasirM3 = +(vol * 0.6).toFixed(2)
    const subtotalBata = bataBh * harga.bata_merah
    const subtotalSemen = semenZak * harga.semen_portland
    const subtotalPasir = pasirM3 * harga.pasir
    const subtotal = subtotalBata + subtotalSemen + subtotalPasir

    items.push({
      pekerjaan: 'Pasangan Dinding Bata',
      volume: vol,
      satuan_volume: 'm³',
      material: 'Batu Bata Merah',
      kebutuhan: formatKebutuhan(bataBh, 'bh'),
      harga_satuan: harga.bata_merah,
      subtotal,
      sub_items: [
        {
          material: 'Semen Portland',
          kebutuhan: formatKebutuhan(semenZak, 'zak'),
          satuan: 'zak',
          harga_satuan: harga.semen_portland,
          subtotal: subtotalSemen,
        },
        {
          material: 'Pasir Pasang',
          kebutuhan: formatKebutuhan(pasirM3, 'm³'),
          satuan: 'm³',
          harga_satuan: harga.pasir,
          subtotal: subtotalPasir,
        },
      ],
    })

    // Cat dinding — luas sisi m²
    if (totals.wall_area > 0) {
      const luasCat = totals.wall_area * 2
      items.push({
        pekerjaan: 'Pengecatan Dinding',
        volume: totals.wall_area,
        satuan_volume: 'm²',
        material: 'Cat Dinding',
        kebutuhan: formatKebutuhan(+(luasCat).toFixed(1), 'm²'),
        harga_satuan: harga.cat_dinding,
        subtotal: luasCat * harga.cat_dinding,
      })
    }
  }

  // Kolom beton
  if (totals.column_volume > 0) {
    const vol = totals.column_volume
    const bekistingM2 = +(vol * 1.2).toFixed(2)
    const subtotalBeton = vol * harga.beton_k300
    const subtotalBekisting = bekistingM2 * harga.bekisting
    items.push({
      pekerjaan: 'Kolom Beton K-300',
      volume: vol,
      satuan_volume: 'm³',
      material: 'Beton Readymix K-300',
      kebutuhan: formatKebutuhan(vol, 'm³'),
      harga_satuan: harga.beton_k300,
      subtotal: subtotalBeton + subtotalBekisting,
      sub_items: [
        {
          material: 'Bekisting Kolom',
          kebutuhan: formatKebutuhan(bekistingM2, 'm²'),
          satuan: 'm²',
          harga_satuan: harga.bekisting,
          subtotal: subtotalBekisting,
        },
      ],
    })
  }

  // Balok beton
  if (totals.beam_volume > 0) {
    const vol = totals.beam_volume
    const bekistingM2 = +(vol * 1.5).toFixed(2)
    const subtotalBeton = vol * harga.beton_k250
    const subtotalBekisting = bekistingM2 * harga.bekisting
    items.push({
      pekerjaan: 'Balok Beton K-250',
      volume: vol,
      satuan_volume: 'm³',
      material: 'Beton Readymix K-250',
      kebutuhan: formatKebutuhan(vol, 'm³'),
      harga_satuan: harga.beton_k250,
      subtotal: subtotalBeton + subtotalBekisting,
      sub_items: [
        {
          material: 'Bekisting Balok',
          kebutuhan: formatKebutuhan(bekistingM2, 'm²'),
          satuan: 'm²',
          harga_satuan: harga.bekisting,
          subtotal: subtotalBekisting,
        },
      ],
    })
  }

  // Plat lantai
  if (totals.slab_area > 0) {
    const area = totals.slab_area
    const vol = +(area * 0.12).toFixed(2)
    const besiKg = Math.round(vol * 150)
    const subtotalBeton = vol * harga.beton_k250
    const subtotalBesi = besiKg * harga.besi_ulir
    items.push({
      pekerjaan: 'Plat Lantai Beton K-250',
      volume: area,
      satuan_volume: 'm²',
      material: 'Beton Readymix K-250',
      kebutuhan: formatKebutuhan(vol, 'm³'),
      harga_satuan: harga.beton_k250,
      subtotal: subtotalBeton + subtotalBesi,
      sub_items: [
        {
          material: 'Besi Ulir D13',
          kebutuhan: formatKebutuhan(besiKg, 'kg'),
          satuan: 'kg',
          harga_satuan: harga.besi_ulir,
          subtotal: subtotalBesi,
        },
      ],
    })

    // Lantai keramik
    const keramikM2 = +(area * 1.1).toFixed(2)
    items.push({
      pekerjaan: 'Lantai Keramik',
      volume: area,
      satuan_volume: 'm²',
      material: 'Keramik Lantai',
      kebutuhan: formatKebutuhan(keramikM2, 'm²'),
      harga_satuan: harga.keramik,
      subtotal: keramikM2 * harga.keramik,
    })
  }

  return items
}

function formatKebutuhan(value: number, satuan: string): string {
  const formatted = new Intl.NumberFormat('id-ID').format(value)
  return `${formatted} ${satuan}`
}

export function totalRAB(items: RABItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0)
}
