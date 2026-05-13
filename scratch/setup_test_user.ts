
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function setup() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const testEmail = 'browser-test@tekua.com';
  const testPassword = 'TestPassword123!';

  const { data: listData } = await supabase.auth.admin.listUsers();
  const user = listData?.users.find(u => u.email === testEmail);

  if (user) {
    console.log('User exists, updating password...');
    await supabase.auth.admin.updateUserById(user.id, { password: testPassword });
  } else {
    console.log('Creating user...');
    const { data: userData, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Browser Test User' }
    });
    if (error) throw error;
    
    await supabase.from('profiles').upsert({
      id: userData.user.id,
      full_name: 'Browser Test User',
      roles: ['admin']
    });
  }
  console.log('Test user ready: browser-test@tekua.com / TestPassword123!');
}

setup().catch(console.error);
