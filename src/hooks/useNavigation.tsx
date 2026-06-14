import { useMemo } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Wallet as WalletIcon,
  FileText as MuralIcon,
  Bot,
  Wrench,
  Gift
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export const useNavigation = () => {
  const { t } = useTranslation();

  const navItems = useMemo<NavItem[]>(() => [
    {
      path: '/',
      label: t('layout.dashboard'),
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: '/work-wall',
      label: t('work.mural'),
      icon: <MuralIcon size={20} />,
    },
    {
      path: '/wallet',
      label: t('wallet.title'),
      icon: <WalletIcon size={20} />,
    },
    {
      path: '/sharing',
      label: t('layout.sharing'),
      icon: <Wrench size={20} />,
    },
    {
      path: '/gifts',
      label: t('gifts.area') || 'Dádivas',
      icon: <Gift size={20} />,
    },
    {
      path: '/ai-agent',
      label: t('ai.nav'),
      icon: <Bot size={20} />,
    },
    {
      path: '/admin-panel',
      label: t('layout.admin'),
      icon: <Settings size={20} />,
      adminOnly: true,
    },
  ], [t]);

  return { navItems };
};
