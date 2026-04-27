import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { apiClient } from '../lib/api';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import i18n from 'i18next';
import React from 'react';

// Mocking apiClient
vi.mock('../lib/api', () => ({
  apiClient: {
    invoke: vi.fn().mockResolvedValue({ data: null, error: null })
  }
}));

// Mocking i18next
vi.mock('i18next', () => ({
  default: {
    changeLanguage: vi.fn(),
    language: 'en',
  }
}));

// Mock ThemeContext
vi.mock('./ThemeContext', () => ({
  useThemeContext: () => ({
    themeMode: 'light',
    setThemeMode: vi.fn(),
    toggleThemeMode: vi.fn()
  })
}));

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
    vi.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.signOut();
    });
    
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should update language and call i18n and supabase when user is logged in', async () => {
    // Setup mock user for updateLanguage
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { user: { id: 'test-user' } } as any },
      error: null
    });
    
    // Setup mock profile fetch
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'test-user', preferred_language: 'en' }, error: null })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // wait for initial load to finish
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateLanguage('pt');
    });

    expect(i18n.changeLanguage).toHaveBeenCalledWith('pt');
    expect(apiClient.invoke).toHaveBeenCalledWith('api-members', 'updateProfile', expect.objectContaining({
      updates: { preferred_language: 'pt' }
    }));
  });

  it('should handle acceptTerms', async () => {
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { user: { id: 'test-user' } } as any },
      error: null
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.acceptTerms();
    });

    expect(apiClient.invoke).toHaveBeenCalledWith('api-members', 'updateProfile', expect.objectContaining({
      updates: expect.objectContaining({ terms_version: '1.0' })
    }));
  });
});
