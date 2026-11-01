import React, { useState } from 'react';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { isValidHttpUrl } from '../../lib/links';
import type { Attachment } from './FileUploader';

export const EVIDENCE_LINK_TYPE = 'link';
const MAX_LINKS = 10;
const MAX_LENGTH = 2000;

interface Props {
  value: Attachment[];
  onChange: (links: Attachment[]) => void;
}

/** Entrada de links como evidência: somente http/https. Cada link vira um anexo `file_type = 'link'`. */
const EvidenceLinksInput: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const add = () => {
    const url = draft.trim();
    if (!url) return;
    if (!isValidHttpUrl(url) || url.length > MAX_LENGTH) {
      setError(t('work.evidenceLinkInvalid', 'Informe um endereço que comece com http:// ou https://'));
      return;
    }
    if (value.some((l) => l.file_url === url)) {
      setError(t('work.evidenceLinkDuplicate', 'Este link já foi adicionado.'));
      return;
    }
    if (value.length >= MAX_LINKS) {
      setError(t('work.evidenceLinkLimit', 'Limite de links atingido.'));
      return;
    }
    onChange([...value, { file_url: url, file_name: url, file_type: EVIDENCE_LINK_TYPE, file_size: 0 }]);
    setDraft('');
    setError('');
  };

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        {t('work.evidenceLinks', 'Links (opcional)')}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <TextField
          fullWidth
          size="small"
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="https://"
          label={t('work.evidenceLinkLabel', 'Endereço do link')}
          error={Boolean(error)}
          helperText={error || undefined}
          inputProps={{ maxLength: MAX_LENGTH }}
        />
        <Button variant="outlined" onClick={add} startIcon={<LinkIcon fontSize="small" />} sx={{ flexShrink: 0 }}>
          {t('work.evidenceLinkAdd', 'Adicionar link')}
        </Button>
      </Stack>
      <Stack spacing={0.5} sx={{ mt: 1 }}>
        {value.map((l) => (
          <Stack key={l.file_url} direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{l.file_url}</Typography>
            <IconButton
              size="small"
              aria-label={t('work.evidenceLinkRemove', 'Remover link')}
              onClick={() => onChange(value.filter((x) => x.file_url !== l.file_url))}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default EvidenceLinksInput;
