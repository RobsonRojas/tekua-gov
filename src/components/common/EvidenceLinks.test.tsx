import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import EvidenceLinksInput from './EvidenceLinksInput';
import AttachmentList from './AttachmentList';
import type { Attachment } from './FileUploader';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_k: string, d?: string) => d ?? _k }),
}));

const Harness = ({ spy }: { spy?: (l: Attachment[]) => void }) => {
  const [v, setV] = useState<Attachment[]>([]);
  return <EvidenceLinksInput value={v} onChange={(l) => { setV(l); spy?.(l); }} />;
};

describe('EvidenceLinksInput', () => {
  it('adiciona um link https como anexo do tipo link', () => {
    const spy = vi.fn();
    render(<Harness spy={spy} />);
    fireEvent.change(screen.getByLabelText('Endereço do link'), { target: { value: 'https://chat.whatsapp.com/abc' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar link/ }));
    expect(spy).toHaveBeenCalledWith([expect.objectContaining({ file_url: 'https://chat.whatsapp.com/abc', file_type: 'link' })]);
    expect(screen.getByText('https://chat.whatsapp.com/abc')).toBeInTheDocument();
  });

  it('recusa protocolo não permitido e informa o motivo', () => {
    const spy = vi.fn();
    render(<Harness spy={spy} />);
    fireEvent.change(screen.getByLabelText('Endereço do link'), { target: { value: 'javascript:alert(1)' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar link/ }));
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByText(/http:\/\/ ou https:\/\//)).toBeInTheDocument();
  });

  it('remove um link adicionado', () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText('Endereço do link'), { target: { value: 'https://a.org' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar link/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover link' }));
    expect(screen.queryByText('https://a.org')).toBeNull();
  });
});

describe('AttachmentList com links', () => {
  const link = (url: string): Attachment => ({ file_url: url, file_name: url, file_type: 'link', file_size: 0 });

  it('mostra link como âncora em outra aba com rel seguro', () => {
    render(<AttachmentList attachments={[link('https://a.org/x')]} onView={vi.fn()} />);
    const a = screen.getByRole('link', { name: 'https://a.org/x' });
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('não cria link quando o protocolo é inválido', () => {
    render(<AttachmentList attachments={[link('javascript:alert(1)')]} />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('javascript:alert(1)')).toBeInTheDocument();
  });
});
