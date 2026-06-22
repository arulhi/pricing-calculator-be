import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) {
    console.error('.env file not found. Copy .env.example to .env and fill in your credentials.')
    process.exit(1)
  }

  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    process.env[key] = value
  }
}

loadEnv()

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env')
  process.exit(1)
}

async function seed() {
  const sb = createClient(supabaseUrl!, serviceRoleKey!)

  const adminEmail = 'admin@spf.io'
  const adminPassword = 'adminspfio123'

  console.log(`Creating admin user: ${adminEmail}`)

  let userId: string | null = null

  const { data, error } = await sb.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
  })

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      console.log('Admin user already exists in Auth. Looking up ID...')

      const { data: listData, error: listError } = await sb.auth.admin.listUsers()
      if (listError) {
        console.error('Failed to list users:', listError.message)
        process.exit(1)
      }

      const found = listData?.users?.find(u => u.email === adminEmail)
      if (found) {
        userId = found.id
        console.log(`Found existing admin: ${userId}`)
      } else {
        console.error(`User ${adminEmail} not found in Auth list.`)
        process.exit(1)
      }
    } else {
      console.error('Failed to create admin user:', error.message)
      process.exit(1)
    }
  } else {
    userId = data?.user?.id ?? null
    if (userId) {
      console.log(`Admin user created: ${userId}`)
    }
  }

  if (userId) {
    const { error: insertError } = await sb.from('admin_users').upsert(
      { id: userId, email: adminEmail },
      { ignoreDuplicates: true },
    )

    if (insertError) {
      console.error('Failed to insert into admin_users:', insertError.message)
    } else {
      console.log('admin_users record inserted.')
    }
  }

  console.log('\nSeed complete! Login with:')
  console.log('   Email:    admin@spf.io')
  console.log('   Password: adminspfio123')
}

seed().catch(console.error)
