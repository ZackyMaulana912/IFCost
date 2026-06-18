export function formatRp(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNum(value: number | null | undefined, decimals = 2): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatInt(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('id-ID').format(Math.round(value))
}
