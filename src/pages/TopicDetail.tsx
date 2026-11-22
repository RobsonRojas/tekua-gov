import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Container, Divider, Avatar, IconButton, Tooltip, Snackbar, Chip } from '@mui/material';
import { Link as LinkIcon } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';
import SanitizedHTML from '../components/common/SanitizedHTML';
import MentionTextField from '../components/common/MentionTextField';
import { buildCommentThreads, splitMentions } from './topicComments';
import TopicFormDialog, { type TopicFormValues } from '../components/voting/TopicFormDialog';
import { buildCommentUrl, buildTopicUrl, commentIdFromHash, copyToClipboard } from '../lib/topicLinks';

interface Topic {
  id: string;
  title: any;
  content: any;
  status: 'open' | 'closed';
  created_by?: string;
  reward_amount?: number;
}

interface Comment {
  id: string;
  user_id: string;
  content: any; // Localized object
  created_at: string;
  parent_id?: string | null;
  mentioned_user_ids?: string[];
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
  const { user, profile } = useAuth();
  const location = useLocation();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [voteStats, setVoteStats] = useState<VoteStats>({ yes: 0, no: 0, abstain: 0 });
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newMentions, setNewMentions] = useState<string[]>([]);
  const [mentionedProfiles, setMentionedProfiles] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyMentions, setReplyMentions] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchTopicData();
    }
  }, [id, user]);

  useEffect(() => {
    if (loading) return;
    const cid = commentIdFromHash(location.hash);
    if (!cid) return;
    const el = document.getElementById(`comment-${cid}`);
    if (el) {
      el.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      setHighlightId(cid);
      const timer = setTimeout(() => setHighlightId(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [loading, location.hash, comments.length]);

  const fetchTopicData = async () => {
    setLoading(true);
    
    const { data, error } = await apiClient.invoke('api-governance', 'fetchTopicDetail', { id });
    
    if (!error && data) {
      setTopic(data.topic);
      setComments(data.comments || []);
      setVoteStats(data.stats || { yes: 0, no: 0, abstain: 0 });
      setHasVoted(data.userVoted);
      setMentionedProfiles(data.mentionedProfiles || {});
    }

    setLoading(false);
  };

  const handleVote = async (option: 'yes' | 'no' | 'abstain') => {
    if (!user || !id) return;
    const { data, error } = await apiClient.invoke('api-governance', 'castVote', { topicId: id, option });
    if (!error) {
      showReward(data?.reward?.amount);
      setHasVoted(true);
      fetchTopicData(); // refresh stats
    } else {
      const msg = typeof error === 'string' ? error : (error as any)?.message || t('voting.voteError', 'Erro ao registrar voto. Talvez você já tenha votado.');
      setNotice(msg);
    }
  };

  const showReward = (amount?: number) => {
    if (amount && amount > 0) {
      setNotice(t('voting.rewardReceived', 'Você recebeu {{amount}} surreais por participar!', { amount }));
    }
  };

  const handleCopy = async (url: string) => {
    const ok = await copyToClipboard(url);
    setNotice(ok ? t('voting.linkCopied', 'Link copiado!') : t('voting.linkCopyError', 'Não foi possível copiar o link.'));
  };

  const handleEditTopic = async (values: TopicFormValues) => {
    if (!id) return;
    const { error } = await apiClient.invoke('api-governance', 'updateTopic', {
      id,
      title: { [i18n.language]: values.title, pt: values.title, en: values.title },
      content: { [i18n.language]: values.content, pt: values.content, en: values.content },
      rewardAmount: values.rewardAmount,
    });
    if (error) {
      setNotice(t('voting.editError', 'Não foi possível salvar a pauta.'));
      return;
    }
    setEditOpen(false);
    fetchTopicData();
  };

  const isAdmin = !!profile?.roles?.includes('admin');

  const submitComment = async (text: string, mentions: string[], parentId?: string) => {
    if (!user || !id || !text.trim()) return false;
    const contentObj: Record<string, string> = { [i18n.language]: text };
    // Add other language as same text for now to avoid empty fields
    if (i18n.language === 'pt') contentObj.en = text;
    else contentObj.pt = text;

    const { data, error } = await apiClient.invoke('api-governance', 'addComment', {
      topicId: id,
      content: contentObj,
      mentionedUserIds: mentions,
      ...(parentId ? { parentId } : {}),
    });
    if (error) {
      const msg = typeof error === 'string' ? error : (error as any)?.message || t('voting.commentError', 'Não foi possível enviar o comentário.');
      setNotice(msg);
      return false;
    }
    showReward(data?.reward?.amount);
    fetchTopicData();
    return true;
  };

  const handleComment = async () => {
    if (await submitComment(newComment, newMentions)) {
      setNewComment('');
      setNewMentions([]);
    }
  };

  const handleReply = async (parentId: string) => {
    if (await submitComment(replyText, replyMentions, parentId)) {
      setReplyText('');
      setReplyMentions([]);
      setReplyingTo(null);
    }
  };

  const renderContent = (c: Comment) => {
    const names = (c.mentioned_user_ids || []).map((uid) => mentionedProfiles[uid]).filter(Boolean);
    return splitMentions(getLocalized(c.content), names).map((part, i) =>
      part.mention
        ? <Box component="span" key={i} sx={{ color: 'primary.main', fontWeight: 600 }}>{part.text}</Box>
        : <React.Fragment key={i}>{part.text}</React.Fragment>
    );
  };

  const renderComment = (c: Comment, isReply: boolean, rootId: string) => (
    <Box
      key={c.id}
      id={`comment-${c.id}`}
      sx={{
        display: 'flex', mb: 2, ml: isReply ? 6 : 0, p: 1, borderRadius: 1,
        bgcolor: highlightId === c.id ? 'action.selected' : 'transparent', transition: 'background-color 0.4s',
      }}
    >
      <Avatar src={c.profiles?.avatar_url} sx={{ mr: 2 }} />
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="subtitle2">{c.profiles?.full_name}</Typography>
          <Tooltip title={t('voting.copyCommentLink', 'Copiar link do comentário')}>
            <IconButton
              size="small"
              aria-label={t('voting.copyCommentLink', 'Copiar link do comentário')}
              onClick={() => id && handleCopy(buildCommentUrl(id, c.id))}
            >
              <LinkIcon size={14} />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body2" color="text.secondary">{new Date(c.created_at).toLocaleString()}</Typography>
        <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{renderContent(c)}</Typography>
        {topic && topic.status !== 'closed' && (
          <Button size="small" sx={{ mt: 0.5 }} onClick={() => { setReplyingTo(c.id); setReplyText(''); setReplyMentions([]); }}>
            {t('voting.reply', 'Responder')}
          </Button>
        )}
        {replyingTo === c.id && (
          <Box sx={{ mt: 1 }}>
            <MentionTextField
              autoFocus
              value={replyText}
              onChange={setReplyText}
              mentionedUserIds={replyMentions}
              onMentionedUserIdsChange={setReplyMentions}
              placeholder={t('voting.writeReply', 'Escreva uma resposta...')}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button variant="contained" size="small" onClick={() => handleReply(rootId)} disabled={!replyText.trim()}>
                {t('voting.send', 'Enviar')}
              </Button>
              <Button size="small" onClick={() => setReplyingTo(null)}>{t('common.cancel', 'Cancelar')}</Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );

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
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Typography variant="h4" sx={{ flex: 1, minWidth: 200 }}>{getLocalized(topic.title)}</Typography>
          {!!topic.reward_amount && topic.reward_amount > 0 && topic.status !== 'closed' && (
            <Chip color="success" variant="outlined" label={t('voting.rewardChip', '+{{amount}} surreais por participar', { amount: topic.reward_amount })} />
          )}
          <Button size="small" startIcon={<LinkIcon size={16} />} onClick={() => id && handleCopy(buildTopicUrl(id))}>
            {t('voting.copyTopicLink', 'Copiar link da pauta')}
          </Button>
          {isAdmin && (
            <Button size="small" onClick={() => setEditOpen(true)}>{t('voting.editTopic', 'Editar Pauta')}</Button>
          )}
        </Box>
        <Box
          sx={{
            mt: 2,
            mb: 4,
            maxWidth: '100%',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            '& img': { maxWidth: '100%', height: 'auto' },
            '& pre, & code': { whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
          }}
        >
          {getLocalized(topic.content).startsWith('<') ? (
            <SanitizedHTML html={getLocalized(topic.content)} />
          ) : (
            <Box sx={{ whiteSpace: 'pre-wrap', '& p': { mb: 2 } }}>{getLocalized(topic.content)}</Box>
          )}
        </Box>
        
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
          {buildCommentThreads(comments).map(({ comment, replies }) => (
            <React.Fragment key={comment.id}>
              {renderComment(comment, false, comment.id)}
              {replies.map(r => renderComment(r, true, comment.id))}
            </React.Fragment>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <MentionTextField
            value={newComment}
            onChange={setNewComment}
            mentionedUserIds={newMentions}
            onMentionedUserIdsChange={setNewMentions}
            placeholder={t('voting.addComment', 'Adicione um comentário...')}
            disabled={topic.status === 'closed'}
          />
          <Button variant="contained" onClick={handleComment} disabled={!newComment.trim() || topic.status === 'closed'}>
            {t('voting.send', 'Enviar')}
          </Button>
        </Box>
      </Paper>
      <TopicFormDialog
        open={editOpen}
        mode="edit"
        initial={{ title: getLocalized(topic.title), content: getLocalized(topic.content), rewardAmount: topic.reward_amount ?? 0 }}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditTopic}
      />
      <Snackbar open={notice !== null} autoHideDuration={3000} onClose={() => setNotice(null)} message={notice ?? ''} />
    </Container>
  );
};

export default TopicDetail;
