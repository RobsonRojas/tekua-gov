import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Avatar,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';

interface GiftDetailsModalProps {
  open: boolean;
  onClose: () => void;
  gift: any;
  onRecordUsage: (giftId: string) => void;
  recordingUsageId: string | null;
}

const GiftDetailsModal: React.FC<GiftDetailsModalProps> = ({
  open,
  onClose,
  gift,
  onRecordUsage,
  recordingUsageId,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!gift) return null;

  const title = typeof gift.title === 'string' ? gift.title : (gift.title?.pt || gift.title?.en || '');
  const desc = typeof gift.description === 'string' ? gift.description : (gift.description?.pt || gift.description?.en || '');
  const isOwnGift = user?.id === gift.provider_id;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 1 }}>
          <Avatar src={gift.provider?.avatar_url} sx={{ width: 40, height: 40, mr: 2 }} />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Oferecido por
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {gift.provider?.full_name}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {desc}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
        <Tooltip title={isOwnGift ? "Você não pode utilizar sua própria dádiva" : ""}>
          <span style={{ width: '100%' }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={recordingUsageId === gift.id ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
              fullWidth
              onClick={() => onRecordUsage(gift.id)}
              disabled={isOwnGift || recordingUsageId === gift.id}
            >
              {t('gifts.recordUsage')}
            </Button>
          </span>
        </Tooltip>
        <Button onClick={onClose} fullWidth variant="text" sx={{ mt: 1 }}>
          {t('common.close', 'Fechar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GiftDetailsModal;
