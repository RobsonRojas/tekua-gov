import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/useAuth';
import { apiClient } from '../lib/api';

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../lib/api', () => ({
  apiClient: { invoke: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
    i18n: { language: 'pt-BR' },
  }),
}));

// Import após os mocks: a página real é envolvida pelo ProtectedRoute, como no router.
import RestorativeCircleShare from './RestorativeCircleShare';

const renderRoute = () =>
  render(
    <MemoryRouter initialEntries={['/share/circle/tok-privado']}>
      <Routes>
        <Route path="/login" element={<div>Tela de login</div>} />
        <Route
          path="/share/circle/:token"
          element={
            <ProtectedRoute>
              <RestorativeCircleShare />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe('Acesso à convocação pelo link de compartilhamento (7.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sem sessão, redireciona para o login e não consulta a convocação', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, profile: null, loading: false } as never);

    renderRoute();

    expect(screen.getByText('Tela de login')).toBeInTheDocument();
    expect(apiClient.invoke).not.toHaveBeenCalled();
  });

  it('com sessão, consulta a convocação pelo token', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'member-1' },
      profile: { roles: [] },
      loading: false,
    } as never);
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: null, error: 'Restorative circle not found' } as never);

    renderRoute();

    expect(await screen.findByText('Convocação não encontrada.')).toBeInTheDocument();
    expect(apiClient.invoke).toHaveBeenCalledWith('api-governance', 'fetchRestorativeCircleByToken', { token: 'tok-privado' });
  });
});
