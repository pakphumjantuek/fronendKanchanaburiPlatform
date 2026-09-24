export function formatDate(
  dateStr?: string | null,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
  fallback = '-',
) {
  if (!dateStr) return fallback

  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return fallback

  try {
    return new Intl.DateTimeFormat('th-TH', options).format(date)
  } catch {
    return fallback
  }
}

 export function formatThaiDateShort(dateStr?: string) {
  if (!dateStr) return '-'
  const parts = dateStr.split('-')
  const yearStr = parts[0]
  const monthStr = parts[1]
  const dayStr = parts[2]
  if (parts.length === 3 && yearStr && monthStr && dayStr) {
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10) - 1
    const day = parseInt(dayStr, 10)
    const d = new Date(year, month, day)
    return d.toLocaleDateString('th-TH', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }
  return dateStr
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}
