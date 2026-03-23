export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
})

const shortDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
})

const fullDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const monthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'short',
  year: 'numeric',
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function formatShortDate(value: string) {
  return shortDateFormatter.format(new Date(`${value}T00:00:00`))
}

export function formatFullDate(value: string) {
  return fullDateFormatter.format(new Date(`${value}T00:00:00`))
}

export function formatMonthLabel(value: string) {
  return monthFormatter.format(new Date(`${value}-01T00:00:00`))
}
