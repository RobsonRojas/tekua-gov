import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';

interface OpenCircle {
  id: string;
  title: string;
  scheduled_at: string;
  share_token: string;
}

/**
 * Destaque da convocação de círculo restaurativo aberta com data futura.
 * Não renderiza nada quando não há convocação ativa ou quando a consulta falha.
 */
const RestorativeCircleHighlight: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [circle, setCircle] = useState<OpenCircle | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await apiClient.invoke('api-governance', 'fetchOpenRestorativeCircles');
        if (cancelled) return;
        const list = !error && Array.isArray(data) ? (data as OpenCircle[]) : [];
        setCircle(list[0] ?? null);
      } catch {
        if (!cancelled) setCircle(null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!circle) return null;

  const when = new Date(circle.scheduled_at).toLocaleString(i18n.language, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <Paper
      role="region"
      aria-label={t('circle.highlightLabel', 'Convocação de círculo restaurativo')}
      sx={{ p: 3, mb: 4, borderRadius: 3, border: '2px solid', borderColor: 'primary.main' }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
        <Box>
          <Typography variant="overline" color="primary.main" fontWeight={700}>
            {t('circle.highlightTitle', 'Círculo Restaurativo convocado')}
          </Typography>
          <Typography variant="h6" fontWeight={700}>{circle.title}</Typography>
          <Typography variant="body2" color="text.secondary">{when}</Typography>
        </Box>
        <Button variant="contained" component={RouterLink} to={`/share/circle/${circle.share_token}`}>
          {t('circle.highlightAction', 'Ver convocação')}
        </Button>
      </Stack>
    </Paper>
  );
};

export default RestorativeCircleHighlight;
