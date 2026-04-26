import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync('.env', 'utf8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length > 0) {
      env[key.trim()] = rest.join('=').trim()
    }
  }
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking activities table...')
  const { data: act, error: actErr } = await supabase.from('activities').select('*').limit(1)
  if (actErr) console.error(actErr)
  else console.log('Activities columns:', Object.keys(act[0] || {}))

  console.log('Checking activity_evidence table...')
  const { data: ev, error: evErr } = await supabase.from('activity_evidence').select('*').limit(1)
  if (evErr) console.error(evErr)
  else console.log('Activity evidence columns:', Object.keys(ev[0] || {}))
}

checkSchema()
