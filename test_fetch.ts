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
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testFetch() {
  console.log('Fetching profiles list...')
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
  
  if (pError) {
    console.error('Profiles Fetch Error:', pError)
  } else {
    console.log('Profiles:', JSON.stringify(profiles, null, 2))
  }

  console.log('Fetching storage buckets...')
  const { data: buckets, error: bError } = await supabase
    .from('storage.buckets')
    .select('*')
  if (bError) {
    console.error('Buckets Fetch Error:', bError)
  } else {
    console.log('Buckets:', JSON.stringify(buckets, null, 2))
  }

  console.log('Fetching storage policies...')
  // We can query pg_policies using an RPC if exec_sql exists, let's try querying pg_policies
  // Since we have service_role, we might not have a direct table view for pg_policies unless we run raw SQL.
  // Let's run a select on storage.objects to see if there are any objects
  const { data: objects, error: oError } = await supabase
    .from('storage.objects')
    .select('*')
    .limit(5)
  if (oError) {
    console.error('Storage Objects Fetch Error:', oError)
  } else {
    console.log('Storage Objects:', JSON.stringify(objects, null, 2))
  }
}

testFetch()
