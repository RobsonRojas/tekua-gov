import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { X as CloseIcon, Calendar, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Announcement } from './NoticeWall';

interface NoticeDetailModalProps {
  open: boolean;
  onClose: () => void;
  notice: Announcement | null;
}

const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({ open, onClose, notice }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'pt' | 'en';

  if (!notice) return null;

  const title = notice.title[lang] || notice.title.pt;
  const content = notice.content[lang] || notice.content.pt;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: '16px',
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" component="div" fontWeight="bold">
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.05)', py: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, mb: 3, color: 'text.secondary' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={16} />
            <Typography variant="caption">
              {new Date(notice.created_at).toLocaleDateString(lang, { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </Typography>
          </Box>
          {notice.author?.full_name && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <User size={16} />
              <Typography variant="caption">
                {notice.author.full_name}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Typography 
          variant="body1" 
          sx={{ 
            whiteSpace: 'pre-wrap', 
            lineHeight: 1.6,
            color: 'text.primary' 
          }}
        >
          {content}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary" sx={{ borderRadius: '12px' }}>
          {t('common.close', 'Fechar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoticeDetailModal;
