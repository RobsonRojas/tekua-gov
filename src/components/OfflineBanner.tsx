import React, { useState, useEffect } from 'react';
import { Alert, Box, Slide } from '@mui/material';
import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const OfflineBanner: React.FC = () => {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Slide direction="down" in={isOffline} mountOnEnter unmountOnExit>
      <Box 
        sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 2000,
          p: 1
        }}
      >
        <Alert 
          severity="warning" 
          icon={<WifiOff size={20} />}
          sx={{ 
            boxShadow: 3,
            borderRadius: 2,
            maxWidth: 'lg',
            mx: 'auto'
          }}
        >
          {t('offline.banner') || 'Você está em modo offline. Algumas ações serão sincronizadas quando houver conexão.'}
        </Alert>
      </Box>
    </Slide>
  );
};

export default OfflineBanner;
