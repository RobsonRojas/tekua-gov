import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  CircularProgress,
  useMediaQuery,
  useTheme,
  Typography,
  Button
} from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import Sidebar from '../components/Navigation/Sidebar';
import MobileHeader from '../components/Navigation/MobileHeader';
import MobileDrawer from '../components/Navigation/MobileDrawer';
import BottomNav from '../components/layout/BottomNav';
import OfflineBanner from '../components/OfflineBanner';
import { MOBILE_HEADER_HEIGHT } from '../theme';

const PublicHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 4 },
        backdropFilter: 'blur(12px)',
        bgcolor: 'rgba(15, 23, 42, 0.6)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box 
          component="img" 
          src="/pwa-192x192.png" 
          sx={{ width: 40, height: 40, borderRadius: '10px' }} 
        />
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 800, 
            color: 'primary.main', 
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          Tekuá
        </Typography>
      </Box>
      <Button 
        variant="contained" 
        onClick={() => navigate('/login')}
        sx={{ 
          borderRadius: '10px', 
          fontWeight: 700, 
          px: 3, 
          py: 1,
          textTransform: 'none',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
        }}
      >
        Entrar / Sign In
      </Button>
    </Box>
  );
};

const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { profile, loading: authLoading } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileDrawer = () => setMobileDrawerOpen(!mobileDrawerOpen);

  if (authLoading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', width: '100%', overflowX: 'hidden' }}>
      <OfflineBanner />
      
      {!profile && <PublicHeader />}

      {profile && !isMobile && (
        <Sidebar 
          open={sidebarOpen} 
          onToggle={toggleSidebar} 
        />
      )}

      {profile && isMobile && (
        <>
          <MobileHeader onMenuClick={toggleMobileDrawer} />
          <MobileDrawer 
            open={mobileDrawerOpen} 
            onClose={() => setMobileDrawerOpen(false)} 
          />
        </>
      )}

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          minWidth: 0,
          display: 'flex', 
          flexDirection: 'column',
          minHeight: '100vh',
          pt: !profile ? '80px' : (isMobile ? `${MOBILE_HEADER_HEIGHT}px` : 0),
          pb: profile && isMobile ? '70px' : 0, // Padding for BottomNav
          overflowX: 'hidden',
          transition: (theme) => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Container 
          maxWidth={false} 
          disableGutters
          sx={{ 
            py: isMobile ? 1.5 : 4,
            px: { xs: 0, sm: 2, md: 3 },
            flexGrow: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Outlet />
        </Container>

        <Box 
          component="footer" 
          sx={{ 
            py: 3, 
            px: 2, 
            mt: 'auto', 
            mb: profile && isMobile ? 2 : 0,
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
      <BottomNav />
    </Box>
  );
};

export default MainLayout;
