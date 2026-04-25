import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  Avatar, 
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut,
  Wallet as WalletIcon,
  FileText as MuralIcon,
  History,
  Bot
} from 'lucide-react';
import { Link as RouterLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggleButton from '../components/ThemeToggleButton';
import NotificationCenter from '../components/NotificationCenter/NotificationCenter';
import OfflineBanner from '../components/OfflineBanner';

const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut, loading: authLoading } = useAuth();

  const navItems = [
    { label: t('layout.dashboard'), path: '/', icon: <LayoutDashboard size={20} /> },
    { label: t('wallet.title'), path: '/wallet', icon: <WalletIcon size={20} /> },
    { label: t('work.mural'), path: '/work-wall', icon: <MuralIcon size={20} /> },
    { label: t('ai.nav') || 'Assistente IA', path: '/ai-agent', icon: <Bot size={20} /> },
    { label: t('layout.profile'), path: '/profile', icon: <User size={20} /> },
    { label: t('admin.reports') || 'Relatórios', path: '/dashboard/reports', icon: <LayoutDashboard size={20} /> },
    { label: t('audit.title') || 'Auditoria', path: '/admin/activity', icon: <History size={20} />, adminOnly: true },
    { label: t('layout.admin'), path: '/admin-panel', icon: <Settings size={20} />, adminOnly: true },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (authLoading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <OfflineBanner />
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          background: (theme) => theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          color: 'text.primary'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h6"
                noWrap
                component={RouterLink}
                to="/"
                sx={{
                  mr: 4,
                  fontWeight: 800,
                  letterSpacing: '.1rem',
                  color: 'primary.main',
                  textDecoration: 'none',
                }}
              >
                TEKUA
              </Typography>

              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                {navItems.map((item) => (
                  (!item.adminOnly || profile?.role === 'admin') && (
                    <Button
                      key={item.path}
                      component={RouterLink}
                      to={item.path}
                      startIcon={item.icon}
                      sx={{
                        color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                        px: 2,
                        '&:hover': {
                          color: 'primary.main',
                          background: 'rgba(99, 102, 241, 0.08)',
                        }
                      }}
                    >
                      {item.label}
                    </Button>
                  )
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ThemeToggleButton />
              <LanguageSelector />
              <NotificationCenter />
              
              <Tooltip title={t('layout.profile')}>
                <IconButton 
                  onClick={() => navigate('/profile')} 
                  sx={{ p: 0.5, border: '2px solid transparent', '&:hover': { borderColor: 'primary.main' } }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                    {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || '?'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={handleLogout}
                startIcon={<LogOut size={16} />}
                sx={{ 
                  borderColor: (theme) => theme.palette.divider,
                  color: 'text.secondary',
                  '&:hover': { borderColor: 'error.main', color: 'error.main' },
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                {t('layout.logout')}
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 6 }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>

      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto', 
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          background: 'background.paper'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            {t('layout.footer', { year: new Date().getFullYear() })}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
