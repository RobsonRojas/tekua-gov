import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// Mocking Supabase is already handled in src/test/setup.ts
// but we can add specific mocks here if needed.

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(true);
  });

  it('should handle sign out', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.signOut();
    });
    
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
