import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import type { AnalysisResponse, WallQTO, SlabQTO, ColumnQTO, BeamQTO } from '../../types/ifc'
import { formatNum, formatInt } from '../../utils/format'

interface QTOTabProps {
  data: AnalysisResponse | null
}

interface AccordionSection {
  id: string
  title: string
  count: number
  color: string
  bgColor: string
  icon: string
  defaultOpen: boolean
  content: React.ReactNode
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | false }) {
  if (!direction)
    return <span className="material-icons-round" style={{ fontSize: 12, color: 'var(--border)' }}>unfold_more</span>
  return (
    <span className="material-icons-round" style={{ fontSize: 12, color: 'var(--blue)' }}>
      {direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
    </span>
  )
}

function DataTable<T>({ columns, data: rows, totalRow }: {
  columns: ColumnDef<T>[]
  data: T[]
  totalRow?: React.ReactNode
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{
                    padding: '10px 16px',
                    textAlign: header.column.columnDef.meta?.align === 'right' ? 'right' : 'left',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--text-2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--border)',
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    background: 'var(--surface)',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      justifyContent: header.column.columnDef.meta?.align === 'right' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <SortIcon direction={header.column.getIsSorted()} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, i) => (
            <tr
              key={row.id}
              style={{
                background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)',
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{
                    padding: '10px 16px',
                    textAlign: cell.column.columnDef.meta?.align === 'right' ? 'right' : 'left',
                    color: 'var(--text)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {totalRow && (
          <tfoot>
            <tr style={{ background: 'var(--surface)', borderTop: '2px solid var(--border)' }}>
              {totalRow}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

function Accordion({ section }: { section: AccordionSection }) {
  const [open, setOpen] = useState(section.defaultOpen)

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${section.color}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: section.bgColor,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span className="material-icons-round" style={{ fontSize: 18, color: section.color }}>
            {section.icon}
          </span>
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{section.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'JetBrains Mono, monospace' }}>
            {section.count} Elemen Ditemukan
          </div>
        </div>
        <span
          className="material-icons-round"
          style={{
            fontSize: 20,
            color: 'var(--text-2)',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s',
          }}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {section.content}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-2)' }}>
      <span className="material-icons-round" style={{ fontSize: 48, display: 'block', marginBottom: 12, opacity: 0.3 }}>
        list_alt
      </span>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Belum ada data QTO</div>
      <div style={{ fontSize: 14 }}>Unggah file IFC untuk melihat daftar kuantitas</div>
    </div>
  )
}

export default function QTOTab({ data }: QTOTabProps) {
  const wallColumns: ColumnDef<WallQTO>[] = [
    { header: 'Nama', accessorKey: 'Name', cell: (i) => i.getValue() || '—' },
    {
      header: 'Tipe',
      accessorKey: 'Type',
      cell: (i) => {
        const v = i.getValue() as string
        const isPartition = v?.toLowerCase().includes('partition')
        return v ? (
          <span className={isPartition ? 'badge-yellow' : 'badge-green'}>{v}</span>
        ) : '—'
      },
    },
    { header: 'Panjang (m)', accessorKey: 'Length', cell: (i) => formatNum(i.getValue() as number), meta: { align: 'right' } },
    { header: 'Tinggi (m)', accessorKey: 'Height', cell: (i) => formatNum(i.getValue() as number), meta: { align: 'right' } },
    { header: 'Luas Bersih (m²)', accessorKey: 'NetSideArea', cell: (i) => formatNum(i.getValue() as number), meta: { align: 'right' } },
    { header: 'Volume Bersih (m³)', accessorKey: 'NetVolume', cell: (i) => formatNum(i.getValue() as number), meta: { align: 'right' } },
  ]

  const slabColumns: ColumnDef<SlabQTO>[] = [
    { header: 'Nama', accessorKey: 'Name', cell: (i) => i.getValue() || '—' },
    { header: 'PredefinedType', accessorKey: 'PredefinedType', cell: (i) => i.getValue() || '—' },
    { header: 'Luas Bruto (m²)', accessorKey: 'GrossArea', cell: (i) => formatNum(i.getValue() as number), meta: { align: 'right' } },
    { header: 'Luas Bersih (m²)', accessorKey: 'NetArea', cell: (i) => formatNum(i.getValue() as number), meta: { align: 'right' } },
    { header: 'Volume (m³)', accessorKey: 'Volume', cell: (i) => formatNum(i.getValue() as number), meta: { align: 'right' } },
  ]

  const columnCols: ColumnDef<ColumnQTO>[] = [
    { header: 'Nama', accessorKey: 'Name', cell: (i) => i.getValue() || '—' },
    { header: 'Panjang (m)', accessorKey: 'Length', cell: (i) => formatNum(i.getValue() as number), meta: { align: 'right' } },
    { header: 'Luas Penampang (m²)', accessorKey: 'CrossSectionArea', cell: (i) => formatNum(i.getValue() as number), meta: { align: 'right' } },
    { header: 'Volume (m³)', accessorKey: 'Volume', cell: (i) => formatNum(i.getValue() as number), meta: { align: 'right' } },
  ]

  const beamCols: ColumnDef<BeamQTO>[] = [
    { header: 'Nama', accessorKey: 'Name', cell: (i) => i.getValue() || '—' },
    { header: 'Panjang (m)', accessorKey: 'Length', cell: (i) => formatNum(i.getValue() as number), meta: { align: 'right' } },
    { header: 'Luas Penampang (m²)', accessorKey: 'CrossSectionArea', cell: (i) => formatNum(i.getValue() as number), meta: { align: 'right' } },
    { header: 'Volume (m³)', accessorKey: 'Volume', cell: (i) => formatNum(i.getValue() as number), meta: { align: 'right' } },
  ]

  const walls = data?.qto.walls ?? []
  const slabs = data?.qto.slabs ?? []
  const columns = data?.qto.columns ?? []
  const beams = data?.qto.beams ?? []

  const totalWallVol = walls.reduce((s, w) => s + (w.NetVolume ?? 0), 0)
  const totalWallArea = walls.reduce((s, w) => s + (w.NetSideArea ?? 0), 0)
  const totalSlabArea = slabs.reduce((s, w) => s + (w.NetArea ?? 0), 0)
  const totalColVol = columns.reduce((s, w) => s + (w.Volume ?? 0), 0)
  const totalBeamVol = beams.reduce((s, w) => s + (w.Volume ?? 0), 0)

  const sections: AccordionSection[] = [
    {
      id: 'walls',
      title: 'Rangkaian Dinding',
      count: walls.length,
      color: '#22C55E',
      bgColor: '#DCFCE7',
      icon: 'wall',
      defaultOpen: true,
      content: (
        <DataTable
          columns={wallColumns}
          data={walls}
          totalRow={
            <>
              <td style={{ padding: '10px 16px', fontWeight: 600 }}>Total</td>
              <td style={{ padding: '10px 16px' }} />
              <td style={{ padding: '10px 16px' }} />
              <td style={{ padding: '10px 16px' }} />
              <td style={{ padding: '10px 16px', textAlign: 'right', color: '#22C55E', fontWeight: 600 }}>
                {formatNum(totalWallArea)}
              </td>
              <td style={{ padding: '10px 16px', textAlign: 'right', color: '#22C55E', fontWeight: 600 }}>
                {formatNum(totalWallVol)}
              </td>
            </>
          }
        />
      ),
    },
    {
      id: 'slabs',
      title: 'Lantai Beton',
      count: slabs.length,
      color: '#F59E0B',
      bgColor: '#FEF9C3',
      icon: 'layers',
      defaultOpen: false,
      content: (
        <DataTable
          columns={slabColumns}
          data={slabs}
          totalRow={
            <>
              <td style={{ padding: '10px 16px', fontWeight: 600 }}>Total</td>
              <td style={{ padding: '10px 16px' }} />
              <td style={{ padding: '10px 16px', textAlign: 'right', color: '#F59E0B', fontWeight: 600 }}>
                {formatNum(slabs.reduce((s, w) => s + (w.GrossArea ?? 0), 0))}
              </td>
              <td style={{ padding: '10px 16px', textAlign: 'right', color: '#F59E0B', fontWeight: 600 }}>
                {formatNum(totalSlabArea)}
              </td>
              <td style={{ padding: '10px 16px', textAlign: 'right', color: '#F59E0B', fontWeight: 600 }}>
                {formatNum(slabs.reduce((s, w) => s + (w.Volume ?? 0), 0))}
              </td>
            </>
          }
        />
      ),
    },
    {
      id: 'columns',
      title: 'Kolom Struktur',
      count: columns.length,
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      icon: 'view_column',
      defaultOpen: false,
      content: (
        <DataTable
          columns={columnCols}
          data={columns}
          totalRow={
            <>
              <td style={{ padding: '10px 16px', fontWeight: 600 }}>Total</td>
              <td style={{ padding: '10px 16px' }} />
              <td style={{ padding: '10px 16px' }} />
              <td style={{ padding: '10px 16px', textAlign: 'right', color: '#3B82F6', fontWeight: 600 }}>
                {formatNum(totalColVol)}
              </td>
            </>
          }
        />
      ),
    },
    {
      id: 'beams',
      title: 'Balok Struktur',
      count: beams.length,
      color: '#EF4444',
      bgColor: '#FEE2E2',
      icon: 'horizontal_rule',
      defaultOpen: false,
      content: (
        <DataTable
          columns={beamCols}
          data={beams}
          totalRow={
            <>
              <td style={{ padding: '10px 16px', fontWeight: 600 }}>Total</td>
              <td style={{ padding: '10px 16px' }} />
              <td style={{ padding: '10px 16px' }} />
              <td style={{ padding: '10px 16px', textAlign: 'right', color: '#EF4444', fontWeight: 600 }}>
                {formatNum(totalBeamVol)}
              </td>
            </>
          }
        />
      ),
    },
  ]

  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            Daftar Kuantitas (QTO)
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
            Ekstraksi material dan analisis volume terperinci.
          </p>
        </div>
        {data && (
          <button className="btn-ghost">
            <span className="material-icons-round" style={{ fontSize: 16 }}>download</span>
            Ekspor CSV
          </button>
        )}
      </div>

      {!data ? (
        <EmptyState />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map((section) => (
            <Accordion key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  )
}

// Type augmentation for TanStack Table meta
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'right' | 'center'
  }
}

const _formatInt = formatInt
void _formatInt
