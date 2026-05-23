import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box,
  Typography, 
  Alert, 
  CircularProgress, 
  Stack, 
  FormControlLabel,
  Switch
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';

interface CreateSharingItemModalProps {
  open: boolean;
  onClose: () => void;
  item?: any; // If provided, edit mode
  onSave: () => void;
}

export const CreateSharingItemModal: React.FC<CreateSharingItemModalProps> = ({ open, onClose, item, onSave }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setDescription(item.description || '');
      setRate(item.hourly_rate_surreias?.toString() || '');
      setIsPublic(item.is_public ?? true);
    } else {
      setTitle('');
      setDescription('');
      setRate('');
      setIsPublic(true);
    }
  }, [item, open]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError(t('sharing.titleRequired', 'O título é obrigatório.'));
      return;
    }
    const numericRate = parseFloat(rate);
    if (isNaN(numericRate) || numericRate < 0) {
      setError(t('sharing.rateInvalid', 'O preço por hora deve ser um número maior ou igual a 0.'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const action = item ? 'updateItem' : 'createItem';
      const params = item 
        ? { itemId: item.id, updates: { title, description, hourly_rate_surreias: numericRate, is_public: isPublic } }
        : { title, description, hourly_rate_surreias: numericRate, is_public: isPublic };

      const response = await apiClient.invoke('api-sharing', action, params);

      if (response.error) {
        throw new Error(response.error);
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || t('common.error', 'Ocorreu um erro.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {item ? t('sharing.editItem', 'Editar Equipamento') : t('sharing.newItem')}
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: 'background.paper' }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label={t('work.taskTitle') || 'Título'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder={t('sharing.titlePlaceholder', 'Ex: Furadeira de Impacto Bosch')}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('work.description') || 'Descrição'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('sharing.descPlaceholder', 'Ex: Acompanha brocas de diversos tamanhos e maleta.')}
          />

          <TextField
            fullWidth
            type="number"
            label={`${t('sharing.pricePerHour')} ($S)`}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
            placeholder="0"
            inputProps={{ min: 0, step: '0.1' }}
          />

          <FormControlLabel
            control={
              <Switch 
                checked={isPublic} 
                onChange={(e) => setIsPublic(e.target.checked)} 
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {isPublic ? t('sharing.public') : t('sharing.private')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isPublic 
                    ? t('sharing.publicDesc', 'Visível para todos no marketplace e acessível via link público.') 
                    : t('sharing.privateDesc', 'Apenas visível para você na sua aba de equipamentos.')}
                </Typography>
              </Box>
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.paper' }}>
        <Button onClick={onClose} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={saving}
          startIcon={saving && <CircularProgress size={20} color="inherit" />}
        >
          {saving ? t('common.sending') : t('profile.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
