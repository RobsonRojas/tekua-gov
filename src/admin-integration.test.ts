import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

describe('Admin Management Integration (Admin SDK)', () => {
  const testEmail = `test-admin-${Date.now()}@tekua.com`;
  const testPassword = 'TestPassword123!';
  const testFullName = 'Integration Test Admin';
  let supabaseAdmin: any;
  let supabaseAnon: any;

  beforeAll(() => {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
      throw new Error('Missing environment variables for integration tests');
    }
    // Admin client for management
    supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Anon client for login verification
    supabaseAnon = createClient(SUPABASE_URL, ANON_KEY);
  });

  it('should create a new admin via Admin SDK', async () => {
    // 1. Create the user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: testFullName }
    });

    expect(authError).toBeNull();
    const userId = authData.user.id;
    expect(userId).toBeDefined();

    // 2. Ensure profile has admin role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: userId, 
        full_name: testFullName, 
        role: 'admin',
        updated_at: new Date().toISOString()
      });

    expect(profileError).toBeNull();

    // 3. Verify in database
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name')
      .eq('id', userId)
      .single();

    expect(error).toBeNull();
    expect(profile.role).toBe('admin');
    expect(profile.full_name).toBe(testFullName);
  });

  it('should allow login for the newly created admin', async () => {
    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    expect(loginError).toBeNull();
    expect(loginData.user).toBeDefined();
    expect(loginData.user.email).toBe(testEmail);
  });

  it('should update an existing admin password', async () => {
    const newPassword = 'NewTestPassword456!';
    
    // 1. Find user ID
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    expect(listError).toBeNull();
    
    if (!listData) throw new Error('listData is null');
    const user = listData.users.find((u: any) => u.email === testEmail);
    expect(user).toBeDefined();
    const userId = user!.id;

    // 2. Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
    expect(updateError).toBeNull();

    // 3. Verify login with NEW password works
    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: newPassword
    });

    expect(loginError).toBeNull();
    expect(loginData.user).toBeDefined();
  });
});
