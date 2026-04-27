import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box 
} from '@mui/material';
import { Menu } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import { MOBILE_HEADER_HEIGHT } from '../../theme';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        height: MOBILE_HEADER_HEIGHT,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        background: (theme) => theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              fontWeight: 800,
              letterSpacing: '.1rem',
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            TEKUA
          </Typography>
        </Box>
        
        <NotificationCenter />
      </Toolbar>
    </AppBar>
  );
};

export default MobileHeader;
