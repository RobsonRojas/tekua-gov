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
  LogOut
} from 'lucide-react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut, loading: authLoading } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Profile', path: '/profile', icon: <User size={20} /> },
    { label: 'Admin', path: '/admin-panel', icon: <Settings size={20} />, adminOnly: true },
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0f172a' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Profile">
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
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'text.secondary',
                  '&:hover': { borderColor: 'error.main', color: 'error.main' }
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 6 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>

      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.5)'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Tekua Associação. Todos os direitos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
