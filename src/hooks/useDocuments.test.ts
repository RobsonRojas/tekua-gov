import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDocuments } from './useDocuments';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

const mockFrom = {
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
};

const mockStorageFrom = {
  upload: vi.fn(),
  remove: vi.fn(),
  createSignedUrl: vi.fn(),
};

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockFrom),
    storage: {
      from: vi.fn(() => mockStorageFrom),
    }
  },
}));

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('useDocuments Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-admin-123' },
    } as any);
  });

  it('fetches documents successfully', async () => {
    const mockDocs = [{ id: '1', title: { pt: 'Doc 1' } }];
    vi.mocked(mockFrom.order).mockResolvedValue({ data: mockDocs, error: null } as any);

    const { result } = renderHook(() => useDocuments());

    await act(async () => {
      await result.current.fetchDocuments();
    });

    expect(result.current.documents).toEqual(mockDocs);
    expect(result.current.error).toBeNull();
  });

  it('uploads document and saves metadata', async () => {
    vi.mocked(mockStorageFrom.upload).mockResolvedValue({ error: null } as any);
    vi.mocked(mockFrom.insert).mockResolvedValue({ error: null } as any);
    vi.mocked(mockFrom.order).mockResolvedValue({ data: [], error: null } as any);

    const { result } = renderHook(() => useDocuments());

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const metadata = {
      title: { pt: 'Teste', en: 'Test' },
      description: { pt: 'Desc', en: 'Desc' },
      category: 'estatuto'
    };

    let success;
    await act(async () => {
      success = await result.current.uploadDocument(file, metadata);
    });

    expect(success).toBe(true);
    expect(supabase.storage.from).toHaveBeenCalledWith('official-docs');
    expect(supabase.from).toHaveBeenCalledWith('documents');
  });

  it('deletes document from DB and storage', async () => {
    vi.mocked(mockFrom.eq).mockResolvedValue({ error: null } as any);
    vi.mocked(mockStorageFrom.remove).mockResolvedValue({ error: null } as any);
    vi.mocked(mockFrom.order).mockResolvedValue({ data: [], error: null } as any);

    const { result } = renderHook(() => useDocuments());

    let success;
    await act(async () => {
      success = await result.current.deleteDocument('doc-1', 'estatuto/test.pdf');
    });

    expect(success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('documents');
    expect(supabase.storage.from).toHaveBeenCalledWith('official-docs');
    expect(mockStorageFrom.remove).toHaveBeenCalledWith(['estatuto/test.pdf']);
  });
});
