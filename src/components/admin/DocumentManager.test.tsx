import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DocumentManager from './DocumentManager';
import { useDocuments } from '../../hooks/useDocuments';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue || key,
    i18n: { language: 'pt' }
  }),
}));

vi.mock('../../hooks/useDocuments', () => ({
  useDocuments: vi.fn(),
}));

describe('DocumentManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the manager title and description', () => {
    vi.mocked(useDocuments).mockReturnValue({
      documents: [],
      loading: false,
      error: null,
      uploadProgress: 0,
      fetchDocuments: vi.fn(),
      uploadDocument: vi.fn(),
      deleteDocument: vi.fn(),
      getDownloadUrl: vi.fn(),
    } as any);

    render(<DocumentManager />);
    expect(screen.getByText('Gerenciador de Documentos Oficiais')).toBeInTheDocument();
  });

  it('displays an error alert if error exists', () => {
    vi.mocked(useDocuments).mockReturnValue({
      documents: [],
      loading: false,
      error: 'Test error loading documents',
      uploadProgress: 0,
      fetchDocuments: vi.fn(),
      uploadDocument: vi.fn(),
      deleteDocument: vi.fn(),
      getDownloadUrl: vi.fn(),
    } as any);

    render(<DocumentManager />);
    expect(screen.getByText('Test error loading documents')).toBeInTheDocument();
  });

  it('calls fetchDocuments on mount', () => {
    const fetchMock = vi.fn();
    vi.mocked(useDocuments).mockReturnValue({
      documents: [],
      loading: false,
      error: null,
      uploadProgress: 0,
      fetchDocuments: fetchMock,
      uploadDocument: vi.fn(),
      deleteDocument: vi.fn(),
      getDownloadUrl: vi.fn(),
    } as any);

    render(<DocumentManager />);
    expect(fetchMock).toHaveBeenCalled();
  });
});
