import React from 'react';
import { Box, Checkbox, Chip, FormControlLabel, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EMOJI_CHOICES, MAX_THANKS_EMOJIS, MAX_THANKS_MESSAGE, type GratitudeValue, type Sentiment } from './gratitudeConfig';

interface GratitudeFieldsProps {
  value: GratitudeValue;
  onChange: (value: GratitudeValue) => void;
  disabled?: boolean;
  /** Na edição do histórico o sentimento já está fixado no registro e não é escolhido de novo. */
  showSentiment?: boolean;
}

/** Campos opcionais do agradecimento: mensagem, emojis e visibilidade no dashboard público. */
const GratitudeFields: React.FC<GratitudeFieldsProps> = ({ value, onChange, disabled, showSentiment = true }) => {
  const { t } = useTranslation();
  const isIngratitude = value.sentiment === 'ingratitude';

  const chooseSentiment = (sentiment: Sentiment) => {
    // Ingratidão é sempre privada, por enquanto
    onChange({ ...value, sentiment, isPublic: sentiment === 'gratitude' ? value.isPublic : false });
  };

  const toggleEmoji = (emoji: string) => {
    const has = value.emojis.includes(emoji);
    if (!has && value.emojis.length >= MAX_THANKS_EMOJIS) return;
    onChange({
      ...value,
      emojis: has ? value.emojis.filter((e) => e !== emoji) : [...value.emojis, emoji],
    });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {t('gratitude.optional', 'Opcional: deixe um agradecimento para apoiar quem ofereceu.')}
      </Typography>

      {showSentiment && (
        <Box>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={value.sentiment}
            onChange={(_e, next: Sentiment | null) => next && chooseSentiment(next)}
            disabled={disabled}
          >
            <ToggleButton value="gratitude">{t('gratitude.sentimentGratitude', 'Gratidão')}</ToggleButton>
            <ToggleButton value="ingratitude">{t('gratitude.sentimentIngratitude', 'Ingratidão')}</ToggleButton>
          </ToggleButtonGroup>
          {isIngratitude && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {t('gratitude.ingratitudeNote', 'Registros de ingratidão ficam privados por enquanto e não aparecem no dashboard.')}
            </Typography>
          )}
        </Box>
      )}

      <TextField
        label={t('gratitude.message', 'Mensagem de agradecimento')}
        value={value.message}
        onChange={(e) => onChange({ ...value, message: e.target.value.slice(0, MAX_THANKS_MESSAGE) })}
        multiline
        minRows={2}
        fullWidth
        disabled={disabled}
        helperText={`${value.message.length}/${MAX_THANKS_MESSAGE}`}
      />

      <Box>
        <Typography variant="caption" color="text.secondary">
          {t('gratitude.emojis', 'Emojis (até {{max}})', { max: MAX_THANKS_EMOJIS })}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 0.5 }}>
          {EMOJI_CHOICES.map((emoji) => (
            <Chip
              key={emoji}
              label={emoji}
              onClick={() => toggleEmoji(emoji)}
              color={value.emojis.includes(emoji) ? 'primary' : 'default'}
              variant={value.emojis.includes(emoji) ? 'filled' : 'outlined'}
              disabled={disabled}
            />
          ))}
        </Stack>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={!isIngratitude && value.isPublic}
            onChange={(e) => onChange({ ...value, isPublic: e.target.checked })}
            disabled={disabled || isIngratitude}
          />
        }
        label={t('gratitude.showPublic', 'Mostrar no dashboard público de gratidões')}
      />
    </Stack>
  );
};

export default GratitudeFields;
