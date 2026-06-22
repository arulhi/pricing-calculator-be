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

  console.log(`Checking for existing admin user: ${adminEmail}`)

  // Check if user already exists — if so, delete (SQL-created users have wrong instance_id)
  const { data: listData } = await sb.auth.admin.listUsers()
  const existing = listData?.users?.find(u => u.email === adminEmail)

  if (existing) {
    console.log(`Existing admin found (${existing.id}). Deleting for clean re-creation...`)

    // Remove from public tables first
    await sb.from('admin_users').delete().eq('email', adminEmail)

    // Delete via admin API
    const { error: deleteError } = await sb.auth.admin.deleteUser(existing.id)
    if (deleteError) {
      console.error('Failed to delete existing user:', deleteError.message)
      process.exit(1)
    }
    console.log('Deleted existing user.')
  }

  // Create admin user via Admin API (sets correct instance_id)
  console.log('Creating admin user...')
  const { data, error } = await sb.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  })

  if (error) {
    console.error('Failed to create admin user:', error.message)
    process.exit(1)
  }

  const userId = data?.user?.id
  if (!userId) {
    console.error('User created but no ID returned.')
    process.exit(1)
  }

  console.log(`Admin user created: ${userId}`)

  // Insert into admin_users table
  const { error: insertError } = await sb.from('admin_users').insert({
    id: userId,
    email: adminEmail,
  })

  if (insertError) {
    console.error('Failed to insert into admin_users:', insertError.message)
  } else {
    console.log('admin_users record inserted.')
  }

  console.log('\nSeed complete! Login with:')
  console.log('   Email:    admin@spf.io')
  console.log('   Password: adminspfio123')
}

seed().catch(console.error)
