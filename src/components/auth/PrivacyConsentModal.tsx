import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  Link
} from '@mui/material';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PrivacyConsentModalProps {
  open: boolean;
  onAccept: () => void;
}

const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({ open, onAccept }) => {
  const { t } = useTranslation();

  return (
    <Dialog 
      open={open} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 2
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 700 }}>
        <ShieldCheck size={32} color="#10b981" />
        {t('lgpd.privacyTitle', 'Privacidade e Termos')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            {t('lgpd.privacyIntroduction', 'Para continuar utilizando o Tekuá Governance, você precisa aceitar nossa Política de Privacidade e os Termos de Uso em conformidade com a LGPD.')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • {t('lgpd.point1', 'Seus dados são utilizados apenas para fins de governança e transparência.')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • {t('lgpd.point2', 'Você tem o direito de exportar ou excluir seus dados a qualquer momento.')}
          </Typography>
          <Typography variant="body2">
            • {t('lgpd.point3', 'Mantemos logs de auditoria apenas para segurança e integridade financeira.')}
          </Typography>
        </Box>
        
        <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}>
          <Typography variant="caption" display="block">
            {t('lgpd.readMore', 'Leia na íntegra:')}
          </Typography>
          <Link href="#" sx={{ mr: 2, fontSize: '0.8rem' }}>{t('lgpd.privacyPolicy', 'Política de Privacidade')}</Link>
          <Link href="#" sx={{ fontSize: '0.8rem' }}>{t('lgpd.termsOfUse', 'Termos de Uso')}</Link>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          fullWidth 
          variant="contained" 
          onClick={onAccept}
          sx={{ py: 1.5, borderRadius: '12px', fontWeight: 600 }}
        >
          {t('lgpd.accept', 'Eu aceito e desejo continuar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrivacyConsentModal;
