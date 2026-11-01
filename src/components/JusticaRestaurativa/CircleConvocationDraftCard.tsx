import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import type { CircleConvocationDraft } from '../../lib/gemini';

interface Props {
  draft: CircleConvocationDraft;
  submitting?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' });

const CircleConvocationDraftCard: React.FC<Props> = ({ draft, submitting = false, error, onConfirm, onCancel }) => (
  <Paper
    variant="outlined"
    sx={{ p: 2, borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: 1, alignSelf: 'flex-start', maxWidth: '80%' }}
  >
    <Typography variant="subtitle2" fontWeight={700}>Rascunho de convocação da Câmara</Typography>
    <Box>
      <Typography variant="caption" color="text.secondary">Tema</Typography>
      <Typography variant="body2">{draft.title}</Typography>
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary">Data e horário</Typography>
      <Typography variant="body2">{formatWhen(draft.scheduledAt)}</Typography>
    </Box>
    {draft.description && (
      <Box>
        <Typography variant="caption" color="text.secondary">Descrição</Typography>
        <Typography variant="body2">{draft.description}</Typography>
      </Box>
    )}
    {draft.locationOrLink && (
      <Box>
        <Typography variant="caption" color="text.secondary">Local ou link</Typography>
        <Typography variant="body2">{draft.locationOrLink}</Typography>
      </Box>
    )}
    {error && <Typography variant="body2" color="error" role="alert">{error}</Typography>}
    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
      <Button variant="contained" size="small" onClick={onConfirm} disabled={submitting}>
        Confirmar convocação
      </Button>
      <Button variant="text" size="small" onClick={onCancel} disabled={submitting}>
        Cancelar
      </Button>
    </Box>
  </Paper>
);

export default CircleConvocationDraftCard;
