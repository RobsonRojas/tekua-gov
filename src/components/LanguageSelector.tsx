import React, { useState } from 'react';
import { 
  Button,
  Box, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Tooltip,
  Typography
} from '@mui/material';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { updateLanguage } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const languages = [
    { code: 'pt', label: 'Português', flag: '🇧🇷', short: 'PT' },
    { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
  ];

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: string) => {
    updateLanguage(lang);
    handleClose();
  };

  const currentLanguage = languages.find(l => l.code === i18n.language.split('-')[0]) || languages[0];

  return (
    <>
      <Tooltip title={t('theme.switchToDark') ? "Alterar Idioma" : "Change Language"}>
        <Button
          onClick={handleOpen}
          color="inherit"
          startIcon={<Languages size={18} />}
          endIcon={<ChevronDown size={14} style={{ opacity: 0.5 }} />}
          sx={{ 
            px: 2,
            py: 0.75,
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            '&:hover': { 
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'primary.main',
              '& .MuiButton-startIcon': { color: 'primary.main' }
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, ml: 0.5 }}>
            {currentLanguage.short}
          </Typography>
        </Button>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 8,
          sx: {
            backgroundColor: 'background.paper',
            borderRadius: '12px',
            minWidth: 150,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            mt: 1,
          }
        }}
      >
        {languages.map((lang) => (
          <MenuItem 
            key={lang.code} 
            onClick={() => handleLanguageChange(lang.code)}
            selected={currentLanguage.code === lang.code}
          >
            <ListItemIcon sx={{ fontSize: '1.2rem' }}>
              {lang.flag}
            </ListItemIcon>
            <ListItemText primary={lang.label} />
            {currentLanguage.code === lang.code && (
              <Check size={16} style={{ marginLeft: 8 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelector;
