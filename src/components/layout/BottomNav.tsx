import React from 'react';
import { 
  Paper, 
  BottomNavigation, 
  BottomNavigationAction, 
  useMediaQuery, 
  useTheme 
} from '@mui/material';
import { 
  Home, 
  LayoutDashboard, 
  User, 
  Bell
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BottomNav: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  if (!isMobile) return null;

  // Determine active value based on current path
  const getValue = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.includes('/work-wall')) return 1;
    if (path.includes('/notifications')) return 2;
    if (path.includes('/profile')) return 3;
    return 0;
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 2000,
        borderRadius: '20px 20px 0 0',
        overflow: 'hidden',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        bgcolor: 'background.paper',
        pb: 'env(safe-area-inset-bottom)'
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getValue()}
        onChange={(_, newValue) => {
          switch (newValue) {
            case 0: navigate('/'); break;
            case 1: navigate('/work-wall'); break;
            case 2: navigate('/notifications'); break;
            case 3: navigate('/profile'); break;
          }
        }}
        sx={{ 
          height: 70,
          bgcolor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            minWidth: 0,
            padding: '12px 0',
            '& .MuiBottomNavigationAction-label': {
              fontSize: { xs: '0.65rem', sm: '0.75rem' },
              mt: 0.5
            },
            '&.Mui-selected': {
              color: 'primary.main',
              '& .MuiSvgIcon-root, & svg': {
                transform: 'scale(1.1)',
                transition: 'transform 0.2s'
              }
            }
          }
        }}
      >
        <BottomNavigationAction 
          label={t('layout.dashboard')} 
          icon={<Home size={22} />} 
        />
        <BottomNavigationAction 
          label={t('work.mural')} 
          icon={<LayoutDashboard size={22} />} 
        />
        <BottomNavigationAction 
          label={t('layout.notifications')} 
          icon={<Bell size={22} />} 
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: { xs: '0.65rem', sm: '0.75rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '80px'
            }
          }}
        />
        <BottomNavigationAction 
          label={t('layout.profile')} 
          icon={<User size={22} />} 
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
