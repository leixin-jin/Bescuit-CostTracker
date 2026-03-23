#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const TARGETS = new Set(['production', 'staging'])
const DATABASE_NAME = 'costtracker-db'

const target = process.argv[2] ?? 'production'
const dryRun = process.argv.includes('--dry-run')

if (!TARGETS.has(target)) {
  console.error(
    `Unsupported target "${target}". Use one of: ${Array.from(TARGETS).join(', ')}`,
  )
  process.exit(1)
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupDir = resolve(process.cwd(), 'backups', target)
const backupPath = resolve(backupDir, `${timestamp}.sql`)

mkdirSync(backupDir, { recursive: true })

const envArgs = target === 'production' ? [] : ['--env', target]
const steps = [
  ['Verify Wrangler auth', ['pnpm', 'exec', 'wrangler', 'whoami']],
  ['Build application', ['pnpm', 'run', 'build']],
  [
    'Export remote D1 backup',
    [
      'pnpm',
      'exec',
      'wrangler',
      'd1',
      'export',
      DATABASE_NAME,
      '--remote',
      '--output',
      backupPath,
      ...envArgs,
    ],
  ],
  [
    'Apply remote migrations',
    [
      'pnpm',
      'exec',
      'wrangler',
      'd1',
      'migrations',
      'apply',
      DATABASE_NAME,
      '--remote',
      ...envArgs,
    ],
  ],
  [
    'Deploy worker',
    [
      'pnpm',
      'exec',
      'wrangler',
      'deploy',
      '--keep-vars',
      '--message',
      `release ${target} ${timestamp}`,
      ...envArgs,
    ],
  ],
]

for (const [label, command] of steps) {
  console.log(`\n# ${label}`)
  console.log(command.join(' '))

  if (dryRun) {
    continue
  }

  execFileSync(command[0], command.slice(1), {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
}

console.log(`\nRelease plan completed for ${target}. Backup file: ${backupPath}`)
