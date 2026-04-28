import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRLS() {
  console.log('Testing RLS on ledger_entries...')
  
  // Try to read ledger_entries as anon
  const { data, error } = await supabase
    .from('ledger_entries')
    .select('*')
  
  if (error) {
    console.log('✅ Access denied for anonymous user (Expected):', error.message)
  } else {
    console.log('❌ Anonymous user could read ledger_entries! Data count:', data.length)
  }

  // Try to insert as anon
  const { error: insertError } = await supabase
    .from('ledger_entries')
    .insert({ wallet_id: '00000000-0000-0000-0000-000000000000', amount: 100, reference_type: 'test', reference_id: '00000000-0000-0000-0000-000000000000' })
  
  if (insertError) {
    console.log('✅ Insert denied for anonymous user (Expected):', insertError.message)
  } else {
    console.log('❌ Anonymous user could insert into ledger_entries!')
  }
}

testRLS()
