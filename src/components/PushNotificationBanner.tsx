import React from 'react';
import { Alert, AlertTitle, Button, Box, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { usePushNotifications } from '../hooks/usePushNotifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const PushNotificationBanner: React.FC = () => {
  const { t } = useTranslation();
  const { permission, subscribeUser, isSubscribing, error } = usePushNotifications();

  // We only want to show the banner if the user hasn't made a choice yet
  if (permission !== 'default') {
    return null;
  }

  return (
    <Alert 
      severity="info" 
      icon={<NotificationsActiveIcon />}
      sx={{ mb: 3 }}
      action={
        <Button 
          color="inherit" 
          size="small" 
          onClick={subscribeUser}
          disabled={isSubscribing}
        >
          {isSubscribing ? <CircularProgress size={20} color="inherit" /> : t('push.enable', 'Ativar Notificações')}
        </Button>
      }
    >
      <AlertTitle>{t('push.title', 'Fique Atualizado!')}</AlertTitle>
      {t('push.description', 'Ative as notificações para ser avisado sobre novas votações e mensagens importantes na plataforma Tekua.')}
      {error && (
        <Box sx={{ color: 'error.main', mt: 1, fontSize: '0.875rem' }}>
          {error}
        </Box>
      )}
    </Alert>
  );
};

export default PushNotificationBanner;
