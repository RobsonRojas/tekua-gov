import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';

interface AdminCircle {
  id: string;
  title: string;
  status: 'open' | 'closed' | 'cancelled';
  scheduled_at: string;
  created_at: string;
  author_name: string | null;
  share_token: string;
}

/** Aba do painel do administrador: lista as convocações de círculo restaurativo e permite encerrá-las ou cancelá-las. */
const RestorativeCirclesTab: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [circles, setCircles] = useState<AdminCircle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: apiError } = await apiClient.invoke('api-governance', 'fetchAllRestorativeCircles');
    if (apiError) {
      setError(apiError);
      setCircles([]);
    } else {
      setCircles((data as AdminCircle[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (id: string, action: 'closeRestorativeCircle' | 'cancelRestorativeCircle') => {
    setBusyId(id);
    setError('');
    const { error: apiError } = await apiClient.invoke('api-governance', action, { id });
    if (apiError) setError(apiError);
    await load();
    setBusyId(null);
  };

  const statusLabel = (status: AdminCircle['status']) => {
    switch (status) {
      case 'open': return t('circle.status.open', 'Aberta');
      case 'closed': return t('circle.status.closed', 'Encerrada');
      case 'cancelled': return t('circle.status.cancelled', 'Cancelada');
    }
  };

  const formatDate = (value: string) => new Date(value).toLocaleString(i18n.language, { dateStyle: 'short', timeStyle: 'short' });

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        {t('circle.adminTitle', 'Convocações de Círculo Restaurativo')}
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('circle.adminColTitle', 'Tema')}</TableCell>
              <TableCell>{t('circle.adminColStatus', 'Status')}</TableCell>
              <TableCell>{t('circle.adminColAuthor', 'Autor')}</TableCell>
              <TableCell>{t('circle.adminColScheduled', 'Data agendada')}</TableCell>
              <TableCell>{t('circle.adminColCreated', 'Criada em')}</TableCell>
              <TableCell align="right">{t('circle.adminColActions', 'Ações')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && circles.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>{t('circle.adminEmpty', 'Nenhuma convocação registrada.')}</TableCell>
              </TableRow>
            )}
            {circles.map((circle) => (
              <TableRow key={circle.id} hover>
                <TableCell>{circle.title}</TableCell>
                <TableCell>
                  <Chip size="small" label={statusLabel(circle.status)} color={circle.status === 'open' ? 'success' : 'default'} />
                </TableCell>
                <TableCell>{circle.author_name || '—'}</TableCell>
                <TableCell>{formatDate(circle.scheduled_at)}</TableCell>
                <TableCell>{formatDate(circle.created_at)}</TableCell>
                <TableCell align="right">
                  {circle.status === 'open' && (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" disabled={busyId === circle.id} onClick={() => runAction(circle.id, 'closeRestorativeCircle')}>
                        {t('circle.adminClose', 'Encerrar')}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={busyId === circle.id}
                        onClick={() => {
                          if (window.confirm(t('circle.adminCancelConfirm', 'Cancelar esta convocação? Ela sairá do dashboard.'))) {
                            runAction(circle.id, 'cancelRestorativeCircle');
                          }
                        }}
                      >
                        {t('circle.adminCancel', 'Cancelar')}
                      </Button>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
};

export default RestorativeCirclesTab;
