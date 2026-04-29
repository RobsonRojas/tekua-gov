import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Divider,
  Avatar,
  Typography
} from '@mui/material';
import { LogOut } from 'lucide-react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '../../hooks/useNavigation';
import { useAuth } from '../../context/useAuth';
import LanguageSelector from '../LanguageSelector';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { navItems } = useNavigation();
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 280 }
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            component="img" 
            src="/pwa-192x192.png" 
            sx={{ width: 48, height: 48, borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)' }} 
          />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>TEKUA</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
            {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || '?'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
              {profile?.full_name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }} noWrap>
              {profile?.email}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Divider />
      
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          (!item.adminOnly || profile?.role === 'admin') && (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={onClose}
                selected={location.pathname === item.path}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(99, 102, 241, 0.08)',
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
      
      <Divider />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <LogOut size={20} />
            </ListItemIcon>
            <ListItemText primary={t('layout.logout')} />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ p: 2, mt: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'center' }}>
        <LanguageSelector />
      </Box>
    </Drawer>
  );
};

export default MobileDrawer;
