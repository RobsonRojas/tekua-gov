import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerSW } from 'virtual:pwa-register';

vi.mock('virtual:pwa-register', () => ({
  registerSW: vi.fn(),
}));

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
}));

describe('PWA Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register service worker with immediate: true', async () => {
    // Dynamically import main to trigger the side effects
    await import('./main');
    
    expect(registerSW).toHaveBeenCalledWith({ immediate: true });
  });
});
