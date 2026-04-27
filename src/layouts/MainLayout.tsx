import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  CircularProgress,
  useMediaQuery,
  useTheme,
  Typography
} from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import Sidebar from '../components/Navigation/Sidebar';
import MobileHeader from '../components/Navigation/MobileHeader';
import MobileDrawer from '../components/Navigation/MobileDrawer';
import OfflineBanner from '../components/OfflineBanner';
import { MOBILE_HEADER_HEIGHT } from '../theme';

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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <OfflineBanner />
      
      {!isMobile && (
        <Sidebar 
          open={sidebarOpen} 
          onToggle={toggleSidebar} 
        />
      )}

      {isMobile && (
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
          display: 'flex', 
          flexDirection: 'column',
          minHeight: '100vh',
          pt: isMobile ? `${MOBILE_HEADER_HEIGHT}px` : 0,
          transition: (theme) => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            py: 4,
            flexGrow: 1
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
    </Box>
  );
};

export default MainLayout;
