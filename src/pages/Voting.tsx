import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemButton, ListItemText, Chip, Container, Stack, Skeleton, IconButton, Tooltip, Snackbar } from '@mui/material';
import { Link as LinkIcon } from 'lucide-react';
import TopicFormDialog, { type TopicFormValues } from '../components/voting/TopicFormDialog';
import { buildTopicUrl, copyToClipboard } from '../lib/topicLinks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';
import TopicCardSkeleton from '../components/Skeletons/TopicCardSkeleton';

interface Topic {
  id: string;
  title: string | any;
  content: string | any;
  status: 'open' | 'closed';
  created_at: string;
  reward_amount?: number;
}

const Voting: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    const { data, error } = await apiClient.invoke('api-governance', 'fetchTopics');
    
    if (!error && data) setTopics(data);
    setLoading(false);
  };

  const handleCreateTopic = async (values: TopicFormValues) => {
    const { error } = await apiClient.invoke('api-governance', 'createTopic', {
      title: { [i18n.language]: values.title, pt: values.title, en: values.title },
      content: { [i18n.language]: values.content, pt: values.content, en: values.content },
      rewardAmount: values.rewardAmount
    });

    if (!error) {
      setOpenDialog(false);
      fetchTopics();
    }
  };

  const handleCopyLink = async (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation();
    const ok = await copyToClipboard(buildTopicUrl(topicId));
    setNotice(ok ? t('voting.linkCopied', 'Link copiado!') : t('voting.linkCopyError', 'Não foi possível copiar o link.'));
  };

  const getLocalized = (json: any) => {
    if (!json) return '';
    if (typeof json === 'string') return json;
    return json[i18n.language] || json.en || json.pt || '';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rectangular" width={150} height={40} />
        </Box>
        <Stack spacing={2}>
          {[...Array(4)].map((_, i) => (
            <TopicCardSkeleton key={i} />
          ))}
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2 }}>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, fontWeight: 700 }}>{t('voting.title', 'Votações e Pautas')}</Typography>
        {profile?.roles?.includes('admin') && (
          <Button variant="contained" onClick={() => setOpenDialog(true)} fullWidth={true} sx={{ borderRadius: '12px' }}>
            {t('voting.createTopic', 'Criar Nova Pauta')}
          </Button>
        )}
      </Box>

      <Paper>
        <List>
          {topics.length === 0 ? (
             <ListItem><ListItemText primary={t('voting.noTopics', 'Nenhuma pauta encontrada.')} /></ListItem>
          ) : (
            topics.map(topic => (
              <ListItem 
                key={topic.id} 
                disablePadding
                sx={{ borderBottom: '1px solid #eee' }}
              >
                <ListItemButton onClick={() => navigate(`/voting/${topic.id}`)}>
                  <ListItemText 
                    primary={getLocalized(topic.title)} 
                    secondary={new Date(topic.created_at).toLocaleDateString()} 
                  />
                  <Tooltip title={t('voting.copyTopicLink', 'Copiar link da pauta')}>
                    <IconButton
                      aria-label={t('voting.copyTopicLink', 'Copiar link da pauta')}
                      onClick={(e) => handleCopyLink(e, topic.id)}
                      sx={{ mr: 1 }}
                    >
                      <LinkIcon size={18} />
                    </IconButton>
                  </Tooltip>
                  <Chip 
                    label={topic.status === 'open' ? t('voting.statusOpen', 'Aberta') : t('voting.statusClosed', 'Encerrada')} 
                    color={topic.status === 'open' ? 'success' : 'default'} 
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      <TopicFormDialog
        open={openDialog}
        mode="create"
        onClose={() => setOpenDialog(false)}
        onSubmit={handleCreateTopic}
      />
      <Snackbar open={notice !== null} autoHideDuration={2500} onClose={() => setNotice(null)} message={notice ?? ''} />
    </Container>
  );
};

export default Voting;
