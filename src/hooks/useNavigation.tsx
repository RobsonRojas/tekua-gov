import { useMemo } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Wallet as WalletIcon,
  FileText as MuralIcon,
  History,
  Bot
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
      path: '/dashboard',
      label: t('layout.dashboard'),
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: '/tasks',
      label: t('work.mural'),
      icon: <MuralIcon size={20} />,
    },
    {
      path: '/wallet',
      label: t('wallet.title'),
      icon: <WalletIcon size={20} />,
    },
    {
      path: '/history',
      label: t('profile.activity'),
      icon: <History size={20} />,
    },
    {
      path: '/ia-assistant',
      label: t('ai.nav'),
      icon: <Bot size={20} />,
    },
    {
      path: '/admin',
      label: t('layout.admin'),
      icon: <Settings size={20} />,
      adminOnly: true,
    },
  ], [t]);

  return { navItems };
};
