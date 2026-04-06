import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ThemeToggleButton: React.FC = () => {
  const { mode, toggleTheme } = useThemeContext();
  const { updateTheme, user } = useAuth();
  const { t } = useTranslation();

  const handleToggle = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    toggleTheme();
    if (user) {
      await updateTheme(newMode);
    }
  };

  return (
    <Tooltip title={mode === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')}>
      <IconButton onClick={handleToggle} color="inherit">
        {mode === 'light' ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggleButton;
