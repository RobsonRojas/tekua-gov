import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem,
  ListItemButton, ListItemText, Chip, Paper, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Inventory2';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';
import ProtocolViewDialog from '../components/work/ProtocolViewDialog';

interface ProtocolRow {
  id: string;
  title: string;
  status: 'active' | 'archived';
}

const MAX_TITLE = 200;
const MAX_CONTENT = 20000;

/** Área de Governança: consulta de protocolos/POPs; administradores e Conselho também escrevem. */
const Protocols: React.FC = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<ProtocolRow[]>([]);
  const [canWrite, setCanWrite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [viewId, setViewId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: apiError } = await apiClient.invoke('api-governance', 'listProtocols', { includeArchived: showArchived });
    if (apiError) {
      setError(apiError);
      setRows([]);
    } else {
      const d = data as { protocols?: ProtocolRow[]; canWrite?: boolean };
      setRows(d?.protocols || []);
      setCanWrite(Boolean(d?.canWrite));
    }
    setLoading(false);
  }, [showArchived]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? rows.filter((r) => r.title.toLowerCase().includes(q)) : rows;
  }, [rows, search]);

  const openCreate = () => {
    setEditingId(null); setTitle(''); setContent(''); setFormError(''); setFormOpen(true);
  };

  const openEdit = async (id: string) => {
    setEditingId(id); setFormError(''); setTitle(''); setContent(''); setFormOpen(true);
    const { data, error: apiError } = await apiClient.invoke('api-governance', 'fetchProtocol', { id });
    if (apiError) { setFormError(apiError); return; }
    const p = data as { title: string; content: string };
    setTitle(p.title); setContent(p.content);
  };

  const save = async () => {
    setSaving(true);
    setFormError('');
    const action = editingId ? 'updateProtocol' : 'createProtocol';
    const { error: apiError } = await apiClient.invoke('api-governance', action, { id: editingId, title, content });
    setSaving(false);
    if (apiError) { setFormError(apiError); return; }
    setFormOpen(false);
    await load();
  };

  const setStatus = async (row: ProtocolRow) => {
    const { error: apiError } = await apiClient.invoke('api-governance', 'setProtocolStatus', {
      id: row.id,
      status: row.status === 'active' ? 'archived' : 'active',
    });
    if (apiError) setError(apiError);
    await load();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} spacing={2}>
        <Typography variant="h4" fontWeight={800}>{t('protocols.title', 'Protocolos e POPs')}</Typography>
        {canWrite && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            {t('protocols.create', 'Novo protocolo')}
          </Button>
        )}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <TextField
          fullWidth
          size="small"
          label={t('protocols.search', 'Pesquisar por título')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {canWrite && (
          <Button size="small" onClick={() => setShowArchived((v) => !v)} sx={{ flexShrink: 0 }}>
            {showArchived ? t('protocols.hideArchived', 'Ocultar arquivados') : t('protocols.showArchived', 'Mostrar arquivados')}
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <List disablePadding>
          {!loading && filtered.length === 0 && (
            <ListItem><ListItemText primary={t('protocols.empty', 'Nenhum protocolo encontrado.')} /></ListItem>
          )}
          {filtered.map((row) => (
            <ListItem
              key={row.id}
              divider
              disablePadding
              secondaryAction={canWrite ? (
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title={t('protocols.edit', 'Editar')}>
                    <IconButton aria-label={t('protocols.edit', 'Editar')} onClick={() => openEdit(row.id)}><EditIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title={row.status === 'active' ? t('protocols.archive', 'Arquivar') : t('protocols.unarchive', 'Reativar')}>
                    <IconButton
                      aria-label={row.status === 'active' ? t('protocols.archive', 'Arquivar') : t('protocols.unarchive', 'Reativar')}
                      onClick={() => setStatus(row)}
                    >
                      {row.status === 'active' ? <ArchiveIcon fontSize="small" /> : <UnarchiveIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              ) : undefined}
            >
              <ListItemButton onClick={() => setViewId(row.id)}>
                <ListItemText primary={row.title} primaryTypographyProps={{ sx: { overflowWrap: 'anywhere' } }} />
                {row.status === 'archived' && <Chip size="small" label={t('protocols.archivedLabel', 'Arquivado')} sx={{ ml: 1 }} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      <ProtocolViewDialog protocolId={viewId} onClose={() => setViewId(null)} />

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? t('protocols.editTitle', 'Editar protocolo') : t('protocols.create', 'Novo protocolo')}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label={t('protocols.fieldTitle', 'Título')}
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
              required
              fullWidth
            />
            <TextField
              label={t('protocols.fieldContent', 'Texto (Markdown)')}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT))}
              multiline
              minRows={10}
              fullWidth
              helperText={`${content.length}/${MAX_CONTENT}`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>{t('common.cancel', 'Cancelar')}</Button>
          <Button variant="contained" onClick={save} disabled={saving || !title.trim()}>
            {t('protocols.save', 'Salvar')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Protocols;
