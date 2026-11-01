import React, { useEffect, useState } from 'react';
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';
import SafeMarkdown from '../common/SafeMarkdown';

interface Props {
  protocolId: string | null;
  onClose: () => void;
}

/** Diálogo somente leitura com o texto completo de um protocolo (Markdown seguro). */
const ProtocolViewDialog: React.FC<Props> = ({ protocolId, onClose }) => {
  const { t } = useTranslation();
  const [protocol, setProtocol] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!protocolId) return;
    let active = true;
    setProtocol(null);
    setError('');
    setLoading(true);
    (async () => {
      try {
        const { data, error: apiError } = await apiClient.invoke('api-governance', 'fetchProtocol', { id: protocolId });
        if (!active) return;
        if (apiError) setError(apiError);
        else setProtocol(data as { title: string; content: string });
      } catch {
        if (active) setError(t('protocols.loadFailed', 'Não foi possível carregar o protocolo.'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [protocolId, t]);

  return (
    <Dialog open={Boolean(protocolId)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ overflowWrap: 'anywhere' }}>{protocol?.title || t('protocols.title', 'Protocolos e POPs')}</DialogTitle>
      <DialogContent dividers>
        {loading && <CircularProgress size={24} role="status" />}
        {error && <Alert severity="error">{error}</Alert>}
        {protocol && (protocol.content
          ? <SafeMarkdown content={protocol.content} linkTarget="_blank" contained />
          : <em>{t('protocols.emptyContent', 'Este protocolo ainda não tem texto.')}</em>)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.close', 'Fechar')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProtocolViewDialog;
