import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import RichTextEditor from '../common/RichTextEditor';

export interface TopicFormValues {
  title: string;
  content: string;
  rewardAmount: number;
}

interface TopicFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Partial<TopicFormValues>;
  maxReward?: number;
  onClose: () => void;
  onSubmit: (values: TopicFormValues) => Promise<void> | void;
}

const TopicFormDialog: React.FC<TopicFormDialogProps> = ({ open, mode, initial, maxReward = 100, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reward, setReward] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setContent(initial?.content ?? '');
      setReward(String(initial?.rewardAmount ?? 0));
    }
  }, [open, initial?.title, initial?.content, initial?.rewardAmount]);

  const rewardNumber = Number(reward.replace(',', '.'));
  const rewardInvalid = reward.trim() === '' || !Number.isFinite(rewardNumber) || rewardNumber < 0 || rewardNumber > maxReward;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit({ title, content, rewardAmount: Math.round(rewardNumber * 100) / 100 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? t('voting.createTopic', 'Criar Nova Pauta') : t('voting.editTopic', 'Editar Pauta')}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t('voting.topicTitle', 'Título da Pauta')}
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <RichTextEditor value={content} onChange={setContent} placeholder={t('voting.topicContent', 'Conteúdo da Pauta')} />
        <TextField
          margin="dense"
          label={t('voting.rewardAmount', 'Recompensa por interação (surreais)')}
          helperText={rewardInvalid
            ? t('voting.rewardInvalid', 'Informe um valor entre 0 e {{max}}', { max: maxReward })
            : t('voting.rewardHelp', 'Pago uma vez por membro a cada tipo de interação (voto, comentário). 0 = sem recompensa.')}
          error={rewardInvalid}
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          slotProps={{ htmlInput: { inputMode: 'decimal' } }}
          sx={{ mt: 3, maxWidth: 360 }}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel', 'Cancelar')}</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!title || !content || rewardInvalid || saving}>
          {t('common.save', 'Salvar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TopicFormDialog;
