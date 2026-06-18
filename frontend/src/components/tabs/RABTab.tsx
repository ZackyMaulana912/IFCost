import { useState } from 'react'
import type { AnalysisResponse, HargaSatuan, RABItem } from '../../types/ifc'
import { calculateRAB, totalRAB, DEFAULT_HARGA } from '../../utils/rab'
import { formatRp, formatRpShort } from '../../utils/format'

interface RABTabProps {
  data: AnalysisResponse | null
}

function HargaInput({
  label,
  field,
  value,
  onChange,
}: {
  label: string
  field: keyof HargaSatuan
  value: number
  onChange: (field: keyof HargaSatuan, val: number) => void
}) {
  const [raw, setRaw] = useState(value.toLocaleString('id-ID'))

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/[^\d]/g, '')
    setRaw(Number(v).toLocaleString('id-ID'))
    onChange(field, Number(v))
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>{label}</label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--surface)',
          transition: 'border-color 0.15s',
        }}
        onFocusCapture={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue)'
        }}
        onBlurCapture={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        }}
      >
        <span
          style={{
            padding: '8px 10px',
            fontSize: 13,
            color: 'var(--text-2)',
            background: 'var(--surface-2)',
            borderRight: '1px solid var(--border)',
            fontWeight: 500,
          }}
        >
          Rp
        </span>
        <input
          type="text"
          value={raw}
          onChange={handleChange}
          style={{
            flex: 1,
            padding: '8px 10px',
            fontSize: 14,
            color: 'var(--text)',
            border: 'none',
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
            background: 'transparent',
          }}
        />
      </div>
    </div>
  )
}

function RABRow({ item, depth = 0 }: { item: RABItem; depth?: number }) {
  return (
    <>
      <tr style={{ background: depth === 0 ? 'var(--surface)' : 'var(--surface-2)' }}>
        <td
          style={{
            padding: '10px 16px',
            paddingLeft: depth > 0 ? 36 : 16,
            fontSize: 14,
            fontWeight: depth === 0 ? 600 : 400,
            color: 'var(--text)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {depth > 0 && (
            <span style={{ color: 'var(--text-2)', marginRight: 6 }}>↳</span>
          )}
          {item.pekerjaan}
        </td>
        <td style={{ padding: '10px 16px', fontSize: 14, color: 'var(--text)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
          {item.volume != null ? `${new Intl.NumberFormat('id-ID').format(item.volume)} ${item.satuan_volume}` : '—'}
        </td>
        <td style={{ padding: '10px 16px', fontSize: 14, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
          {item.material}
        </td>
        <td style={{ padding: '10px 16px', fontSize: 14, color: 'var(--text)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
          {item.kebutuhan}
        </td>
        <td style={{ padding: '10px 16px', fontSize: 14, color: 'var(--blue)', fontWeight: 500, borderBottom: '1px solid var(--border)', textAlign: 'right', whiteSpace: 'nowrap' }}>
          {formatRp(item.harga_satuan)}
        </td>
        <td style={{ padding: '10px 16px', fontSize: 14, fontWeight: depth === 0 ? 600 : 400, color: 'var(--text)', borderBottom: '1px solid var(--border)', textAlign: 'right', whiteSpace: 'nowrap' }}>
          {formatRp(item.subtotal)}
        </td>
      </tr>
      {item.sub_items?.map((sub, i) => (
        <RABRow
          key={i}
          item={{
            pekerjaan: sub.material,
            volume: null,
            satuan_volume: sub.satuan,
            material: sub.material,
            kebutuhan: sub.kebutuhan,
            harga_satuan: sub.harga_satuan,
            subtotal: sub.subtotal,
          }}
          depth={1}
        />
      ))}
    </>
  )
}

export default function RABTab({ data }: RABTabProps) {
  const [harga, setHarga] = useState<HargaSatuan>(DEFAULT_HARGA)
  const [rabItems, setRabItems] = useState<RABItem[]>(() =>
    data ? calculateRAB(data.totals, DEFAULT_HARGA) : []
  )

  function handleHargaChange(field: keyof HargaSatuan, val: number) {
    setHarga((prev) => ({ ...prev, [field]: val }))
  }

  function hitungUlang() {
    if (data) {
      setRabItems(calculateRAB(data.totals, harga))
    }
  }

  const total = totalRAB(rabItems)

  const hargaFields: { label: string; field: keyof HargaSatuan }[] = [
    { label: 'Batu Bata Merah (bh)', field: 'bata_merah' },
    { label: 'Semen Portland (zak 50kg)', field: 'semen_portland' },
    { label: 'Pasir Pasang (m³)', field: 'pasir' },
    { label: 'Beton Readymix K-250 (m³)', field: 'beton_k250' },
    { label: 'Beton Readymix K-300 (m³)', field: 'beton_k300' },
    { label: 'Besi Ulir D13 (kg)', field: 'besi_ulir' },
    { label: 'Besi Tulangan Polos (kg)', field: 'besi_polos' },
    { label: 'Bekisting (m²)', field: 'bekisting' },
    { label: 'Keramik Lantai (m²)', field: 'keramik' },
    { label: 'Cat Dinding (m²)', field: 'cat_dinding' },
  ]

  if (!data) {
    return (
      <div style={{ padding: 24, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-2)' }}>
          <span className="material-icons-round" style={{ fontSize: 48, display: 'block', marginBottom: 12, opacity: 0.3 }}>
            payments
          </span>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Belum ada data RAB</div>
          <div style={{ fontSize: 14 }}>Unggah file IFC untuk menghitung estimasi biaya</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Main content */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
              Estimasi Biaya (RAB)
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
              Rincian biaya berdasarkan volume dan material.
            </p>
          </div>
          <button className="btn-ghost">
            <span className="material-icons-round" style={{ fontSize: 16 }}>download</span>
            Ekspor Excel
          </button>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface)' }}>
                  {['Pekerjaan', 'Volume', 'Material', 'Kebutuhan', 'Harga Satuan', 'Subtotal'].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 16px',
                        textAlign: i >= 4 ? 'right' : 'left',
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--text-2)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid var(--border)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rabItems.map((item, i) => (
                  <RABRow key={i} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total footer */}
        <div
          style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: '#15803D' }}>
            Estimasi Total Keseluruhan
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#22C55E' }}>
            {formatRpShort(total)}
          </div>
        </div>
      </div>

      {/* Right panel — Harga Satuan */}
      <div
        style={{
          width: 280,
          borderLeft: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: 20,
          overflowY: 'auto',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="material-icons-round" style={{ fontSize: 18, color: 'var(--text-2)' }}>receipt_long</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Harga Satuan (Data Master)</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>
          Sesuaikan harga dasar untuk menghitung ulang RAB.
        </p>

        {hargaFields.map((f) => (
          <HargaInput
            key={f.field}
            label={f.label}
            field={f.field}
            value={harga[f.field]}
            onChange={handleHargaChange}
          />
        ))}

        <button
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          onClick={hitungUlang}
        >
          <span className="material-icons-round" style={{ fontSize: 16 }}>refresh</span>
          Hitung Ulang RAB
        </button>
      </div>
    </div>
  )
}
