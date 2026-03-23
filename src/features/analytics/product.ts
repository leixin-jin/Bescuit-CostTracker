export function cleanProductName(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

export function normalizeProductName(value: string) {
  return cleanProductName(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}
