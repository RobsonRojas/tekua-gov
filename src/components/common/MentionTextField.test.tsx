import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MentionTextField from './MentionTextField';
import { apiClient } from '../../lib/api';

vi.mock('../../lib/api', () => ({ apiClient: { invoke: vi.fn() } }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_k: string, d: string) => d, i18n: { language: 'pt' } }),
}));

const Harness = ({ onIds }: { onIds: (ids: string[]) => void }) => {
  const [value, setValue] = useState('');
  const [ids, setIds] = useState<string[]>([]);
  return (
    <MentionTextField
      value={value}
      onChange={setValue}
      mentionedUserIds={ids}
      onMentionedUserIdsChange={(n) => { setIds(n); onIds(n); }}
      placeholder="texto"
    />
  );
};

describe('MentionTextField', () => {
  beforeEach(() => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: [{ id: 'u1', full_name: 'Ana', email: 'a@x.com' }], error: null } as never);
  });

  it('busca membros ao digitar @ e insere o nome e o ID mencionado', async () => {
    const onIds = vi.fn();
    render(<Harness onIds={onIds} />);
    const input = screen.getByPlaceholderText('texto') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'Olá @An', selectionStart: 7 } });

    const option = await screen.findByText('Ana');
    expect(vi.mocked(apiClient.invoke)).toHaveBeenCalledWith('api-members', 'fetchUsers', { search: 'An', limit: 5 });
    fireEvent.click(option);

    await waitFor(() => expect(input.value).toBe('Olá @Ana '));
    expect(onIds).toHaveBeenCalledWith(['u1']);
  });
});
