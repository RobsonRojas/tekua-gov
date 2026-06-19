import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemButton, ListItemText, Chip, Container, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Skeleton } from '@mui/material';
import RichTextEditor from '../components/common/RichTextEditor';
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
}

const Voting: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    const { data, error } = await apiClient.invoke('api-governance', 'fetchTopics');
    
    if (!error && data) setTopics(data);
    setLoading(false);
  };

  const handleCreateTopic = async () => {
    const { error } = await apiClient.invoke('api-governance', 'createTopic', {
      title: { [i18n.language]: newTopicTitle, pt: newTopicTitle, en: newTopicTitle },
      content: { [i18n.language]: newTopicContent, pt: newTopicContent, en: newTopicContent }
    });
    
    if (!error) {
      setOpenDialog(false);
      setNewTopicTitle('');
      setNewTopicContent('');
      fetchTopics();
    }
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

      {/* Dialog for Creating Topic */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('voting.createTopic', 'Criar Nova Pauta')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('voting.topicTitle', 'Título da Pauta')}
            fullWidth
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <RichTextEditor
            value={newTopicContent}
            onChange={setNewTopicContent}
            placeholder={t('voting.topicContent', 'Conteúdo da Pauta')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('common.cancel', 'Cancelar')}</Button>
          <Button onClick={handleCreateTopic} variant="contained" disabled={!newTopicTitle || !newTopicContent}>
            {t('common.save', 'Salvar')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Voting;
