import React, { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { chatWithGemini, type Message } from '../../lib/gemini';
import { apiClient } from '../../lib/api';

export interface ActivityDraft {
  title: string;
  description: string;
  rewardAmount: number;
}

type Turn = Message;

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 2000;

/** Erros de validação do rascunho, checados no cliente antes de habilitar "Criar". A decisão final é do backend. */
const draftErrors = (draft: ActivityDraft, t: (key: string, fallback: string) => string): string[] => {
  const list: string[] = [];
  if (!draft.title.trim()) list.push(t('workWallAssistant.errors.title', 'Informe o título da tarefa.'));
  if (draft.title.length > MAX_TITLE) list.push(t('workWallAssistant.errors.titleLength', 'O título pode ter até 200 caracteres.'));
  if (!draft.description.trim()) list.push(t('workWallAssistant.errors.description', 'Informe a descrição da tarefa.'));
  if (draft.description.length > MAX_DESCRIPTION) list.push(t('workWallAssistant.errors.descriptionLength', 'A descrição pode ter até 2000 caracteres.'));
  if (!Number.isFinite(draft.rewardAmount) || draft.rewardAmount <= 0) {
    list.push(t('workWallAssistant.errors.reward', 'A recompensa precisa ser um valor positivo.'));
  }
  return list;
};

/**
 * Assistente do mural: explica o funcionamento e ajuda a criar tarefas por conversa.
 * O modelo só propõe um rascunho. A tarefa é criada apenas quando o membro clica em "Criar".
 */
const WorkWallAssistant: React.FC = () => {
  const { t } = useTranslation();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<ActivityDraft | null>(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    // Mudar de assunto descarta o rascunho pendente, sem gravar nada.
    setDraft(null);
    setEditing(false);
    setCreatedId(null);
    setCreateError('');

    const next: Turn[] = [...turns, { role: 'user', content: text }];
    setTurns(next);
    setInput('');
    setBusy(true);
    setError('');

    try {
      const stream = await chatWithGemini(next, undefined, undefined, 'work-wall');
      let answer = '';
      for await (const event of stream) {
        if (event.type === 'text') answer = event.content;
        if (event.type === 'draft') setDraft(event.draft as ActivityDraft);
      }
      setTurns([...next, { role: 'model', content: answer }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('workWallAssistant.errors.generic', 'Não foi possível responder agora.'));
    } finally {
      setBusy(false);
    }
  };

  const cancelDraft = () => {
    setDraft(null);
    setEditing(false);
    setCreateError('');
  };

  const createTask = async () => {
    if (!draft || creating) return;
    if (draftErrors(draft, t).length > 0) return;

    setCreating(true);
    setCreateError('');
    try {
      const { data, error: apiError } = await apiClient.invoke('api-work', 'createActivity', {
        title: draft.title.trim(),
        description: draft.description.trim(),
        rewardAmount: draft.rewardAmount,
        type: 'task',
      });
      if (apiError) {
        // Mantém o rascunho para correção; nada foi gravado.
        setCreateError(apiError);
        return;
      }
      setCreatedId((data as { id?: string } | null)?.id ?? null);
      setDraft(null);
      setEditing(false);
    } catch {
      setCreateError(t('workWallAssistant.errors.create', 'Não foi possível criar a tarefa. Seu rascunho foi mantido.'));
    } finally {
      setCreating(false);
    }
  };

  const errors = draft ? draftErrors(draft, t) : [];

  return (
    <Stack spacing={2}>
      <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
        {turns.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            {t('workWallAssistant.welcome', 'Posso explicar como o mural funciona ou ajudar você a criar uma tarefa. Diga o que precisa.')}
          </Typography>
        )}
        {turns.map((turn, index) => (
          <Typography key={index} variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color={turn.role === 'user' ? 'text.primary' : 'primary.main'}>
            <strong>{turn.role === 'user' ? t('workWallAssistant.you', 'Você') : t('workWallAssistant.assistant', 'Assistente')}:</strong> {turn.content}
          </Typography>
        ))}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {createdId && (
        <Alert severity="success">
          {t('workWallAssistant.created', 'Tarefa criada.')}{' '}
          <a href={`/tasks/${createdId}`}>{t('workWallAssistant.viewTask', 'Ver tarefa')}</a>
        </Alert>
      )}

      {draft && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            {t('workWallAssistant.draftTitle', 'Rascunho de tarefa (ainda não criada)')}
          </Typography>

          {editing ? (
            <Stack spacing={1.5}>
              <TextField
                label={t('workWallAssistant.fieldTitle', 'Título')}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                inputProps={{ maxLength: MAX_TITLE }}
                fullWidth
              />
              <TextField
                label={t('workWallAssistant.fieldDescription', 'Descrição')}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                multiline
                minRows={2}
                inputProps={{ maxLength: MAX_DESCRIPTION }}
                fullWidth
              />
              <TextField
                label={t('workWallAssistant.fieldReward', 'Recompensa (Surreals)')}
                type="number"
                value={Number.isFinite(draft.rewardAmount) ? draft.rewardAmount : ''}
                onChange={(e) => setDraft({ ...draft, rewardAmount: Number(e.target.value) })}
                fullWidth
              />
              <Box>
                <Button onClick={() => setEditing(false)}>{t('workWallAssistant.save', 'Salvar alterações')}</Button>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={0.5}>
              <Typography variant="body2"><strong>{t('workWallAssistant.fieldTitle', 'Título')}:</strong> {draft.title}</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                <strong>{t('workWallAssistant.fieldDescription', 'Descrição')}:</strong> {draft.description}
              </Typography>
              <Typography variant="body2"><strong>{t('workWallAssistant.fieldReward', 'Recompensa (Surreals)')}:</strong> {draft.rewardAmount}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t('workWallAssistant.draftNote', 'Categoria, executores e confirmações são definidos depois, no formulário de tarefa.')}
              </Typography>
            </Stack>
          )}

          {errors.length > 0 && (
            <Alert severity="warning" sx={{ mt: 1.5 }}>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {errors.map((message) => <li key={message}>{message}</li>)}
              </ul>
            </Alert>
          )}

          {createError && <Alert severity="error" sx={{ mt: 1.5 }}>{createError}</Alert>}

          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={createTask} disabled={creating || errors.length > 0}>
              {t('workWallAssistant.create', 'Criar')}
            </Button>
            <Button variant="outlined" onClick={() => setEditing(true)} disabled={creating}>
              {t('workWallAssistant.edit', 'Editar')}
            </Button>
            <Button color="inherit" onClick={cancelDraft} disabled={creating}>
              {t('workWallAssistant.cancel', 'Cancelar')}
            </Button>
          </Stack>
        </Paper>
      )}

      <Stack direction="row" spacing={1}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={t('workWallAssistant.placeholder', 'Pergunte sobre o mural ou descreva a tarefa…')}
          fullWidth
          size="small"
          disabled={busy}
        />
        <Button variant="contained" onClick={send} disabled={busy || !input.trim()}>
          {t('workWallAssistant.send', 'Enviar')}
        </Button>
      </Stack>
    </Stack>
  );
};

export default WorkWallAssistant;
