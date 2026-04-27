import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Divider, 
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from '@mui/material';
import { 
  Download, 
  Trash2, 
  ShieldAlert,
  FileJson
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../context/useAuth';

const PrivacyTab: React.FC = () => {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleExportData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await apiClient.invoke('api-privacy', 'exportUserData');
      
      if (error) throw new Error(error);

      // Create a blob and download it
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tekuá-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: t('lgpd.exportSuccess', 'Dados exportados com sucesso!') });
    } catch (err: any) {
      console.error('Export error:', err);
      setMessage({ type: 'error', text: err.message || t('lgpd.exportError', 'Erro ao exportar dados.') });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;

    setLoading(true);
    try {
      const { error } = await apiClient.invoke('api-privacy', 'deleteAccount', {
        confirmation: 'DELETE'
      });

      if (error) throw new Error(error);

      // Successfully deleted, sign out and redirect
      await signOut();
      window.location.href = '/login';
    } catch (err: any) {
      console.error('Delete error:', err);
      setMessage({ type: 'error', text: err.message || t('lgpd.deleteError', 'Erro ao excluir conta.') });
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Box>
      <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
        {t('lgpd.privacySettings', 'Configurações de Privacidade')}
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 4, borderRadius: '12px' }}>
          {message.text}
        </Alert>
      )}

      <Stack spacing={4}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <FileJson size={24} color="#6366f1" />
            <Typography variant="h4">{t('lgpd.portability', 'Portabilidade de Dados')}</Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {t('lgpd.portabilityDesc', 'Baixe todos os seus dados pessoais e histórico de atividades em formato JSON, em conformidade com o Art. 18 da LGPD.')}
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<Download size={18} />}
            onClick={handleExportData}
            disabled={loading}
          >
            {loading ? t('common.loading') : t('lgpd.exportButton', 'Exportar Meus Dados')}
          </Button>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <ShieldAlert size={24} color="#ef4444" />
            <Typography variant="h4" color="error">{t('lgpd.forgetTitle', 'Direito ao Esquecimento')}</Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {t('lgpd.forgetDesc', 'Solicite a exclusão definitiva de sua conta e a anonimização de seus dados de governança. Esta ação não pode ser desfeita.')}
          </Typography>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<Trash2 size={18} />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            {t('lgpd.deleteButton', 'Excluir Minha Conta')}
          </Button>
        </Box>
      </Stack>

      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => !loading && setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '24px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#ef4444' }}>
          {t('lgpd.confirmDeleteTitle', 'Confirmar Exclusão de Conta')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {t('lgpd.confirmDeleteText', 'Esta ação removerá permanentemente seu acesso e dados pessoais. Digite "DELETE" para confirmar.')}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="DELETE"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            disabled={deleteConfirmation !== 'DELETE' || loading}
            onClick={handleDeleteAccount}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : t('lgpd.confirmDeleteButton', 'Excluir Permanentemente')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrivacyTab;
