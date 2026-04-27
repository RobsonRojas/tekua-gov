import React from 'react';
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// extends Vitest's expect method with methods from react-testing-library
afterEach(() => {
  cleanup();
});

// Mock Supabase or other global providers here if needed
vi.mock('@asamuzakjp/css-color', () => ({}));
vi.mock('@csstools/css-calc', () => ({}));
vi.mock('@mui/icons-material/NotificationsActive', () => ({
  default: () => null
}));

// Mock usePushNotifications
vi.mock('../hooks/usePushNotifications', () => ({
  usePushNotifications: () => ({
    permission: 'granted',
    subscribeUser: vi.fn(),
    isSubscribing: false,
    error: null,
  }),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'pt',
      changeLanguage: vi.fn(() => Promise.resolve()),
      dir: vi.fn(() => 'ltr'),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
  Trans: ({ children }: any) => children,
  I18nextProvider: ({ children }: any) => children,
  Translation: ({ children }: any) => children( (key: string) => key, { i18n: {} }, false),
}));

// Mock react-quill
vi.mock('react-quill', () => ({
  default: (props: any) => React.createElement('div', { 
    'data-testid': 'react-quill-mock',
    ...props 
  }),
}));

// Mock idb (IndexedDB)
vi.mock('idb', () => ({
  openDB: vi.fn(() => Promise.resolve({
    put: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(),
    delete: vi.fn(),
    objectStoreNames: { contains: vi.fn(() => true) },
  })),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const React = require('react');
  const IconMock = (name: string) => (props: any) => React.createElement('div', { 
    'data-testid': `icon-${name.toLowerCase()}`, 
    ...props 
  });

  return {
    Vote: IconMock('Vote'),
    FileText: IconMock('FileText'),
    ChevronRight: IconMock('ChevronRight'),
    ChevronLeft: IconMock('ChevronLeft'),
    Home: IconMock('Home'),
    Wallet: IconMock('Wallet'),
    ArrowUpRight: IconMock('ArrowUpRight'),
    ArrowDownLeft: IconMock('ArrowDownLeft'),
    ArrowRight: IconMock('ArrowRight'),
    History: IconMock('History'),
    Send: IconMock('Send'),
    RefreshCw: IconMock('RefreshCw'),
    Info: IconMock('Info'),
    User: IconMock('User'),
    Search: IconMock('Search'),
    Bell: IconMock('Bell'),
    Menu: IconMock('Menu'),
    X: IconMock('X'),
    Check: IconMock('Check'),
    Plus: IconMock('Plus'),
    Edit: IconMock('Edit'),
    Trash: IconMock('Trash'),
    LogOut: IconMock('LogOut'),
    Settings: IconMock('Settings'),
    Shield: IconMock('Shield'),
    Users: IconMock('Users'),
    LayoutDashboard: IconMock('LayoutDashboard'),
    Briefcase: IconMock('Briefcase'),
    Languages: IconMock('Languages'),
    ChevronDown: IconMock('ChevronDown'),
    Clock: IconMock('Clock'),
    Calendar: IconMock('Calendar'),
    MapPin: IconMock('MapPin'),
    Building: IconMock('Building'),
    FileCode: IconMock('FileCode'),
    Share2: IconMock('Share2'),
    MoreHorizontal: IconMock('MoreHorizontal'),
    Eye: IconMock('Eye'),
    EyeOff: IconMock('EyeOff'),
    Gavel: IconMock('Gavel'),
    LayoutPanelLeft: IconMock('LayoutPanelLeft'),
    Sparkles: IconMock('Sparkles'),
  };
});

// Global fetch mock
global.fetch = vi.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: {}, error: null }),
    text: () => Promise.resolve(''),
  } as Response)
);

// Mock useAuth hook
vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    session: null,
    profile: null,
    loading: false,
    signOut: vi.fn(() => Promise.resolve()),
    updateLanguage: vi.fn(() => Promise.resolve()),
    updateTheme: vi.fn(() => Promise.resolve()),
    acceptTerms: vi.fn(() => Promise.resolve()),
  })),
}));

// Mock apiClient
vi.mock('../lib/api', () => ({
  apiClient: {
    invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
  },
}));

// Mock IndexedDB
vi.mock('../lib/db', () => ({
  initDB: vi.fn(() => Promise.resolve({})),
  cacheData: vi.fn(() => Promise.resolve()),
  getCachedData: vi.fn(() => Promise.resolve(null)),
  enqueueAction: vi.fn(() => Promise.resolve('mock-uuid')),
  getPendingActions: vi.fn(() => Promise.resolve([])),
  removePendingAction: vi.fn(() => Promise.resolve()),
}));

vi.mock('@supabase/supabase-js', () => {
  const mockFrom = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    then: vi.fn((resolve) => resolve({ data: [], error: null })),
  }));

  const mockChannel = vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn().mockReturnThis(),
  }));

  return {
    createClient: vi.fn(() => ({
      auth: {
        getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signOut: vi.fn(() => Promise.resolve({ error: null })),
        signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: {}, session: {} }, error: null })),
        signUp: vi.fn(() => Promise.resolve({ data: { user: {}, session: {} }, error: null })),
        resetPasswordForEmail: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        updateUser: vi.fn(() => Promise.resolve({ data: { user: {} }, error: null })),
      },
      from: mockFrom,
      channel: mockChannel,
    })),
  };
});
