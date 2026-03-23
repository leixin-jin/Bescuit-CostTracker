#!/usr/bin/env node

const baseArg = process.argv.find((value) => value.startsWith('--base-url='))
const invoiceArg = process.argv.find((value) =>
  value.startsWith('--invoice-id='),
)

if (!baseArg) {
  console.error(
    'Usage: node scripts/smoke-release.mjs --base-url=https://example.com [--invoice-id=inv_123]',
  )
  process.exit(1)
}

const baseUrl = new URL(baseArg.replace('--base-url=', ''))
const invoiceId = invoiceArg?.replace('--invoice-id=', '') ?? ''

const routes = [
  '/',
  '/upload',
  '/invoices',
  '/analytics',
  '/compare',
  '/suppliers',
  '/manifest.json',
  '/offline.html',
  '/sw.js',
]

if (invoiceId) {
  routes.push(`/invoices/${invoiceId}`)
}

for (const route of routes) {
  const url = new URL(route, baseUrl)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Smoke check failed for ${url}: ${response.status}`)
  }

  console.log(`${response.status} ${url}`)
}

console.log('Smoke check completed.')
