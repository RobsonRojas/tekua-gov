import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GovernanceServices from './GovernanceServices';
import { BrowserRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('GovernanceServices Page', () => {
  it('renders all governance service cards', () => {
    render(
      <BrowserRouter>
        <GovernanceServices />
      </BrowserRouter>
    );

    expect(screen.getByText('voting.title')).toBeDefined();
    expect(screen.getByText('docs.docsTitle')).toBeDefined();
    expect(screen.getByText('audit.title')).toBeDefined();
    expect(screen.getByText('profile.activity')).toBeDefined();
  });

  it('renders breadcrumbs correctly', () => {
    render(
      <BrowserRouter>
        <GovernanceServices />
      </BrowserRouter>
    );

    expect(screen.getByText('layout.dashboard')).toBeDefined();
    expect(screen.getAllByText('home.cardGovTitle').length).toBeGreaterThan(0);
  });
});
