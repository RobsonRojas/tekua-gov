import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemButton, ListItemText, Chip, Container, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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
    const { data } = await supabase
      .from('discussion_topics')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setTopics(data);
    setLoading(false);
  };

  const handleCreateTopic = async () => {
    const { error } = await supabase
      .from('discussion_topics')
      .insert([
        { 
          title: { [i18n.language]: newTopicTitle, pt: newTopicTitle, en: newTopicTitle },
          content: { [i18n.language]: newTopicContent, pt: newTopicContent, en: newTopicContent },
          status: 'open'
        }
      ]);
    
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('voting.title', 'Votações e Pautas')}</Typography>
        {profile?.role === 'admin' && (
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
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
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('voting.topicContent', 'Conteúdo da Pauta')}</Typography>
          <ReactQuill theme="snow" value={newTopicContent} onChange={setNewTopicContent} />
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
