export function formatCurrency(amount: number, currency = "IDR"): string {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(amount)
}

export function formatRupiahInput(value: string): string {
  const digits = value.replace(/\D/g, "")
  if (!digits) return ""
  const number = Number(digits)
  return `Rp ${new Intl.NumberFormat("id-ID").format(number)}`
}

export function parseRupiahInput(value: string): number {
  const digits = value.replace(/\D/g, "")
  return digits ? Number.parseInt(digits, 10) : 0
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
