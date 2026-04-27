import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Box, 
  Divider,
  Tooltip,
  Avatar,
  Typography
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  Moon,
  Sun,
  Languages
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/useAuth';
import { useThemeContext } from '../../context/ThemeContext';
import { useNavigation } from '../../hooks/useNavigation';
import LanguageSelector from '../LanguageSelector';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../theme';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { profile, signOut } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const { navItems } = useNavigation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || profile?.role === 'admin'
  );

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          bgcolor: 'background.paper',
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        },
      }}
    >
      <Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: open ? 'space-between' : 'center', 
          px: 2, 
          py: 2,
          minHeight: 64
        }}>
          {open && (
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
              TEKUA
            </Typography>
          )}
          <IconButton onClick={onToggle}>
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>

        <Divider />

        <List sx={{ px: 1, py: 2 }}>
          {filteredNavItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <Tooltip title={!open ? item.label : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      }
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: location.pathname === item.path ? 'inherit' : 'text.secondary'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={item.label} sx={{ opacity: open ? 1 : 0 }} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ pb: 2 }}>
        <Divider />
        
        <List sx={{ px: 1, py: 1 }}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={() => navigate('/profile')}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 1.5,
                borderRadius: 2
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center' }}>
                <Avatar 
                  sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: 'secondary.main' }}
                >
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary={t('layout.profile')} 
                  secondary={profile?.role === 'admin' ? 'Admin' : ''}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              )}
            </ListItemButton>
          </ListItem>

          <Box sx={{ display: 'flex', justifyContent: open ? 'space-around' : 'center', py: 1 }}>
            <Tooltip title={t(mode === 'dark' ? 'theme.switchToLight' : 'theme.switchToDark')}>
              <IconButton onClick={toggleTheme} size="small">
                {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </IconButton>
            </Tooltip>
            {open && (
              <LanguageSelector />
            )}
          </Box>

          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                borderRadius: 2,
                color: 'error.main'
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'error.main'
                }}
              >
                <LogOut size={20} />
              </ListItemIcon>
              {open && <ListItemText primary={t('layout.logout')} />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
