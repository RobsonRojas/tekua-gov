import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Badge, 
  Popover, 
  List, 
  ListItem, 
  Typography, 
  Divider, 
  Button,
  Stack,
  Avatar,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  MessageSquare, 
  Trophy, 
  Vote, 
  Info,
  Circle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';

const NotificationCenter: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  const getIcon = (type: string) => {
    switch (type) {
      case 'social': return <MessageSquare size={18} />;
      case 'task': return <Trophy size={18} />;
      case 'vote': return <Vote size={18} />;
      default: return <Info size={18} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'social': return '#3b82f6';
      case 'task': return '#f59e0b';
      case 'vote': return '#10b981';
      default: return '#6b7280';
    }
  };

  const lang = i18n.language === 'pt' ? 'pt' : 'en';
  const dateLocale = i18n.language === 'pt' ? ptBR : enUS;

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      handleClose();
    }
  };

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleClick}
        aria-describedby={id}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Bell size={24} />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            borderRadius: '16px',
            mt: 1.5,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              {t('notifications.title', 'Notificações')}
            </Typography>
            {unreadCount > 0 && (
              <Tooltip title={t('notifications.markAllRead', 'Marcar todas como lidas')}>
                <IconButton size="small" onClick={markAllAsRead} color="primary">
                  <CheckCheck size={18} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>
        <Divider />
        
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('notifications.empty', 'Nenhuma notificação por aqui.')}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notif) => (
                <React.Fragment key={notif.id}>
                  <ListItem 
                    alignItems="flex-start"
                    onClick={() => handleNotificationClick(notif)}
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: notif.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.02)'
                      },
                      py: 1.5
                    }}
                    secondaryAction={
                      <IconButton edge="end" size="small" onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}>
                        <Trash2 size={16} />
                      </IconButton>
                    }
                  >
                    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                      <Avatar sx={{ 
                        width: 40, 
                        height: 40, 
                        bgcolor: 'transparent',
                        border: `1px solid ${getColor(notif.type)}`,
                        color: getColor(notif.type)
                      }}>
                        {getIcon(notif.type)}
                      </Avatar>
                      <Box sx={{ pr: 4 }}>
                        <Typography variant="subtitle2" fontWeight={notif.is_read ? 600 : 700} sx={{ lineHeight: 1.2, mb: 0.5 }}>
                          {notif.title[lang] || notif.title.pt}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 1
                        }}>
                          {notif.message[lang] || notif.message.pt}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                           {!notif.is_read && <Circle size={8} fill="#3b82f6" color="#3b82f6" />}
                           <Typography variant="caption" color="text.disabled">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: dateLocale })}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        <Divider />
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button fullWidth size="small" onClick={() => { navigate('/notifications'); handleClose(); }}>
            {t('notifications.viewAll', 'Ver Todas')}
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationCenter;
