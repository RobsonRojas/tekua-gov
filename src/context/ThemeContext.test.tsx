import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ThemeContextProvider, useThemeContext } from './ThemeContext';
import { describe, it, expect, beforeEach } from 'vitest';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeContextProvider>{children}</ThemeContextProvider>
);

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with dark theme by default if no localStorage value', () => {
    const { result } = renderHook(() => useThemeContext(), { wrapper });
    expect(result.current.mode).toBe('dark');
  });

  it('initializes with light theme if set in localStorage', () => {
    localStorage.setItem('preferred_theme', 'light');
    const { result } = renderHook(() => useThemeContext(), { wrapper });
    expect(result.current.mode).toBe('light');
  });

  it('toggles theme correctly', () => {
    const { result } = renderHook(() => useThemeContext(), { wrapper });
    expect(result.current.mode).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.mode).toBe('light');
    expect(localStorage.getItem('preferred_theme')).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.mode).toBe('dark');
    expect(localStorage.getItem('preferred_theme')).toBe('dark');
  });

  it('sets specific theme mode', () => {
    const { result } = renderHook(() => useThemeContext(), { wrapper });
    
    act(() => {
      result.current.setThemeMode('light');
    });

    expect(result.current.mode).toBe('light');
    expect(localStorage.getItem('preferred_theme')).toBe('light');
  });
});
