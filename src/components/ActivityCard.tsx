import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Chip, 
  Avatar, 
  Stack, 
  Tooltip,
  LinearProgress,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  User, 
  Trophy, 
  CheckCircle2, 
  AlertCircle,
  PlayCircle,
  CheckCircle,
  Share2,
  Flame,
  Star,
  Paperclip,
  Trash2,
  GripVertical
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { EvidenceViewerModal } from './common/EvidenceViewerModal';

interface ActivityCardProps {
  activity: any;
  onRefresh: () => void;
  highlighted?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onRefresh, highlighted }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(activity.status);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewerState, setViewerState] = useState<{ open: boolean; url: string | null }>({ open: false, url: null });
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [justification, setJustification] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const lang = i18n.language === 'pt' ? 'pt' : 'en';

  const title = activity.title?.[lang] || activity.title?.pt || 'Untitled';
  const description = activity.description?.[lang] || activity.description?.pt || 'No description';
  
  const isOwner = user?.id === activity.requester_id;
  const isWorker = user?.id === activity.worker_id || (activity.executor_ids && activity.executor_ids.includes(user?.id));
  const isAdmin = profile?.roles?.includes('admin') || profile?.role === 'admin';
  const canConfirm = activity.validation_method === 'community_consensus' || 
                    (activity.validation_method === 'requester_approval' && (isOwner || isAdmin));
  const confirmCount = activity.confirmations?.[0]?.count || 0;
  const threshold = activity.min_confirmations || 3;
  const progress = (confirmCount / threshold) * 100;

  const handleAction = async () => {
    setLoading(true);
    try {
      if (localStatus === 'open' && activity.type === 'task') {
        const { error } = await apiClient.invoke('api-work', 'claimTask', { activityId: activity.id });
        if (error) throw new Error(error);
        setLocalStatus('in_progress');
      } else if (localStatus === 'pending_validation') {
        const { error } = await apiClient.invoke('api-work', 'confirmActivity', { activityId: activity.id });
        if (error) throw new Error(error);
        // We don't know the exact new status (could be completed or still pending_validation)
        // so we rely on the refresh, but for 'claimTask' it's definitely 'in_progress'
      }
      onRefresh();
    } catch (err) {
      console.error('Error performing activity action:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (action: 'approve' | 'reject') => {
    setLoading(true);
    try {
      const { error } = await apiClient.invoke('api-work', 'moderateActivity', { 
        activityId: activity.id, 
        action 
      });
      if (error) {
        setErrorMessage(typeof error === 'string' ? error : ((error as any).message || 'Erro ao processar ação.'));
        return;
      }
      onRefresh();
    } catch (err: any) {
      console.error('Error moderating activity:', err);
      setErrorMessage(err?.message || 'Erro ao processar ação.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/tasks/${activity.id}`;
    navigator.clipboard.writeText(url);
    setSnackbarOpen(true);
  };

  const handleDelete = async () => {
    if (justification.length < 10) return;
    setIsDeleting(true);
    try {
      const { error } = await apiClient.invoke('api-work', 'deleteActivity', {
        activityId: activity.id,
        justification
      });
      if (error) {
        setErrorMessage(typeof error === 'string' ? error : ((error as any).message || 'Erro ao remover atividade.'));
        return;
      }
      setDeleteModalOpen(false);
      onRefresh();
    } catch (err: any) {
      console.error('Error deleting activity:', err);
      setErrorMessage(err?.message || 'Erro ao remover atividade.');
    } finally {
      setIsDeleting(false);
    }
  };

  const evidenceUrl = activity.evidence?.[0]?.evidence_url;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      activityId: activity.id,
      sourceStatus: activity.status
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card 
      draggable={true}
      onDragStart={handleDragStart}
      elevation={0} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: '24px',
        border: highlighted ? '2px solid' : '1px solid rgba(255, 255, 255, 0.05)',
        borderColor: highlighted ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
        bgcolor: 'background.paper',
        transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
        boxShadow: highlighted ? '0 0 15px rgba(var(--mui-palette-primary-mainChannel), 0.3)' : 'none',
        overflow: 'hidden',
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
          opacity: 0.7
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'primary.main'
        }
      }} 
      onClick={() => navigate(`/tasks/${activity.id}`)}
    >
      {evidenceUrl && (
        <Box sx={{ height: 180, position: 'relative', overflow: 'hidden' }}>
          <Box
            component="img"
            src={evidenceUrl}
            alt={title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 0.3s',
              bgcolor: 'rgba(255,255,255,0.02)'
            }}
            onLoad={(e) => (e.currentTarget.style.opacity = '1')}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </Box>
      )}
      <CardContent sx={{ px: 2, py: 1.75, flexGrow: 1, display: 'flex', flexDirection: 'column', '&:last-child': { pb: 1.75 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ color: 'text.secondary', opacity: 0.6, cursor: 'grab', display: 'flex', alignItems: 'center' }}>
            <GripVertical size={16} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 'auto' }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Trophy size={14} color="#f59e0b" />
              <Typography variant="caption" fontWeight={800} color="primary.main" sx={{ whiteSpace: 'nowrap' }}>
                {activity.reward_amount} $S
              </Typography>
            </Stack>
            <Tooltip title={t('common.share', 'Compartilhar')}>
              <IconButton 
                size="small" 
                onClick={handleShare}
                title={t('common.share', 'Compartilhar')}
                sx={{ 
                  color: 'text.secondary', 
                  p: 0.25,
                  '&:hover': { color: 'primary.main', bgcolor: 'primary.mainChannel' } 
                }}
              >
                <Share2 size={14} />
              </IconButton>
            </Tooltip>
            {(profile?.roles?.includes('admin') || profile?.role === 'admin') && (
              <Tooltip title={t('common.delete', 'Remover Atividade')}>
                <IconButton 
                  size="small" 
                  onClick={(e) => { e.stopPropagation(); setDeleteModalOpen(true); }}
                  sx={{ 
                    color: 'text.secondary', 
                    p: 0.25,
                    '&:hover': { color: 'error.main', bgcolor: 'error.mainChannel' } 
                  }}
                >
                  <Trash2 size={14} />
                </IconButton>
              </Tooltip>
            )}
            {activity.attachments?.[0]?.count > 0 && (
              <Tooltip title={`${activity.attachments[0].count} ${t('work.attachments')}`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <Paperclip size={14} />
                  <Typography variant="caption" fontWeight={700}>
                    {activity.attachments[0].count}
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>

        {(activity.urgency || activity.importance) && (
          <Box sx={{ display: 'flex', gap: 0.75, mb: 1, flexWrap: 'wrap' }}>
            {activity.urgency && (
              <Chip 
                icon={<Flame size={12} />} 
                label={t('work.urgency', 'Urgente')} 
                size="small" 
                color="error" 
                variant="outlined"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, borderRadius: '6px' }}
              />
            )}
            {activity.importance && (
              <Chip 
                icon={<Star size={12} />} 
                label={t('work.importance', 'Importante')} 
                size="small" 
                color="warning" 
                variant="outlined"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, borderRadius: '6px' }}
              />
            )}
          </Box>
        )}

        <Typography 
          variant="subtitle1" 
          fontWeight={700} 
          sx={{ 
            mb: 0.75, 
            fontSize: '0.95rem', 
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2, 
            flexGrow: 1, 
            fontSize: '0.8rem',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {description}
        </Typography>

        {evidenceUrl && evidenceUrl.startsWith('http') && (
          <Box sx={{ mb: 1.5 }}>
             <Typography 
               variant="caption" 
               color="primary.main" 
               component="span" 
               onClick={(e) => { e.stopPropagation(); setViewerState({ open: true, url: evidenceUrl }); }}
               sx={{ textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', fontSize: '0.75rem' }}
             >
               <PlayCircle size={13} /> {t('work.viewEvidence', 'Ver Evidência')}
             </Typography>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75, alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.72rem' }}>
              {t('work.confirmations')}: {confirmCount} / {threshold}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.72rem' }}>
               {Math.min(100, progress).toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(100, progress)} 
            sx={{ height: 5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.05)' }}
          />
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Avatar sx={{ width: 22, height: 22, bgcolor: 'primary.main', fontSize: '0.7rem' }}>
              <User size={12} />
            </Avatar>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.72rem', maxWidth: '130px' }}>
              {activity.type === 'task' ? t('work.requester') : t('work.beneficiary')}: {activity.requester?.full_name || 'Tekuá'}
            </Typography>
          </Box>
          {activity.executors && activity.executors.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {activity.executors.slice(0, 3).map((executor: any, idx: number) => (
                <Tooltip key={executor.id || idx} title={executor.full_name}>
                  <Avatar src={executor.avatar_url} sx={{ width: 22, height: 22, bgcolor: 'secondary.main', fontSize: '0.7rem', ml: idx > 0 ? -1 : 0, border: '2px solid', borderColor: 'background.paper' }}>
                    <User size={12} />
                  </Avatar>
                </Tooltip>
              ))}
              {activity.executors.length > 3 && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontWeight: 700, fontSize: '0.7rem' }}>
                  +{activity.executors.length - 3}
                </Typography>
              )}
            </Box>
          )}
        </Stack>

        <Box sx={{ mt: 'auto' }}>
          {localStatus === 'open' && activity.type === 'task' && (
            <Button 
              fullWidth 
              size="small"
              variant="contained" 
              startIcon={<PlayCircle size={16} />}
              onClick={handleAction}
              disabled={loading || isOwner}
              sx={{ borderRadius: '10px', py: 1, fontSize: '0.8rem', fontWeight: 700, textTransform: 'none' }}
            >
              {t('work.accept', 'Assumir Tarefa')}
            </Button>
          )}

          {localStatus === 'in_progress' && isWorker && (
            <Button 
              fullWidth 
              size="small"
              variant="contained" 
              color="warning"
              startIcon={<CheckCircle2 size={16} />}
              onClick={() => navigate(`/tasks/${activity.id}/submit`)}
              sx={{ borderRadius: '10px', py: 1, fontSize: '0.8rem', fontWeight: 700, textTransform: 'none' }}
            >
              {t('work.submit', 'Concluir e Enviar')}
            </Button>
          )}

          {localStatus === 'pending_validation' && canConfirm && (
            <Tooltip title={isWorker ? t('work.ownWorkError') : ''}>
              <Box>
                <Button 
                  fullWidth 
                  size="small"
                  variant="outlined"
                  startIcon={<CheckCircle size={16} />}
                  onClick={handleAction}
                  disabled={loading || isWorker || activity.user_has_confirmed}
                  sx={{ borderRadius: '10px', py: 1, fontSize: '0.8rem', fontWeight: 700, textTransform: 'none' }}
                >
                  {activity.user_has_confirmed ? 'Já Confirmado' : t('work.confirm')}
                </Button>
              </Box>
            </Tooltip>
          )}

          {localStatus === 'pending_approval' && (profile?.roles?.includes('admin') || profile?.roles?.includes('transversal_council')) && (
            <Stack direction="row" spacing={1}>
              <Button 
                fullWidth 
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<CheckCircle size={15} />}
                onClick={(e) => { e.stopPropagation(); handleModeration('approve'); }}
                disabled={loading}
                sx={{ borderRadius: '10px', py: 0.8, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none' }}
              >
                {t('common.approve', 'Aprovar')}
              </Button>
              <Button 
                fullWidth 
                size="small"
                variant="outlined"
                color="error"
                startIcon={<AlertCircle size={15} />}
                onClick={(e) => { e.stopPropagation(); handleModeration('reject'); }}
                disabled={loading}
                sx={{ borderRadius: '10px', py: 0.8, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none' }}
              >
                {t('common.reject', 'Reprovar')}
              </Button>
            </Stack>
          )}
        </Box>
      </CardContent>

      <Snackbar
        open={snackbarOpen || !!errorMessage}
        autoHideDuration={3000}
        onClose={() => { setSnackbarOpen(false); setErrorMessage(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {errorMessage ? (
          <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%', borderRadius: '12px' }}>
            {errorMessage}
          </Alert>
        ) : (
          <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', borderRadius: '12px' }}>
            {t('work.linkCopied', 'Link da tarefa copiado!')}
          </Alert>
        )}
      </Snackbar>

      <Dialog 
        open={deleteModalOpen} 
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>{t('work.deleteTitle', 'Remover Atividade')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('work.deleteConfirmMessage', 'Tem certeza que deseja remover esta atividade? Esta ação exige uma justificativa e será auditada.')}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="justification"
            label={t('work.justification', 'Justificativa')}
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            disabled={isDeleting}
            error={justification.length > 0 && justification.length < 10}
            helperText={justification.length > 0 && justification.length < 10 ? 'Mínimo de 10 caracteres' : ''}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={isDeleting || justification.length < 10}
          >
            {isDeleting ? (t('common.loading', 'Processando...')) : (t('common.delete', 'Remover'))}
          </Button>
        </DialogActions>
      </Dialog>
      
      <EvidenceViewerModal 
        open={viewerState.open}
        evidenceUrl={viewerState.url}
        onClose={() => setViewerState({ open: false, url: null })}
      />
    </Card>
  );
};

export default ActivityCard;
