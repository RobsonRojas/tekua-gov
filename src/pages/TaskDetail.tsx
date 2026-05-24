import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid, 
  Chip, 
  Avatar, 
  Divider, 
  CircularProgress,
  IconButton,
  Stack,
  LinearProgress,
  Tooltip,
  Alert
} from '@mui/material';
import { 
  ArrowLeft, 
  Share2, 
  Trophy, 
  CheckCircle2, 
  PlayCircle,
  User,
  MapPin
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { motion } from 'framer-motion';
import TaskInteractions from '../components/work/TaskInteractions';
import AttachmentList from '../components/common/AttachmentList';
import { QRCodeSVG } from 'qrcode.react';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const lang = i18n.language === 'pt' ? 'pt' : 'en';

  const fetchDetail = useCallback(async () => {
    if (!id || authLoading) return;
    setLoading(true);
    try {
      const { data, error } = await apiClient.invoke('api-work', 'fetchActivityDetail', { id });
      if (error) throw new Error(error);
      setActivity(data);
    } catch (err: any) {
      setError(err.message || 'Error loading task');
    } finally {
      setLoading(false);
    }
  }, [id, authLoading]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleAction = async () => {
    if (!activity) return;
    setActionLoading(true);
    try {
      if (activity.status === 'open' && activity.type === 'task') {
        const { error } = await apiClient.invoke('api-work', 'claimTask', { activityId: activity.id });
        if (error) throw new Error(error);
      } else if (activity.status === 'pending_validation') {
        const { error } = await apiClient.invoke('api-work', 'confirmActivity', { activityId: activity.id });
        if (error) throw new Error(error);
      }
      fetchDetail();
    } catch (err) {
      console.error('Error performing action:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // Could add a toast here
  };

  if (loading || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !activity) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || 'Task not found'}
        </Alert>
        <Button startIcon={<ArrowLeft />} onClick={() => navigate('/work-wall')} sx={{ mt: 2 }}>
          {t('common.back') || 'Voltar'}
        </Button>
      </Container>
    );
  }

  const title = activity.title?.[lang] || activity.title?.pt || 'Untitled';
  const description = activity.description?.[lang] || activity.description?.pt || 'No description';
  const isOwner = user?.id === activity.requester_id;
  const isWorker = user?.id === activity.worker_id;
  const confirmCount = activity.confirmations?.length || 0;
  const threshold = activity.min_confirmations || 3;
  const progress = (confirmCount / threshold) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'primary';
      case 'in_progress': return 'warning';
      case 'pending_validation': return 'info';
      case 'completed': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button 
            startIcon={<ArrowLeft />} 
            onClick={() => navigate('/work-wall')}
            sx={{ color: 'text.secondary' }}
          >
            {t('common.back') || 'Voltar ao Mural'}
          </Button>
          <IconButton onClick={handleShare} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
            <Share2 size={20} />
          </IconButton>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: '32px', 
            bgcolor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Status and Reward Header */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
            <Chip 
              label={t(`work.${activity.status}`)} 
              color={getStatusColor(activity.status) as any}
              sx={{ borderRadius: '12px', fontWeight: 700, px: 1 }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Trophy size={24} color="#f59e0b" />
              <Typography variant="h4" fontWeight={800} color="primary.main">
                {activity.reward_amount} $S
              </Typography>
            </Stack>
          </Box>

          <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
            {title}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7, mb: 5, whiteSpace: 'pre-wrap' }}>
            {description}
          </Typography>

          {/* New Attachments Section (Specifications) */}
          {activity.attachments && activity.attachments.filter((a: any) => !a.is_evidence).length > 0 && (
            <AttachmentList 
              attachments={activity.attachments.filter((a: any) => !a.is_evidence)} 
              title={t('work.demandAttachments') || 'Documentos de Referência'}
            />
          )}

          <Grid container spacing={4}>
            {/* Participants */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {t('work.participants') || 'Participantes'}
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={activity.requester?.avatar_url} sx={{ bgcolor: 'primary.main' }}>
                    <User size={20} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {activity.type === 'task' ? t('work.requester') : t('work.beneficiary')}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {activity.requester?.full_name || 'Tekuá'}
                    </Typography>
                  </Box>
                </Box>

                {activity.worker && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={activity.worker?.avatar_url} sx={{ bgcolor: 'secondary.main' }}>
                      <User size={20} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('work.executor') || 'Executor'}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {activity.worker.full_name}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Grid>

            {/* Validation Progress */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {t('work.validation') || 'Validação'}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {confirmCount} / {threshold} {t('work.confirmations')}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {Math.min(100, progress).toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, progress)} 
                  sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.05)' }}
                />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 5, borderColor: 'rgba(255,255,255,0.05)' }} />

          {/* Evidence Section */}
          {(activity.evidence && activity.evidence.length > 0 || activity.attachments?.some((a: any) => a.is_evidence)) && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                {t('work.evidence') || 'Evidências'}
              </Typography>
              
              {/* Render new attachments marked as evidence */}
              {activity.attachments && activity.attachments.filter((a: any) => a.is_evidence).length > 0 && (
                <AttachmentList 
                  attachments={activity.attachments.filter((a: any) => a.is_evidence)} 
                />
              )}

              <Grid container spacing={2}>
                {activity.evidence.map((ev: any) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={ev.id}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        borderRadius: '16px', 
                        bgcolor: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <Box 
                        component="img" 
                        src={ev.evidence_url} 
                        sx={{ width: '100%', borderRadius: '12px', mb: 2, cursor: 'pointer' }} 
                        onClick={() => window.open(ev.evidence_url, '_blank')}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {ev.created_at ? new Date(ev.created_at).toLocaleString() : ''}
                        </Typography>
                        {ev.location && (
                          <Tooltip title={JSON.stringify(ev.location)}>
                            <IconButton size="small">
                              <MapPin size={14} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Confirmations List */}
          {activity.confirmations && activity.confirmations.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                {t('work.history') || 'Histórico de Validação'}
              </Typography>
              <Stack spacing={2}>
                {activity.confirmations.map((conf: any) => (
                  <Box key={conf.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={conf.profile?.avatar_url} sx={{ width: 32, height: 32 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {conf.profile?.full_name} {t('work.confirmedThis') || 'confirmou esta atividade'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(conf.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Task Invitation */}
          {isOwner && activity.invite_token && activity.status === 'open' && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                {t('work.inviteExternal') || 'Convite Externo'}
              </Typography>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: '16px', 
                  bgcolor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2 }}>
                  <QRCodeSVG 
                    value={`${window.location.origin}/invite/task/${activity.invite_token}`} 
                    size={120} 
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Compartilhe este QR Code ou o link abaixo para permitir que pessoas externas se cadastrem na Tekuá e assumam esta tarefa.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        p: 1.5, 
                        bgcolor: 'rgba(0,0,0,0.2)', 
                        borderRadius: 1, 
                        flex: 1,
                        fontFamily: 'monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {`${window.location.origin}/invite/task/${activity.invite_token}`}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/invite/task/${activity.invite_token}`)}
                    >
                      Copiar
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}

          {/* Actions Footer */}
          <Box sx={{ mt: 2 }}>
            {activity.status === 'open' && activity.type === 'task' && (
              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                startIcon={<PlayCircle />}
                onClick={handleAction}
                disabled={actionLoading || isOwner}
                sx={{ borderRadius: '16px', py: 2, fontSize: '1.1rem', fontWeight: 700 }}
              >
                {t('work.accept') || 'Assumir Tarefa'}
              </Button>
            )}

            {activity.status === 'in_progress' && isWorker && (
              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                color="warning"
                startIcon={<CheckCircle2 />}
                onClick={() => navigate(`/tasks/${activity.id}/submit`)}
                sx={{ borderRadius: '16px', py: 2, fontSize: '1.1rem', fontWeight: 700 }}
              >
                {t('work.submit') || 'Concluir e Enviar'}
              </Button>
            )}

            {activity.status === 'pending_validation' && (
              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                startIcon={<CheckCircle2 />}
                onClick={handleAction}
                disabled={actionLoading || isWorker || activity.user_has_confirmed}
                sx={{ borderRadius: '16px', py: 2, fontSize: '1.1rem', fontWeight: 700 }}
              >
                {activity.user_has_confirmed ? (t('work.alreadyConfirmed') || 'Já Confirmado') : (t('work.confirm') || 'Confirmar Tarefa')}
              </Button>
            )}
          </Box>
        </Paper>

        <TaskInteractions activityId={activity.id} />
      </motion.div>
    </Container>
  );
};

export default TaskDetail;
