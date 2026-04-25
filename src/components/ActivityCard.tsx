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
  LinearProgress
} from '@mui/material';
import { 
  User, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  PlayCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';

interface ActivityCardProps {
  activity: any;
  onRefresh: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onRefresh }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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
      default: return undefined;
    }
  };

  const handleAction = async () => {
    setLoading(true);
    try {
      if (activity.status === 'open' && activity.type === 'task') {
        const { error } = await apiClient.invoke('api-work', 'claimTask', { activityId: activity.id });
        if (error) throw new Error(error);
      } else if (activity.status === 'pending_validation') {
        const { error } = await apiClient.invoke('api-work', 'confirmActivity', { activityId: activity.id });
        if (error) throw new Error(error);
      }
      onRefresh();
    } catch (err) {
      console.error('Error performing activity action:', err);
    } finally {
      setLoading(false);
    }
  };

  const evidenceUrl = activity.evidence?.[0]?.evidence_url;

  return (
    <Card elevation={0} sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      bgcolor: 'background.paper',
      transition: 'transform 0.2s, border-color 0.2s',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-4px)',
        borderColor: 'primary.main'
      }
    }}>
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
            label={t(`work.${activity.status}`)} 
            size="small" 
            color={getStatusColor(activity.status) as any}
            icon={getStatusIcon(activity.status)}
            sx={{ borderRadius: '8px', fontWeight: 600 }}
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <Trophy size={16} color="#f59e0b" />
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
              {activity.reward_amount} $S
            </Typography>
          </Stack>
        </Box>

        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
          {description}
        </Typography>

        {evidenceUrl && (
          <Box sx={{ mb: 2 }}>
             <Typography 
               variant="caption" 
               color="primary.main" 
               component="a" 
               href={evidenceUrl} 
               target="_blank" 
               rel="noopener noreferrer"
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
          {activity.status === 'open' && activity.type === 'task' && (
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

          {activity.status === 'in_progress' && isWorker && (
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

          {activity.status === 'pending_validation' && (
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
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
