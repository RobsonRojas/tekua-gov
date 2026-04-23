import React, { useState } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Tooltip
} from '@mui/material';
import { Languages, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const { updateLanguage } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const languages = [
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
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
      <Tooltip title="Alterar Idioma / Change Language">
        <IconButton 
          onClick={handleOpen} 
          color="inherit"
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <Languages size={20} />
        </IconButton>
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
