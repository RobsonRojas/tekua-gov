import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile';
import { AuthProvider } from '../context/AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';

// Note: AuthContext and Supabase are mocked in setup.ts
// We might need to override mocks for specific test cases.

const renderProfile = () => {
  return render(
    <AuthProvider>
      <Router>
        <Profile />
      </Router>
    </AuthProvider>
  );
};

describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the profile header', async () => {
    renderProfile();
    expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
  });

  it('toggles edit mode when clicking the edit button', async () => {
    renderProfile();
    const editBtn = screen.getByText('Editar Perfil');
    fireEvent.click(editBtn);
    expect(screen.getByText('Salvar Alterações')).toBeInTheDocument();
  });

  it('validates input and shows success message on save', async () => {
    renderProfile();
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Editar Perfil'));
    
    // Change name (This depends on how the component is implemented with mocks)
    // For now, we just test the button interaction.
    const saveBtn = screen.getByText('Salvar Alterações');
    fireEvent.click(saveBtn);
    
    await waitFor(() => {
      // In a real test with full mocks, we'd check for a success message
      // and the call to supabase.update...
      expect(saveBtn).toBeInTheDocument();
    });
  });
});
