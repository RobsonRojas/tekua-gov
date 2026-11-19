import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import RegisterWork from './RegisterWork';
import { apiClient } from '../lib/api';

vi.mock('../lib/api', () => ({ apiClient: { invoke: vi.fn() } }));
vi.mock('../utils/activityLogger', () => ({ logActivity: vi.fn() }));
vi.mock('../context/useAuth', () => ({ useAuth: () => mockAuth }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) =>
      opts && typeof opts === 'object' && !Array.isArray(opts)
        ? `${key}|${Object.values(opts).join(',')}`
        : key,
    i18n: { language: 'pt' },
  }),
}));

let mockAuth: any;
const invoke = apiClient.invoke as unknown as ReturnType<typeof vi.fn>;

const MEMBERS = [
  { id: 'me', full_name: 'Eu Mesmo' },
  { id: 'other', full_name: 'Outra Pessoa' },
];

const setup = (profile: any, available = 100) => {
  mockAuth = { user: { id: 'me' }, profile };
  invoke.mockImplementation(async (_d: string, action: string) => {
    if (action === 'fetchUsers') return { data: MEMBERS, error: null };
    if (action === 'getAvailableBalance') return { data: { available_balance: available }, error: null };
    return { data: [], error: null };
  });
  return render(
    <BrowserRouter>
      <ThemeProvider theme={createTheme()}>
        <RegisterWork />
      </ThemeProvider>
    </BrowserRouter>
  );
};

const chooseMemberBeneficiary = async () => {
  fireEvent.mouseDown(screen.getByLabelText('work.beneficiary'));
  fireEvent.click(await screen.findByRole('option', { name: 'work.otherMember' }));
  const input = await waitFor(() => {
    const boxes = screen.getAllByRole('combobox').filter((el) => el.tagName === 'INPUT' && el.getAttribute('aria-autocomplete') === 'list');
    expect(boxes.length).toBeGreaterThan(0);
    return boxes[0];
  });
  fireEvent.mouseDown(input);
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  return screen.findAllByRole('option');
};

describe('RegisterWork - beneficiário membro', () => {
  beforeEach(() => vi.clearAllMocks());

  it('membro comum só pode indicar a si mesmo', async () => {
    setup({ role: 'member' });
    const options = await chooseMemberBeneficiary();
    expect(options.map((o) => o.textContent)).toEqual(['Eu Mesmo']);
  });

  it('administrador pode indicar outro membro', async () => {
    setup({ role: 'admin' });
    const options = await chooseMemberBeneficiary();
    expect(options.map((o) => o.textContent)).toEqual(['Eu Mesmo', 'Outra Pessoa']);
  });

  it('membro do conselho pode indicar outro membro', async () => {
    setup({ role: 'member', roles: ['transversal_council'] });
    const options = await chooseMemberBeneficiary();
    expect(options.map((o) => o.textContent)).toContain('Outra Pessoa');
  });

  it('bloqueia o envio quando o beneficiário não tem saldo disponível', async () => {
    setup({ role: 'admin' }, 10);
    const options = await chooseMemberBeneficiary();
    fireEvent.click(within(document.body).getByRole('option', { name: 'Outra Pessoa' }));
    fireEvent.change(screen.getByLabelText(/work.suggested/), { target: { value: '50' } });

    const alert = await screen.findByTestId('beneficiary-balance-alert');
    await waitFor(() => expect(alert).toHaveTextContent('work.insufficientBeneficiaryBalance|10,50'));
    expect(screen.getByRole('button', { name: /work.registerSubmit/ })).toBeDisabled();
    expect(options.length).toBeGreaterThan(0);
  });

  it('libera o envio quando o saldo disponível cobre o valor', async () => {
    setup({ role: 'admin' }, 100);
    await chooseMemberBeneficiary();
    fireEvent.click(screen.getByRole('option', { name: 'Outra Pessoa' }));
    fireEvent.change(screen.getByLabelText(/work.suggested/), { target: { value: '50' } });

    await waitFor(() => expect(screen.getByTestId('beneficiary-balance-alert')).toHaveTextContent('work.beneficiaryAvailable|100'));
    expect(screen.getByRole('button', { name: /work.registerSubmit/ })).not.toBeDisabled();
  });
});
