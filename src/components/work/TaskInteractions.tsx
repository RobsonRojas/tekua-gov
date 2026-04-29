import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Avatar, 
  Paper, 
  Stack, 
  CircularProgress,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Send, RefreshCw, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';

interface TaskInteractionsProps {
  activityId: string;
}

const TaskInteractions: React.FC<TaskInteractionsProps> = ({ activityId }) => {
  const { t, i18n } = useTranslation();
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');

  const dateLocale = i18n.language === 'pt' ? ptBR : enUS;

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      const { data, error } = await apiClient.invoke('api-work', 'fetchInteractions', { activityId });
      if (error) throw new Error(error);
      setInteractions(data || []);
    } catch (err) {
      console.error('Error fetching interactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activityId) {
      fetchInteractions();
    }
  }, [activityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data, error } = await apiClient.invoke('api-work', 'postInteraction', {
        activityId,
        content: content.trim()
      });

      if (error) throw new Error(error);
      
      setInteractions([...interactions, data]);
      setContent('');
    } catch (err) {
      console.error('Error posting interaction:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MessageSquare size={20} color="primary" />
          <Typography variant="h6" fontWeight={600}>
            {t('work.interactions')}
          </Typography>
        </Box>
        <Tooltip title={t('common.refresh')}>
          <IconButton onClick={fetchInteractions} size="small" disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: '16px', 
          bgcolor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <Stack spacing={3} sx={{ mb: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : interactions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
              {t('work.noInteractions')}
            </Typography>
          ) : (
            interactions.map((interaction) => (
              <Box key={interaction.id} sx={{ display: 'flex', gap: 2 }}>
                <Avatar 
                  src={interaction.user?.avatar_url} 
                  sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                >
                  {interaction.user?.full_name?.charAt(0) || '?'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {interaction.user?.full_name || t('admin.noName')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(interaction.created_at), { 
                        addSuffix: true,
                        locale: dateLocale
                      })}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {interaction.content}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Stack>

        <Divider sx={{ mb: 3, opacity: 0.1 }} />

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder={t('work.askQuestion')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'rgba(0,0,0,0.2)'
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={!content.trim() || submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
              sx={{ borderRadius: '8px', px: 3 }}
            >
              {t('work.postComment')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default TaskInteractions;
