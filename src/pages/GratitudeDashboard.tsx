import React, { useEffect, useState } from 'react';
import { Alert, Box, Container, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';

interface GratitudeRow {
  id: string;
  created_at: string;
  thanks_message: string | null;
  thanks_emojis: string[] | null;
  consumer: { full_name: string | null } | null;
  gift: { id: string; title: string | { pt?: string; en?: string }; provider: { full_name: string | null } | null } | null;
}

const titleOf = (title: string | { pt?: string; en?: string } | undefined): string =>
  typeof title === 'string' ? title : title?.pt || title?.en || '';

/** Dashboard público das gratidões: somente registros públicos, com agradecimento (mensagem ou emojis). */
const GratitudeDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState<GratitudeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error: apiError } = await apiClient.invoke('api-gifts', 'fetchGratitudeDashboard');
      if (cancelled) return;
      if (apiError) setError(apiError);
      else setRows((data as GratitudeRow[]) || []);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
        {t('gratitude.dashboardTitle', 'Gratidões da comunidade')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('gratitude.dashboardIntro', 'Agradecimentos públicos pelas dádivas utilizadas. Quem registrou pode tornar o próprio agradecimento privado a qualquer momento.')}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && rows.length === 0 && (
        <Alert severity="info">{t('gratitude.dashboardEmpty', 'Ainda não há gratidões públicas.')}</Alert>
      )}

      <Stack spacing={2}>
        {rows.map((row) => (
          <Paper key={row.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {new Date(row.created_at).toLocaleDateString(i18n.language)}
            </Typography>
            <Typography variant="body1" sx={{ my: 0.5, whiteSpace: 'pre-wrap' }}>
              {row.thanks_message}
              {row.thanks_emojis && row.thanks_emojis.length > 0 && (
                <Box component="span" sx={{ ml: row.thanks_message ? 1 : 0 }}>{row.thanks_emojis.join(' ')}</Box>
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {row.consumer?.full_name ?? t('gratitude.someone', 'Um membro')}
              {' → '}
              {row.gift?.provider?.full_name ?? t('gratitude.someone', 'Um membro')}
              {row.gift && ` · ${titleOf(row.gift.title)}`}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
};

export default GratitudeDashboard;
