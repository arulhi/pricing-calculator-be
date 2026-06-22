import { randomUUID } from 'crypto'

interface TableRow {
  [key: string]: any
}

const tables: Record<string, TableRow[]> = {
  service_types: [
    { id: 'live-events', name: 'Live Events', description: 'Real-time captions, translations & streaming', rate: 150, unit: 'hour', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'content', name: 'Content Translation', description: 'Audio, video, slides & documents', rate: 100, unit: 'hour', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'conversations', name: 'Conversations', description: 'Multilingual meetings & discussions', rate: 75, unit: 'hour', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'multiple', name: 'Multiple Services', description: 'Combination of services for your needs', rate: 0, unit: 'hour', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  addons: [
    { id: 'text-to-speech', name: 'Text-to-Speech', description: 'AI voice output for translations', price: 50, unit: 'event', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'interpreter', name: 'Professional Interpreter', description: 'Human interpreter for live supervision', price: 200, unit: 'hour', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ai-customization', name: 'AI Customization', description: 'Train AI on your terminology & style', price: 500, unit: 'project', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'support', name: 'On-Call Support', description: 'Dedicated technician during your event', price: 150, unit: 'event', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'polls', name: 'Multilingual Polls', description: 'Interactive polls in multiple languages', price: 25, unit: 'event', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  submissions: [],
  contacts: [],
  admin_users: [],
}

interface AuthUser {
  id: string
  email: string
  password: string
  created_at: string
}

const authUsers: AuthUser[] = [
  { id: randomUUID(), email: 'admin@spf.io', password: 'adminspfio123', created_at: new Date().toISOString() },
]

function fakeToken(user: AuthUser): string {
  const payload = { sub: user.id, email: user.email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

function decodeFakeToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    if (payload.exp < Date.now()) return null
    return authUsers.find((u) => u.id === payload.sub) || null
  } catch {
    return null
  }
}

class MockQueryBuilder {
  private tableName: string
  private rows: TableRow[]
  private filters: Array<(row: TableRow) => boolean> = []
  private sortColumn: string | null = null
  private sortAscending = true
  private returnSingle = false
  private insertData: any = null
  private updateData: any = null
  private isDeleteOp = false
  private selectedColumns: string | null = null

  constructor(tableName: string) {
    this.tableName = tableName
    this.rows = tables[tableName] || []
  }

  select(columns?: string) {
    this.selectedColumns = columns || null
    return this
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.sortColumn = column
    this.sortAscending = opts?.ascending !== false
    return this
  }

  eq(column: string, value: any) {
    this.filters.push((row) => row[column] === value)
    return this
  }

  single() {
    this.returnSingle = true
    return this
  }

  insert(data: any) {
    const row = { ...data, created_at: new Date().toISOString() }
    const uuidTables = ['submissions', 'contacts', 'admin_users']
    if (uuidTables.includes(this.tableName) && !row.id) {
      row.id = randomUUID()
    }
    if (this.tableName === 'submissions' && !row.status) {
      row.status = 'PENDING'
    }
    tables[this.tableName].push(row)
    this.insertData = row
    return this
  }

  update(data: any) {
    this.updateData = data
    return this
  }

  delete() {
    this.isDeleteOp = true
    return this
  }

  private applyFilters(): TableRow[] {
    let result = [...this.rows]
    for (const filter of this.filters) {
      result = result.filter(filter)
    }
    return result
  }

  private applySort(rows: TableRow[]): TableRow[] {
    if (!this.sortColumn) return rows
    return [...rows].sort((a, b) => {
      const va = a[this.sortColumn!]
      const vb = b[this.sortColumn!]
      if (va == null) return 1
      if (vb == null) return -1
      const cmp = va < vb ? -1 : va > vb ? 1 : 0
      return this.sortAscending ? cmp : -cmp
    })
  }

  then(resolve: (value: { data: any; error: any }) => void) {
    if (this.isDeleteOp) {
      const matched = this.applyFilters()
      for (const row of matched) {
        const idx = tables[this.tableName].indexOf(row)
        if (idx !== -1) tables[this.tableName].splice(idx, 1)
      }
      resolve({ data: null, error: null })
      return
    }

    if (this.insertData) {
      resolve({ data: this.insertData, error: null })
      return
    }

    if (this.updateData) {
      const matched = this.applyFilters()
      for (const row of matched) {
        const idx = tables[this.tableName].indexOf(row)
        if (idx !== -1) {
          tables[this.tableName][idx] = { ...row, ...this.updateData }
        }
      }
      if (this.returnSingle) {
        resolve({ data: matched.length > 0 ? { ...matched[0], ...this.updateData } : null, error: matched.length > 0 ? null : { message: 'Not found' } })
      } else {
        resolve({ data: matched.map((r) => ({ ...r, ...this.updateData })), error: null })
      }
      return
    }

    let result = this.applyFilters()
    result = this.applySort(result)

    if (this.returnSingle) {
      resolve({ data: result.length > 0 ? { ...result[0] } : null, error: result.length > 0 ? null : { message: 'Not found' } })
    } else {
      resolve({ data: result.map((r) => ({ ...r })), error: null })
    }
  }
}

function createMockClient() {
  return {
    from: (table: string) => new MockQueryBuilder(table),
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const user = authUsers.find((u) => u.email === email && u.password === password)
        if (!user) {
          return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } }
        }
        return {
          data: {
            user: { id: user.id, email: user.email },
            session: { access_token: fakeToken(user) },
          },
          error: null,
        }
      },
      admin: {
        createUser: async ({ email, password }: { email: string; password: string }) => {
          if (authUsers.find((u) => u.email === email)) {
            return { data: { user: null }, error: { message: 'User already registered' } }
          }
          const user: AuthUser = { id: randomUUID(), email, password, created_at: new Date().toISOString() }
          authUsers.push(user)
          return { data: { user: { id: user.id, email: user.email } }, error: null }
        },
      },
      getUser: async (token: string) => {
        const user = decodeFakeToken(token)
        if (!user) {
          return { data: { user: null }, error: { message: 'Invalid token' } }
        }
        return { data: { user: { id: user.id, email: user.email } }, error: null }
      },
    },
  }
}

export { createMockClient }
export type MockClient = ReturnType<typeof createMockClient>
