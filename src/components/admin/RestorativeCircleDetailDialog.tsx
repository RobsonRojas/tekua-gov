import React, { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography,
} from '@mui/material';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';

export interface CircleDetail {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  location_or_link: string | null;
  status: 'open' | 'closed' | 'cancelled';
  created_at: string;
  confirmed_pre_circles: boolean;
  share_token: string;
  author_name: string | null;
}

interface Props {
  circleId: string | null;
  onClose: () => void;
}

/** Modal somente leitura com os detalhes completos de uma convocação (busca sob demanda pelo id). */
const RestorativeCircleDetailDialog: React.FC<Props> = ({ circleId, onClose }) => {
  const { t, i18n } = useTranslation();
  const [detail, setDetail] = useState<CircleDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!circleId) return;
    let active = true;
    setDetail(null);
    setError('');
    setLoading(true);
    (async () => {
      try {
        const { data, error: apiError } = await apiClient.invoke('api-governance', 'fetchRestorativeCircleById', { id: circleId });
        if (!active) return;
        if (apiError) setError(apiError || t('circle.detail.loadFailed', 'Não foi possível carregar os detalhes.'));
        else setDetail(data as CircleDetail);
      } catch {
        if (active) setError(t('circle.detail.loadFailed', 'Não foi possível carregar os detalhes.'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [circleId, t]);

  const notInformed = t('circle.detail.notInformed', 'Não informado');
  const formatDate = (value: string) => new Date(value).toLocaleString(i18n.language, { dateStyle: 'long', timeStyle: 'short' });
  const statusLabel = (status: CircleDetail['status']) => {
    switch (status) {
      case 'open': return t('circle.status.open', 'Aberta');
      case 'closed': return t('circle.status.closed', 'Encerrada');
      case 'cancelled': return t('circle.status.cancelled', 'Cancelada');
    }
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{children}</Typography>
    </Box>
  );

  const steps = [
    t('circle.detail.step1', 'Passo 1 — Auto-reflexão'),
    t('circle.detail.step2', 'Passo 2 — Diálogo Direto'),
    t('circle.detail.step3', 'Passo 3 — Mediação'),
    t('circle.detail.step4', 'Passo 4 — Câmara Coletiva'),
  ];

  return (
    <Dialog open={Boolean(circleId)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('circle.detail.title', 'Detalhes da convocação')}</DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Stack direction="row" spacing={1} alignItems="center" role="status">
            <CircularProgress size={20} />
            <Typography variant="body2">{t('circle.detail.loading', 'Carregando detalhes…')}</Typography>
          </Stack>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {detail && (
          <Stack spacing={2}>
            <Field label={t('circle.adminColTitle', 'Tema')}>{detail.title}</Field>
            <Field label={t('circle.detail.description', 'Descrição')}>{detail.description || notInformed}</Field>
            <Box>
              <Typography variant="caption" color="text.secondary">{t('circle.adminColStatus', 'Status')}</Typography>
              <Box>
                <Chip size="small" label={statusLabel(detail.status)} color={detail.status === 'open' ? 'success' : 'default'} />
              </Box>
            </Box>
            <Field label={t('circle.adminColAuthor', 'Autor')}>{detail.author_name || '—'}</Field>
            <Field label={t('circle.adminColScheduled', 'Data agendada')}>{formatDate(detail.scheduled_at)}</Field>
            <Field label={t('circle.adminColCreated', 'Criada em')}>{formatDate(detail.created_at)}</Field>
            <Field label={t('circle.detail.locationOrLink', 'Local ou link')}>{detail.location_or_link || notInformed}</Field>
            <Box>
              <Typography variant="caption" color="text.secondary">{t('circle.detail.preCircles', 'Pré-círculos individuais')}</Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {detail.confirmed_pre_circles ? <CheckCircle2 size={16} aria-hidden /> : <XCircle size={16} aria-hidden />}
                <Typography variant="body2">
                  {detail.confirmed_pre_circles
                    ? t('circle.detail.preCirclesYes', 'Confirmados pelo autor')
                    : t('circle.detail.preCirclesNo', 'Não confirmados')}
                </Typography>
              </Stack>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>{t('circle.detail.protocolTitle', 'Protocolo de Justiça Restaurativa')}</Typography>
              <Box component="ol" sx={{ m: 0, pl: 3 }}>
                {steps.map((step) => (
                  <Typography key={step} component="li" variant="body2">{step}</Typography>
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {t('circle.detail.protocolNote', 'Esta convocação foi gerada ao final do Passo 4.')}
              </Typography>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('circle.detail.close', 'Fechar')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RestorativeCircleDetailDialog;
