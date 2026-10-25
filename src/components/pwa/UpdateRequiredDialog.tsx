import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { usePWA } from '../../context/PWAContext';

const UpdateRequiredDialog: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { updateAvailable, applyUpdate } = usePWA();
  const [updating, setUpdating] = useState(false);

  const handleUpdate = () => {
    if (updating) {
      return;
    }
    setUpdating(true);
    applyUpdate();
  };

  return (
    <Dialog
      open={updateAvailable}
      fullScreen={isMobile}
      disableEscapeKeyDown
      aria-labelledby="update-required-dialog-title"
      aria-describedby="update-required-dialog-description"
    >
      <DialogTitle id="update-required-dialog-title">
        {t('pwa.updateRequiredTitle')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography id="update-required-dialog-description" variant="body1">
            {t('pwa.updateRequiredDesc')}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleUpdate}
          variant="contained"
          color="primary"
          disabled={updating}
          fullWidth={isMobile}
          startIcon={updating ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {updating ? t('pwa.updating') : t('pwa.updateNow')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateRequiredDialog;
