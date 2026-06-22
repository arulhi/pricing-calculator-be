/**
 * Seed script — creates the initial admin user in Supabase.
 *
 * Usage:
 *   npx ts-node scripts/seed.ts
 *
 * Prerequisites:
 *   - .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   - sql/schema.sql already run in Supabase SQL Editor
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found. Copy .env.example to .env and fill in your credentials.')
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
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env')
  process.exit(1)
}

async function seed() {
  const sb = createClient(supabaseUrl!, serviceRoleKey!)

  const adminEmail = 'admin@spf.io'
  const adminPassword = 'admin123'

  console.log(`Creating admin user: ${adminEmail} / ${adminPassword}`)

  const { data, error } = await sb.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
  })

  if (error) {
    if (error.message.includes('already')) {
      console.log('ℹ️  Admin user already exists.')
    } else {
      console.error('❌ Failed to create admin user:', error.message)
      process.exit(1)
    }
  } else {
    console.log(`✅ Admin user created: ${data.user.id}`)
  }

  // Also insert into admin_users table
  if (data?.user) {
    const { error: insertError } = await sb.from('admin_users').upsert(
      { id: data.user.id, email: adminEmail },
      { ignoreDuplicates: true },
    )

    if (insertError) {
      console.error('❌ Failed to insert into admin_users:', insertError.message)
    } else {
      console.log('✅ admin_users record created.')
    }
  }

  console.log('\n🎉 Seed complete! You can now log in at /admin/login with:')
  console.log('   Email:    admin@spf.io')
  console.log('   Password: admin123')
}

seed().catch(console.error)
