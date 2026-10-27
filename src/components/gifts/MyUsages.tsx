import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Paper, Stack, Switch, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';
import GratitudeFields from './GratitudeFields';
import { emptyGratitude, type GratitudeValue } from './gratitudeConfig';

interface UsageRow {
  id: string;
  created_at: string;
  thanks_message: string | null;
  thanks_emojis: string[] | null;
  is_public: boolean;
  sentiment: 'gratitude' | 'ingratitude';
  gift: { id: string; title: string | { pt?: string; en?: string } } | null;
}

const giftTitle = (title: string | { pt?: string; en?: string } | undefined): string =>
  typeof title === 'string' ? title : title?.pt || title?.en || '';

/** Histórico das dádivas utilizadas pelo membro: editar o agradecimento e escolher a visibilidade. */
const MyUsages: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<UsageRow | null>(null);
  const [draft, setDraft] = useState<GratitudeValue>(emptyGratitude);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: apiError } = await apiClient.invoke('api-gifts', 'fetchMyUsages');
    if (apiError) setError(apiError);
    else setRows((data as UsageRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (row: UsageRow) => {
    setEditing(row);
    setDraft({ message: row.thanks_message ?? '', emojis: row.thanks_emojis ?? [], isPublic: row.is_public, sentiment: row.sentiment });
  };

  const saveGratitude = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    const { error: apiError } = await apiClient.invoke('api-gifts', 'updateUsageGratitude', {
      usageId: editing.id,
      thanksMessage: draft.message.trim() || null,
      thanksEmojis: draft.emojis,
    });
    if (!apiError && draft.isPublic !== editing.is_public) {
      await apiClient.invoke('api-gifts', 'setUsageVisibility', { usageId: editing.id, isPublic: draft.isPublic });
    }
    if (apiError) setError(apiError);
    setSaving(false);
    setEditing(null);
    await load();
  };

  const toggleVisibility = async (row: UsageRow, isPublic: boolean) => {
    setError('');
    const { error: apiError } = await apiClient.invoke('api-gifts', 'setUsageVisibility', { usageId: row.id, isPublic });
    if (apiError) setError(apiError);
    await load();
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={700}>{t('gratitude.myUsages', 'Minhas dádivas utilizadas')}</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && rows.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {t('gratitude.myUsagesEmpty', 'Você ainda não utilizou nenhuma dádiva.')}
        </Typography>
      )}

      {rows.map((row) => (
        <Paper key={row.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={700}>{giftTitle(row.gift?.title ?? '')}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(row.created_at).toLocaleDateString(i18n.language)}
            </Typography>
            <Typography variant="body2">
              {row.thanks_message || (row.thanks_emojis?.length ? row.thanks_emojis.join(' ') : t('gratitude.none', 'Sem agradecimento ainda.'))}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
              <Button size="small" onClick={() => openEdit(row)}>
                {row.thanks_message || row.thanks_emojis?.length
                  ? t('gratitude.edit', 'Editar agradecimento')
                  : t('gratitude.add', 'Deixar agradecimento')}
              </Button>
              <FormControlLabel
                control={
                  <Switch
                    checked={row.is_public}
                    disabled={row.sentiment === 'ingratitude'}
                    onChange={(e) => toggleVisibility(row, e.target.checked)}
                  />
                }
                label={
                  row.sentiment === 'ingratitude'
                    ? t('gratitude.ingratitudePrivate', 'Ingratidão (sempre privada)')
                    : row.is_public ? t('gratitude.public', 'Público') : t('gratitude.private', 'Privado')
                }
              />
            </Stack>
          </Stack>
        </Paper>
      ))}

      <Dialog open={Boolean(editing)} onClose={() => !saving && setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('gratitude.dialogTitle', 'Agradecimento')}</DialogTitle>
        <DialogContent>
          <GratitudeFields value={draft} onChange={setDraft} disabled={saving} showSentiment={false} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)} disabled={saving}>{t('common.cancel', 'Cancelar')}</Button>
          <Button variant="contained" onClick={saveGratitude} disabled={saving}>{t('common.save', 'Salvar')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default MyUsages;
