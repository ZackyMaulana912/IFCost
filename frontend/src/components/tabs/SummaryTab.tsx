import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { AnalysisResponse } from '../../types/ifc'
import { calculateRAB, totalRAB, DEFAULT_HARGA } from '../../utils/rab'
import { formatNum, formatInt, formatRp } from '../../utils/format'
import MetricCard from '../ui/MetricCard'

interface SummaryTabProps {
  data: AnalysisResponse | null
}

const ELEMENT_COLORS: Record<string, string> = {
  Dinding: '#22C55E',
  Pintu: '#3B82F6',
  Lantai: '#D97706',
  Kolom: '#8B5CF6',
  Jendela: '#6B7280',
  Balok: '#EF4444',
  Lainnya: '#CBD5E1',
}

export default function SummaryTab({ data }: SummaryTabProps) {
  if (!data) {
    return (
      <div style={{ padding: 24, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-2)' }}>
          <span className="material-icons-round" style={{ fontSize: 48, display: 'block', marginBottom: 12, opacity: 0.3 }}>
            dashboard
          </span>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Belum ada data ringkasan</div>
          <div style={{ fontSize: 14 }}>Unggah file IFC untuk melihat ringkasan proyek</div>
        </div>
      </div>
    )
  }

  const { summary, totals, spaces } = data

  // Compute total elements
  const wallCount = (summary.IfcWall ?? 0) + (summary.IfcWallStandardCase ?? 0)
  const doorCount = summary.IfcDoor ?? 0
  const windowCount = summary.IfcWindow ?? 0
  const slabCount = summary.IfcSlab ?? 0
  const columnCount = summary.IfcColumn ?? 0
  const beamCount = summary.IfcBeam ?? 0
  const totalElements = wallCount + doorCount + windowCount + slabCount + columnCount + beamCount

  const pieData = [
    { name: 'Dinding', value: wallCount },
    { name: 'Pintu', value: doorCount },
    { name: 'Jendela', value: windowCount },
    { name: 'Lantai', value: slabCount },
    { name: 'Kolom', value: columnCount },
    { name: 'Balok', value: beamCount },
  ].filter((d) => d.value > 0)

  // Room area bar chart
  const roomData = spaces
    .filter((s) => s.FloorArea && s.FloorArea > 0)
    .sort((a, b) => (b.FloorArea ?? 0) - (a.FloorArea ?? 0))
    .slice(0, 6)
    .map((s) => ({
      name: s.RoomName.length > 14 ? s.RoomName.slice(0, 14) + '…' : s.RoomName,
      area: s.FloorArea ?? 0,
    }))

  // RAB estimate
  const rabItems = calculateRAB(totals, DEFAULT_HARGA)
  const totalEstimasi = totalRAB(rabItems)

  // Table rows
  const tableRows = [
    { tipe: 'Dinding', jumlah: wallCount, volume: totals.wall_volume, dot: '#22C55E' },
    { tipe: 'Pintu', jumlah: doorCount, volume: 0, dot: '#3B82F6' },
    { tipe: 'Lantai', jumlah: slabCount, volume: totals.slab_area * 0.12, dot: '#D97706' },
    { tipe: 'Kolom', jumlah: columnCount, volume: totals.column_volume, dot: '#8B5CF6' },
    { tipe: 'Jendela', jumlah: windowCount, volume: 0, dot: '#6B7280' },
    { tipe: 'Balok', jumlah: beamCount, volume: totals.beam_volume, dot: '#EF4444' },
  ].filter((r) => r.jumlah > 0)

  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          Ringkasan Proyek
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
          Gambaran umum entitas model dan akumulasi kuantitas.
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard
          label="Total Elemen"
          value={formatInt(totalElements)}
          icon="grid_view"
          iconColor="#3B82F6"
          iconBg="#DBEAFE"
        />
        <MetricCard
          label="Luas Lantai"
          value={`${formatInt(totals.floor_area)} m²`}
          icon="square_foot"
          iconColor="#22C55E"
          iconBg="#DCFCE7"
        />
        <MetricCard
          label="Volume Dinding"
          value={`${formatInt(totals.wall_volume)} m³`}
          icon="view_in_ar"
          iconColor="#D97706"
          iconBg="#FEF9C3"
        />
        <MetricCard
          label="Estimasi RAB"
          value={formatRp(totalEstimasi)}
          icon="account_balance_wallet"
          iconColor="#EF4444"
          iconBg="#FEE2E2"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Donut chart */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
            Distribusi Elemen
          </h2>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={ELEMENT_COLORS[entry.name] ?? '#CBD5E1'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} elemen`, '']}
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: 12, color: 'var(--text)' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -60%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>100%</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Entitas</div>
            </div>
          </div>
        </div>

        {/* Horizontal bar chart */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
            Luas Lantai per Ruangan
          </h2>
          {roomData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={roomData} layout="vertical" margin={{ left: 0, right: 40 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--text-2)' }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  formatter={(v) => [`${formatNum(Number(v))} m²`, 'Luas']}
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
                />
                <Bar dataKey="area" fill="#3B82F6" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, fill: 'var(--text-2)' }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-2)', fontSize: 13 }}>
              Tidak ada data ruangan
            </div>
          )}
        </div>
      </div>

      {/* Element summary table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Ringkasan Elemen</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Tipe', 'Jumlah', 'Volume', '% dari Total'].map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 16px',
                    textAlign: i >= 1 ? 'right' : 'left',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--text-2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => {
              const pct = totalElements > 0 ? ((row.jumlah / totalElements) * 100).toFixed(1) : '—'
              return (
                <tr key={row.tipe} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)' }}>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: row.dot,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 14, color: 'var(--text)' }}>{row.tipe}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 14, color: 'var(--text)', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                    {formatInt(row.jumlah)}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 14, color: 'var(--text)', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                    {row.volume > 0 ? `${formatNum(row.volume)} m³` : '—'}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 14, color: 'var(--text-2)', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                    {pct !== '—' ? `${pct}%` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
