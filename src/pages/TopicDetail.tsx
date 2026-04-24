import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Container, TextField, Divider, Avatar } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

interface Topic {
  id: string;
  title: any;
  content: any;
  status: 'open' | 'closed';
}

interface Comment {
  id: string;
  user_id: string;
  content: any; // Localized object
  created_at: string;
  profiles: { full_name: string; avatar_url: string };
}

interface VoteStats {
  yes: number;
  no: number;
  abstain: number;
}

const TopicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [voteStats, setVoteStats] = useState<VoteStats>({ yes: 0, no: 0, abstain: 0 });
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (id) {
      fetchTopicData();
    }
  }, [id, user]);

  const fetchTopicData = async () => {
    setLoading(true);
    
    // Fetch Topic
    const { data: topicData } = await supabase.from('discussion_topics').select('*').eq('id', id).single();
    if (topicData) setTopic(topicData);

    // Fetch Comments
    const { data: commentsData } = await supabase
      .from('topic_comments')
      .select('*, profiles(full_name, avatar_url)')
      .eq('topic_id', id)
      .order('created_at', { ascending: true });
    if (commentsData) setComments(commentsData as any);

    // Fetch Votes Stats
    const { data: votesData } = await supabase.from('topic_votes').select('option, user_id').eq('topic_id', id);
    if (votesData) {
      const stats = { yes: 0, no: 0, abstain: 0 };
      let userVoted = false;
      votesData.forEach(v => {
        if (v.option === 'yes') stats.yes++;
        if (v.option === 'no') stats.no++;
        if (v.option === 'abstain') stats.abstain++;
        if (user && v.user_id === user.id) userVoted = true;
      });
      setVoteStats(stats);
      setHasVoted(userVoted);
    }

    setLoading(false);
  };

  const handleVote = async (option: 'yes' | 'no' | 'abstain') => {
    if (!user || !id) return;
    const { error } = await supabase.from('topic_votes').insert([{ topic_id: id, user_id: user.id, option }]);
    if (!error) {
      setHasVoted(true);
      fetchTopicData(); // refresh stats
    } else {
      alert(t('voting.voteError', 'Erro ao registrar voto. Talvez você já tenha votado.'));
    }
  };

  const handleComment = async () => {
    if (!user || !id || !newComment.trim()) return;
    const contentObj = { [i18n.language]: newComment };
    // Add other language as same text for now to avoid empty fields
    if (i18n.language === 'pt') contentObj.en = newComment;
    else contentObj.pt = newComment;

    const { error } = await supabase.from('topic_comments').insert([{ 
      topic_id: id, 
      user_id: user.id, 
      content: contentObj 
    }]);
    if (!error) {
      setNewComment('');
      fetchTopicData();
    }
  };

  const getLocalized = (json: any) => {
    if (!json) return '';
    if (typeof json === 'string') return json;
    return json[i18n.language] || json.en || json.pt || '';
  };

  if (loading || !topic) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  const totalVotes = voteStats.yes + voteStats.no + voteStats.abstain;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>{getLocalized(topic.title)}</Typography>
        <Box sx={{ mt: 2, mb: 4 }} dangerouslySetInnerHTML={{ __html: getLocalized(topic.content) }} />
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" gutterBottom>{t('voting.castVote', 'Registrar Voto')}</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button variant="contained" color="success" disabled={hasVoted || topic.status === 'closed'} onClick={() => handleVote('yes')}>
            {t('voting.yes', 'Sim')} ({voteStats.yes})
          </Button>
          <Button variant="contained" color="error" disabled={hasVoted || topic.status === 'closed'} onClick={() => handleVote('no')}>
            {t('voting.no', 'Não')} ({voteStats.no})
          </Button>
          <Button variant="outlined" color="inherit" disabled={hasVoted || topic.status === 'closed'} onClick={() => handleVote('abstain')}>
            {t('voting.abstain', 'Abstenção')} ({voteStats.abstain})
          </Button>
        </Box>

        {hasVoted && (
          <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
            {t('voting.voteRecorded', 'Seu voto foi registrado com sucesso.')}
          </Typography>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Total de votos: {totalVotes}</Typography>
          {/* Simple progress bar representation */}
          <Box sx={{ display: 'flex', height: 20, width: '100%', mt: 1, borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ width: totalVotes ? `${(voteStats.yes/totalVotes)*100}%` : 0, bgcolor: 'success.main' }} />
            <Box sx={{ width: totalVotes ? `${(voteStats.no/totalVotes)*100}%` : 0, bgcolor: 'error.main' }} />
            <Box sx={{ width: totalVotes ? `${(voteStats.abstain/totalVotes)*100}%` : 0, bgcolor: 'grey.400' }} />
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>{t('voting.comments', 'Comentários')}</Typography>
        <Box sx={{ mb: 3 }}>
          {comments.map(c => (
            <Box key={c.id} sx={{ display: 'flex', mb: 2 }}>
              <Avatar src={c.profiles?.avatar_url} sx={{ mr: 2 }} />
              <Box>
                <Typography variant="subtitle2">{c.profiles?.full_name}</Typography>
                <Typography variant="body2" color="text.secondary">{new Date(c.created_at).toLocaleString()}</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>{getLocalized(c.content)}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField 
            fullWidth 
            multiline 
            rows={2} 
            variant="outlined" 
            placeholder={t('voting.addComment', 'Adicione um comentário...')} 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button variant="contained" onClick={handleComment} disabled={!newComment.trim()}>
            {t('voting.send', 'Enviar')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TopicDetail;
