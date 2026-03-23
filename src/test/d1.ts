import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { StatementSync } from 'node:sqlite'

const migrationSql = readFileSync(
  resolve(process.cwd(), 'drizzle/migrations/0000_tired_red_hulk.sql'),
  'utf8',
).replaceAll('--> statement-breakpoint', '\n')

type SqlRow = Record<string, unknown>

type D1Meta = {
  changes: number
  last_row_id: number
  served_by: string
  duration: number
  rows_read: number
  rows_written: number
  size_after: number
  changed_db: boolean
}

type D1RunResult = {
  success: true
  meta: D1Meta
}

type D1SelectResult = {
  success: true
  meta: D1Meta
  results: SqlRow[]
}

function toPlainRow(row: SqlRow) {
  return Object.fromEntries(Object.entries(row))
}

function createMeta(
  changes: number,
  lastRowId: number,
  rowsRead = 0,
  rowsWritten = changes,
): D1Meta {
  return {
    changes,
    last_row_id: lastRowId,
    served_by: 'test-d1',
    duration: 0,
    rows_read: rowsRead,
    rows_written: rowsWritten,
    size_after: 0,
    changed_db: changes > 0,
  }
}

class TestD1PreparedStatement {
  constructor(
    private sqlite: DatabaseSync,
    private sql: string,
    private params: unknown[] = [],
  ) {}

  bind(...params: unknown[]) {
    return new TestD1PreparedStatement(this.sqlite, this.sql, params)
  }

  async run(): Promise<D1RunResult> {
    const result = this.prepare().run(...this.params)

    return {
      success: true,
      meta: createMeta(
        result.changes,
        Number(result.lastInsertRowid),
      ),
    }
  }

  async all(): Promise<D1SelectResult> {
    const statement = this.prepare()
    const results = statement
      .all(...this.params)
      .map((row) => toPlainRow(row as SqlRow))

    return {
      success: true,
      meta: createMeta(0, 0, results.length, 0),
      results,
    }
  }

  async raw(): Promise<unknown[][]> {
    const statement = this.prepare()
    statement.setReturnArrays(true)
    return statement.all(...this.params) as unknown[][]
  }

  private prepare(): StatementSync {
    return this.sqlite.prepare(this.sql)
  }
}

export class TestD1Database {
  private sqlite = new DatabaseSync(':memory:')

  constructor() {
    this.sqlite.exec('PRAGMA foreign_keys = ON;')
    this.sqlite.exec(migrationSql)
  }

  prepare(sql: string) {
    return new TestD1PreparedStatement(this.sqlite, sql)
  }

  async batch(
    statements: Array<{ run: () => Promise<D1RunResult> }>,
  ): Promise<D1RunResult[]> {
    this.sqlite.exec('begin')

    try {
      const results: D1RunResult[] = []

      for (const statement of statements) {
        results.push(await statement.run())
      }

      this.sqlite.exec('commit')
      return results
    } catch (error) {
      this.sqlite.exec('rollback')
      throw error
    }
  }

  close() {
    this.sqlite.close()
  }
}
