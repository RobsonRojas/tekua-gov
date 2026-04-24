import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  Divider, 
  IconButton, 
  Box, 
  Button,
  Stack,
  Avatar,
  Chip
} from '@mui/material';
import { 
  Trash2, 
  CheckCheck, 
  MessageSquare, 
  Trophy, 
  Vote, 
  Info,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';

const Notifications: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'social': return <MessageSquare size={20} />;
      case 'task': return <Trophy size={20} />;
      case 'vote': return <Vote size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'social': return 'info';
      case 'task': return 'warning';
      case 'vote': return 'success';
      default: return 'default';
    }
  };

  const lang = i18n.language === 'pt' ? 'pt' : 'en';
  const dateLocale = i18n.language === 'pt' ? ptBR : enUS;

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {t('notifications.pageTitle', 'Centro de Notificações')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('notifications.pageDesc', 'Acompanhe as atualizações importantes da plataforma.')}
          </Typography>
        </Box>
        {notifications.some(n => !n.is_read) && (
          <Button 
            variant="outlined" 
            startIcon={<CheckCheck size={18} />}
            onClick={markAllAsRead}
          >
            {t('notifications.markAllRead', 'Marcar todas como lidas')}
          </Button>
        )}
      </Box>

      <Paper sx={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {t('notifications.empty', 'Nenhuma notificação por aqui.')}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  sx={{
                    py: 3,
                    px: 3,
                    bgcolor: notif.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.03)',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.01)'
                    }
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => deleteNotification(notif.id)} color="error" size="small">
                        <Trash2 size={18} />
                      </IconButton>
                      {notif.link && (
                        <IconButton onClick={() => handleNotificationClick(notif)} color="primary" size="small">
                          <ChevronRight size={18} />
                        </IconButton>
                      )}
                    </Stack>
                  }
                >
                  <Stack direction="row" spacing={3} sx={{ width: '100%', pr: 8 }}>
                    <Avatar 
                      color={getColor(notif.type) as any}
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: (theme) => getColor(notif.type) === 'default' ? 'grey.800' : theme.palette[getColor(notif.type) as 'info'].main + '20',
                        color: (theme) => getColor(notif.type) === 'default' ? 'grey.400' : theme.palette[getColor(notif.type) as 'info'].main,
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      {getIcon(notif.type)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="h6" fontWeight={notif.is_read ? 600 : 800}>
                          {notif.title[lang] || notif.title.pt}
                        </Typography>
                        {!notif.is_read && (
                          <Chip label="Nova" size="small" color="primary" sx={{ height: 20, fontSize: '0.625rem', fontWeight: 700 }} />
                        )}
                      </Stack>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        {notif.message[lang] || notif.message.pt}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: dateLocale })}
                      </Typography>
                    </Box>
                  </Stack>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default Notifications;
