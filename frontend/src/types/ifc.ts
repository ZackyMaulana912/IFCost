export interface WallQTO {
  GlobalId: string
  Name: string
  Type: string
  Length: number | null
  Height: number | null
  NetSideArea: number | null
  NetVolume: number | null
  GrossVolume: number | null
}

export interface SlabQTO {
  GlobalId: string
  Name: string
  PredefinedType: string | null
  GrossArea: number | null
  NetArea: number | null
  Volume: number | null
}

export interface ColumnQTO {
  GlobalId: string
  Name: string
  Length: number | null
  CrossSectionArea: number | null
  Volume: number | null
}

export interface BeamQTO {
  GlobalId: string
  Name: string
  Length: number | null
  CrossSectionArea: number | null
  Volume: number | null
}

export interface SpaceData {
  GlobalId: string
  RoomName: string
  FloorArea: number | null
  Height: number | null
}

export interface QTOTotals {
  wall_volume: number
  wall_area: number
  slab_area: number
  column_volume: number
  beam_volume: number
  floor_area: number
}

export interface AnalysisResponse {
  filename: string
  schema: string
  summary: Record<string, number>
  qto: {
    walls: WallQTO[]
    slabs: SlabQTO[]
    columns: ColumnQTO[]
    beams: BeamQTO[]
  }
  spaces: SpaceData[]
  totals: QTOTotals
}

export interface HargaSatuan {
  bata_merah: number
  semen_portland: number
  pasir: number
  beton_k250: number
  beton_k300: number
  besi_ulir: number
  besi_polos: number
  bekisting: number
  keramik: number
  cat_dinding: number
}

export interface RABSubItem {
  material: string
  kebutuhan: string
  satuan: string
  harga_satuan: number
  subtotal: number
}

export interface RABItem {
  pekerjaan: string
  volume: number | null
  satuan_volume: string
  material: string
  kebutuhan: string
  harga_satuan: number
  subtotal: number
  sub_items?: RABSubItem[]
}

export type TabId = 'viewer' | 'qto' | 'rab' | 'summary'
