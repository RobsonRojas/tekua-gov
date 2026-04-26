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

async function testFetch() {
  console.log('Testing fetchActivities query...')
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      requester:profiles!requester_id (id, full_name),
      worker:profiles!worker_id (id, full_name),
      confirmations:activity_confirmations (count),
      evidence:activity_evidence (evidence_url)
    `)
    .limit(1)
  
  if (error) {
    console.error('Fetch Error:', JSON.stringify(error, null, 2))
  } else {
    console.log('Fetch Success:', JSON.stringify(data, null, 2))
  }
}

testFetch()
