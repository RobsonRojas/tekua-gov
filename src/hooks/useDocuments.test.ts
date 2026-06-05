import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDocuments } from './useDocuments';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';
import { apiClient } from '../lib/api';

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
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-admin-123' } } }),
    },
    storage: {
      from: vi.fn(() => mockStorageFrom),
    }
  },
}));

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../lib/api', () => ({
  apiClient: {
    invoke: vi.fn(),
  },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => {
      if (key === 'docs.errors.fileTooLarge') return 'O arquivo excede o limite de tamanho permitido (20MB).';
      if (key === 'docs.errors.permissionDenied') return 'Acesso negado. Você não tem permissão para gerenciar documentos.';
      if (key === 'docs.errors.uploadFailed') return 'Falha ao enviar o documento. Por favor, tente novamente.';
      if (key === 'docs.errors.deleteFailed') return 'Falha ao excluir o documento.';
      if (key === 'docs.errors.alreadyExists') return 'Já existe um arquivo com este nome.';
      return defaultValue;
    },
  }),
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
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: mockDocs, error: null } as any);

    const { result } = renderHook(() => useDocuments());

    await act(async () => {
      await result.current.fetchDocuments();
    });

    expect(result.current.documents).toEqual(mockDocs);
    expect(result.current.error).toBeNull();
  });

  it('uploads PDF document and saves metadata', async () => {
    vi.mocked(mockStorageFrom.upload).mockResolvedValue({ data: { path: 'estatuto/test.pdf' }, error: null } as any);
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: null, error: null } as any);

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
    expect(apiClient.invoke).toHaveBeenCalledWith('api-documents', 'registerDocument', expect.any(Object));
  });

  it('deletes document from DB and storage', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: { filePath: 'estatuto/test.pdf' }, error: null } as any);
    vi.mocked(mockStorageFrom.remove).mockResolvedValue({ error: null } as any);

    const { result } = renderHook(() => useDocuments());

    let success;
    await act(async () => {
      success = await result.current.deleteDocument('doc-1', 'estatuto/test.pdf');
    });

    expect(success).toBe(true);
    expect(apiClient.invoke).toHaveBeenCalledWith('api-documents', 'deleteDocument', { id: 'doc-1' });
    expect(supabase.storage.from).toHaveBeenCalledWith('official-docs');
    expect(mockStorageFrom.remove).toHaveBeenCalledWith(['estatuto/test.pdf']);
  });

  it('handles and maps file size limit exceeded error during upload', async () => {
    const sizeError = new Error('The object exceeded the maximum allowed size');
    vi.mocked(mockStorageFrom.upload).mockRejectedValue(sizeError);

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

    expect(success).toBe(false);
    expect(result.current.error).toBe('O arquivo excede o limite de tamanho permitido (20MB).');
  });

  it('handles and maps RLS policy violation error during upload', async () => {
    vi.mocked(mockStorageFrom.upload).mockResolvedValue({ data: { path: 'estatuto/test.pdf' }, error: null } as any);
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: null, error: 'new row violates row-level security policy for table "documents"' } as any);

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

    expect(success).toBe(false);
    expect(result.current.error).toBe('Acesso negado. Você não tem permissão para gerenciar documentos.');
  });

  it('handles and maps RLS policy violation error during deletion', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: null, error: 'new row violates row-level security policy' } as any);

    const { result } = renderHook(() => useDocuments());

    let success;
    await act(async () => {
      success = await result.current.deleteDocument('doc-1', 'estatuto/test.pdf');
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Acesso negado. Você não tem permissão para gerenciar documentos.');
  });
});
