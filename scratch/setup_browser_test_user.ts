import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const email = 'browser-test@tekua.com';
const password = 'TestPassword123!';

async function setupTestUser() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log(`Setting up test user: ${email}`);

  // Create user
  const { data: userData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Browser Test User' }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('User already exists, updating password...');
      // Get user ID
      const { data: listData } = await supabase.auth.admin.listUsers();
      const user = listData?.users.find(u => u.email === email);
      if (user) {
        await supabase.auth.admin.updateUserById(user.id, { password });
      }
    } else {
      console.error('Error creating user:', authError);
      return;
    }
  } else {
      const userId = userData.user.id;
      // Ensure profile exists
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: 'Browser Test User',
        role: 'admin'
      });
      console.log('User created successfully');
  }
}

setupTestUser();
