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
  Alert
} from '@mui/material';
import { 
  User, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  PlayCircle,
  CheckCircle,
  HelpCircle,
  Share2,
  ShieldAlert,
  Flame,
  Star
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';

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
  const lang = i18n.language === 'pt' ? 'pt' : 'en';

  const title = activity.title?.[lang] || activity.title?.pt || 'Untitled';
  const description = activity.description?.[lang] || activity.description?.pt || 'No description';
  
  const isOwner = user?.id === activity.requester_id;
  const isWorker = user?.id === activity.worker_id;
  const confirmCount = activity.confirmations?.[0]?.count || 0;
  const threshold = activity.min_confirmations || 3;
  const progress = (confirmCount / threshold) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'primary';
      case 'in_progress': return 'warning';
      case 'pending_validation': return 'info';
      case 'completed': return 'success';
      case 'rejected': return 'error';
      case 'pending_approval': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <HelpCircle size={16} />;
      case 'in_progress': return <Clock size={16} />;
      case 'pending_validation': return <AlertCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'rejected': return <AlertCircle size={16} />;
      case 'pending_approval': return <ShieldAlert size={16} />;
      default: return undefined;
    }
  };

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

  const evidenceUrl = activity.evidence?.[0]?.evidence_url;

  return (
    <Card elevation={0} sx={{ 
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
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
      borderColor: 'primary.main'
    }
  }} onClick={() => navigate(`/tasks/${activity.id}`)}>
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
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip 
            label={t(`work.${localStatus}`)} 
            size="small" 
            color={getStatusColor(localStatus) as any}
            icon={getStatusIcon(localStatus)}
            sx={{ borderRadius: '8px', fontWeight: 600 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Trophy size={16} color="#f59e0b" />
              <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                {activity.reward_amount} $S
              </Typography>
            </Stack>
            <Tooltip title={t('common.share') || 'Compartilhar'}>
              <IconButton 
                size="small" 
                onClick={handleShare}
                title={t('common.share') || 'Compartilhar'}
                sx={{ 
                  color: 'text.secondary', 
                  p: 0.5,
                  '&:hover': { color: 'primary.main', bgcolor: 'primary.mainChannel' } 
                }}
              >
                <Share2 size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {(activity.urgency || activity.importance) && (
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            {activity.urgency && (
              <Chip 
                icon={<Flame size={12} />} 
                label={t('work.urgency') || 'Urgente'} 
                size="small" 
                color="error" 
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, borderRadius: '6px' }}
              />
            )}
            {activity.importance && (
              <Chip 
                icon={<Star size={12} />} 
                label={t('work.importance') || 'Importante'} 
                size="small" 
                color="warning" 
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, borderRadius: '6px' }}
              />
            )}
          </Box>
        )}

        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
          {description}
        </Typography>

        {evidenceUrl && evidenceUrl.startsWith('http') && (
          <Box sx={{ mb: 2 }}>
             <Typography 
               variant="caption" 
               color="primary.main" 
               component="a" 
               href={evidenceUrl} 
               target="_blank" 
               rel="noopener noreferrer"
               onClick={(e) => e.stopPropagation()}
               sx={{ textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}
             >
               <PlayCircle size={14} /> {t('work.viewEvidence') || 'Ver Evidência'}
             </Typography>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {t('work.confirmations')}: {confirmCount} / {threshold}
            </Typography>
            <Typography variant="caption" color="text.secondary">
               {Math.min(100, progress).toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(100, progress)} 
            sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)' }}
          />
        </Box>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
              <User size={14} />
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {activity.type === 'task' ? t('work.requester') : t('work.beneficiary')}: {activity.requester?.full_name || 'Tekuá'}
            </Typography>
          </Box>
          {activity.worker && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main', fontSize: '0.75rem' }}>
                <User size={14} />
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {activity.worker.full_name}
              </Typography>
            </Box>
          )}
        </Stack>

        <Box sx={{ mt: 'auto' }}>
          {localStatus === 'open' && activity.type === 'task' && (
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<PlayCircle size={18} />}
              onClick={handleAction}
              disabled={loading || isOwner}
              sx={{ borderRadius: '12px', py: 1.5 }}
            >
              {t('work.accept') || 'Assumir Tarefa'}
            </Button>
          )}

          {localStatus === 'in_progress' && isWorker && (
            <Button 
              fullWidth 
              variant="contained" 
              color="warning"
              startIcon={<CheckCircle2 size={18} />}
              onClick={() => navigate(`/tasks/${activity.id}/submit`)}
              sx={{ borderRadius: '12px', py: 1.5 }}
            >
              {t('work.submit') || 'Concluir e Enviar'}
            </Button>
          )}

          {localStatus === 'pending_validation' && (
            <Tooltip title={isWorker ? t('work.ownWorkError') : ''}>
              <Box>
                <Button 
                  fullWidth 
                  variant="outlined"
                  startIcon={<CheckCircle size={18} />}
                  onClick={handleAction}
                  disabled={loading || isWorker}
                  sx={{ borderRadius: '12px', py: 1.5 }}
                >
                  {t('work.confirm')}
                </Button>
              </Box>
            </Tooltip>
          )}

          {localStatus === 'pending_approval' && (profile?.roles?.includes('admin') || profile?.roles?.includes('transversal_council')) && (
            <Stack direction="row" spacing={2}>
              <Button 
                fullWidth 
                variant="contained"
                color="secondary"
                startIcon={<CheckCircle size={18} />}
                onClick={(e) => { e.stopPropagation(); handleModeration('approve'); }}
                disabled={loading}
                sx={{ borderRadius: '12px', py: 1.5 }}
              >
                {t('common.approve', 'Aprovar')}
              </Button>
              <Button 
                fullWidth 
                variant="outlined"
                color="error"
                startIcon={<AlertCircle size={18} />}
                onClick={(e) => { e.stopPropagation(); handleModeration('reject'); }}
                disabled={loading}
                sx={{ borderRadius: '12px', py: 1.5 }}
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
            {t('work.linkCopied') || 'Link da tarefa copiado!'}
          </Alert>
        )}
      </Snackbar>
    </Card>
  );
};

export default ActivityCard;
