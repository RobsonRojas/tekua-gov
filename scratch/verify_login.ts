import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const email = 'browser-test@tekua.com';
const password = 'TestPassword123!';

async function verifyLogin() {
  const supabase = createClient(SUPABASE_URL!, ANON_KEY!);
  
  console.log(`Verifying login for: ${email}`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Login failed:', error.message);
  } else {
    console.log('Login successful!', data.user?.id);
    
    // Try to fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user?.id)
      .single();
    
    if (profileError) {
      console.error('Profile fetch failed:', profileError.message);
    } else {
      console.log('Profile fetch successful!', profile);
    }
  }
}

verifyLogin();
