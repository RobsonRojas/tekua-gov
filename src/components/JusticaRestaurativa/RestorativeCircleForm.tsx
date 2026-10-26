import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';

interface RestorativeCircleFormProps {
  onBack: () => void;
}

interface CreatedCircle {
  share_token: string;
}

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 2000;
const MAX_LOCATION = 500;
// Mesmo critério do backend (circleRules.ts): endereços de email não podem ser publicados.
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

/** Formulário de convocação do círculo restaurativo, exibido ao final do Passo 4 do wizard. */
const RestorativeCircleForm: React.FC<RestorativeCircleFormProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [confirmedPreCircles, setConfirmedPreCircles] = useState(false);
  const [acknowledgedPrivacy, setAcknowledgedPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [created, setCreated] = useState<CreatedCircle | null>(null);
  const [copied, setCopied] = useState(false);

  const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;

  const hasEmail = EMAIL_PATTERN.test(title) || EMAIL_PATTERN.test(description);

  const errors = useMemo(() => {
    const list: string[] = [];
    if (hasEmail) list.push(t('circle.errors.email', 'Remova os endereços de email do tema e da descrição.'));
    if (!title.trim()) list.push(t('circle.errors.title', 'Informe o tema do círculo.'));
    if (!scheduledAt) {
      list.push(t('circle.errors.dateRequired', 'Informe a data e o horário.'));
    } else if (!scheduledDate || Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now()) {
      list.push(t('circle.errors.datePast', 'A data e o horário precisam ser futuros.'));
    }
    if (!confirmedPreCircles) list.push(t('circle.errors.preCircles', 'Confirme que os pré-círculos individuais foram considerados.'));
    if (!acknowledgedPrivacy) list.push(t('circle.errors.privacy', 'Confirme que a descrição não identifica as partes envolvidas.'));
    return list;
  }, [title, description, hasEmail, scheduledAt, scheduledDate, confirmedPreCircles, acknowledgedPrivacy, t]);

  const handleSubmit = async () => {
    setAttempted(true);
    setServerError('');
    if (errors.length > 0 || !scheduledDate) return;

    setSubmitting(true);
    try {
      const { data, error } = await apiClient.invoke('api-governance', 'createRestorativeCircle', {
        title: title.trim(),
        description: description.trim() || null,
        scheduledAt: scheduledDate.toISOString(),
        locationOrLink: locationOrLink.trim() || null,
        confirmedPreCircles: true,
      });
      if (error) {
        setServerError(error);
        return;
      }
      setCreated(data as CreatedCircle);
    } catch {
      setServerError(t('circle.errors.generic', 'Não foi possível criar a convocação. Tente novamente.'));
    } finally {
      setSubmitting(false);
    }
  };

  const shareUrl = created ? `${window.location.origin}/share/circle/${created.share_token}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (created) {
    return (
      <Stack spacing={2}>
        <Alert severity="success">
          {t('circle.created', 'Convocação criada. A vila foi avisada por email e notificação.')}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          {t('circle.shareLabel', 'Link para compartilhamento')}
        </Typography>
        <TextField value={shareUrl} fullWidth size="small" InputProps={{ readOnly: true }} />
        <Box>
          <Button variant="outlined" onClick={handleCopy}>
            {copied ? t('circle.copied', 'Link copiado') : t('circle.copy', 'Copiar link')}
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        {t('circle.visibilityNotice', 'Esta convocação é visível a toda a vila. Não inclua nomes das partes envolvidas.')}
      </Alert>

      <TextField
        label={t('circle.fieldTitle', 'Tema do círculo')}
        value={title}
        onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
        required
        fullWidth
        helperText={`${title.length}/${MAX_TITLE}`}
      />

      <TextField
        label={t('circle.fieldDescription', 'Descrição geral')}
        value={description}
        onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION))}
        multiline
        minRows={3}
        fullWidth
        helperText={`${description.length}/${MAX_DESCRIPTION}`}
      />

      <TextField
        label={t('circle.fieldDate', 'Data e horário')}
        type="datetime-local"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label={t('circle.fieldLocation', 'Local ou link (opcional)')}
        value={locationOrLink}
        onChange={(e) => setLocationOrLink(e.target.value.slice(0, MAX_LOCATION))}
        fullWidth
      />

      {hasEmail && (
        <Alert severity="warning">
          {t('circle.errors.email', 'Remova os endereços de email do tema e da descrição.')}
        </Alert>
      )}

      <FormControlLabel
        control={<Checkbox checked={confirmedPreCircles} onChange={(e) => setConfirmedPreCircles(e.target.checked)} />}
        label={t('circle.confirmPreCircles', 'Confirmo que os pré-círculos individuais foram considerados.')}
      />

      <FormControlLabel
        control={<Checkbox checked={acknowledgedPrivacy} onChange={(e) => setAcknowledgedPrivacy(e.target.checked)} />}
        label={t('circle.confirmPrivacy', 'Confirmo que a descrição não identifica as partes envolvidas.')}
      />

      {attempted && errors.length > 0 && (
        <Alert severity="warning">
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {errors.map((message) => <li key={message}>{message}</li>)}
          </ul>
        </Alert>
      )}

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Button onClick={onBack} disabled={submitting}>{t('common.back', 'Voltar')}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {t('circle.submit', 'Convocar círculo')}
        </Button>
      </Box>
    </Stack>
  );
};

export default RestorativeCircleForm;
