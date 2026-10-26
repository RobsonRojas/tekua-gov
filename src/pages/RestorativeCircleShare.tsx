import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Chip, CircularProgress, Container, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';
import { isValidHttpUrl } from '../lib/links';

interface CircleDetail {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  location_or_link: string | null;
  status: 'open' | 'closed' | 'cancelled';
}

/** Página de compartilhamento de uma convocação de círculo restaurativo (acessível apenas com sessão). */
const RestorativeCircleShare: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const [circle, setCircle] = useState<CircleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await apiClient.invoke('api-governance', 'fetchRestorativeCircleByToken', { token });
        if (cancelled) return;
        if (error || !data) {
          setNotFound(true);
          setCircle(null);
        } else {
          setNotFound(false);
          setCircle(data as CircleDetail);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (token) load();
    else {
      setNotFound(true);
      setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [token]);

  const statusLabel = (status: CircleDetail['status']) => {
    switch (status) {
      case 'open': return t('circle.status.open', 'Aberta');
      case 'closed': return t('circle.status.closed', 'Encerrada');
      case 'cancelled': return t('circle.status.cancelled', 'Cancelada');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (notFound || !circle) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="info">
          {t('circle.notFound', 'Convocação não encontrada.')}
        </Alert>
      </Container>
    );
  }

  const when = new Date(circle.scheduled_at).toLocaleString(i18n.language, { dateStyle: 'full', timeStyle: 'short' });
  const location = circle.location_or_link?.trim() || null;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              {t('circle.pageTitle', 'Círculo Restaurativo')}
            </Typography>
            <Chip size="small" label={statusLabel(circle.status)} color={circle.status === 'open' ? 'success' : 'default'} />
          </Stack>

          <Typography variant="h5" fontWeight={700}>{circle.title}</Typography>

          <Typography variant="body1">
            <strong>{t('circle.when', 'Quando')}:</strong> {when}
          </Typography>

          {location && (
            <Typography variant="body1">
              <strong>{t('circle.where', 'Onde')}:</strong>{' '}
              {isValidHttpUrl(location) ? (
                <MuiLink href={location} target="_blank" rel="noopener noreferrer">{location}</MuiLink>
              ) : (
                location
              )}
            </Typography>
          )}

          {circle.description && (
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {circle.description}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default RestorativeCircleShare;
