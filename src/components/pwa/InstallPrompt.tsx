import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  alpha
} from '@mui/material';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';
import { useTranslation } from 'react-i18next';

interface InstallPromptProps {
  open?: boolean;
  onClose?: () => void;
  variant?: 'button' | 'banner' | 'dialog';
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ 
  open: externalOpen, 
  onClose, 
  variant = 'dialog' 
}) => {
  const { isInstallable, installApp, platform, isInstalled } = usePWA();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const handleClose = () => {
    if (externalOpen !== undefined) {
      onClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  if (isInstalled) return null;
  
  // On non-iOS, we only show if installable (deferred prompt exists)
  // On iOS, we show if it's not installed (can't detect installability, but we show instructions)
  if (!isInstallable && platform !== 'ios') return null;

  const handleInstall = () => {
    if (platform === 'ios') {
      if (variant !== 'dialog') {
        setInternalOpen(true);
      }
    } else {
      installApp();
    }
  };

  const iOSInstructions = (
    <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
      <Typography variant="subtitle2" gutterBottom color="primary">
        Para instalar no seu iPhone:
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box sx={{ display: 'flex', p: 0.5, bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}>
          <Share size={16} color={theme.palette.primary.main} />
        </Box>
        <Typography variant="body2">1. Toque no botão "Compartilhar" abaixo</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ display: 'flex', p: 0.5, bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}>
          <PlusSquare size={16} color={theme.palette.primary.main} />
        </Box>
        <Typography variant="body2">2. Selecione "Adicionar à Tela de Início"</Typography>
      </Box>
    </Box>
  );

  if (variant === 'button') {
    return (
      <>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Download size={18} />}
          onClick={handleInstall}
          fullWidth={isMobile}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
        >
          {t('pwa.install_button', 'Instalar App')}
        </Button>
        {platform === 'ios' && (
          <Dialog open={internalOpen} onClose={() => setInternalOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {t('pwa.install_title', 'Instalar Tekuá Gov')}
              <IconButton onClick={() => setInternalOpen(false)} size="small">
                <X size={20} />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                {t('pwa.install_description', 'Adicione o Tekuá Gov à sua tela inicial para acesso rápido e uma experiência nativa.')}
              </Typography>
              {iOSInstructions}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setInternalOpen(false)}>{t('common.close', 'Fechar')}</Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    );
  }

  if (variant === 'banner') {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          m: 2, 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center', 
          gap: 2,
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white'
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('pwa.banner_title', 'Tekuá Gov no seu celular')}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {t('pwa.banner_description', 'Instale nosso aplicativo para uma experiência mais rápida e fluida.')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, width: isMobile ? '100%' : 'auto' }}>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: 'white', 
              color: theme.palette.primary.main, 
              '&:hover': { bgcolor: alpha('#fff', 0.9) },
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              flex: 1
            }}
            onClick={handleInstall}
          >
            {platform === 'ios' ? t('pwa.see_how', 'Ver como') : t('pwa.install_now', 'Instalar')}
          </Button>
          <IconButton size="small" sx={{ color: 'white' }} onClick={handleClose}>
            <X size={18} />
          </IconButton>
        </Box>
        {platform === 'ios' && (
          <Dialog open={internalOpen} onClose={() => setInternalOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {t('pwa.install_title', 'Instalar Tekuá Gov')}
              <IconButton onClick={() => setInternalOpen(false)} size="small">
                <X size={20} />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {iOSInstructions}
            </DialogContent>
          </Dialog>
        )}
      </Paper>
    );
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {t('pwa.install_title', 'Instalar Tekuá Gov')}
        <IconButton onClick={handleClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          {t('pwa.install_description', 'Adicione o Tekuá Gov à sua tela inicial para acesso rápido e uma experiência nativa.')}
        </Typography>
        {platform === 'ios' ? iOSInstructions : (
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            O aplicativo ocupará pouquíssimo espaço e facilitará seu dia a dia.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.not_now', 'Agora não')}</Button>
        {platform !== 'ios' && (
          <Button 
            variant="contained" 
            onClick={handleInstall}
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            {t('pwa.install_confirm', 'Instalar Agora')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
