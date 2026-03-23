#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const DATABASE_NAME = 'costtracker-db'
const TARGETS = new Set(['local', 'production', 'staging'])

const target = process.argv[2] ?? 'production'
const dryRun = process.argv.includes('--dry-run')

if (!TARGETS.has(target)) {
  console.error(
    `Unsupported target "${target}". Use one of: ${Array.from(TARGETS).join(', ')}`,
  )
  process.exit(1)
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const outputDir = resolve(process.cwd(), 'backups', target)
const outputPath = resolve(outputDir, `${timestamp}.sql`)

mkdirSync(outputDir, { recursive: true })

const modeArgs = target === 'local' ? ['--local'] : ['--remote']
const envArgs =
  target === 'staging' ? ['--env', 'staging'] : []
const command = [
  'pnpm',
  'exec',
  'wrangler',
  'd1',
  'export',
  DATABASE_NAME,
  ...modeArgs,
  '--output',
  outputPath,
  ...envArgs,
]

console.log(command.join(' '))

if (!dryRun) {
  execFileSync(command[0], command.slice(1), {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
}

console.log(`Backup ready at ${outputPath}`)
