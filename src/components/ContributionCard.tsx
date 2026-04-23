import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Chip, 
  LinearProgress, 
  Link,
  Avatar,
  Stack,
  Tooltip
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  OpenInNew as OpenInNewIcon,
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
  Help as PendingIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

interface ContributionCardProps {
  contribution: any;
  threshold: number;
  onRefresh: () => void;
}

const ContributionCard: React.FC<ContributionCardProps> = ({ contribution, threshold, onRefresh }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const confirmCount = contribution.confirmations?.[0]?.count || 0;
  const progress = (confirmCount / threshold) * 100;
  const isOwner = user?.id === contribution.user_id;
  const hasConfirmed = contribution.user_has_confirmed;
  const isCompleted = contribution.status === 'completed';

  const handleConfirm = async () => {
    if (loading || isOwner || hasConfirmed || isCompleted) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('confirm_contribution', {
        p_contribution_id: contribution.id
      });

      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      console.error('Error confirming contribution:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
              <PersonIcon fontSize="small" />
            </Avatar>
            <Typography variant="subtitle2" color="text.secondary">
              {contribution.profiles?.full_name || contribution.profiles?.email}
            </Typography>
          </Stack>
          <Chip 
            label={t(`work.${contribution.status}`)} 
            size="small" 
            color={getStatusColor(contribution.status) as any}
            icon={isCompleted ? <CheckCircleIcon /> : <PendingIcon />}
          />
        </Box>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {contribution.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <TrophyIcon color="warning" fontSize="small" />
          <Typography variant="body2" color="primary.main" fontWeight={700}>
            {contribution.amount_suggested} $S
          </Typography>
          <Typography variant="caption" color="text.secondary">
            • {t('work.beneficiary')}: {contribution.beneficiary_profiles?.full_name || t('work.tekua')}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          <Link href={contribution.evidence_url} target="_blank" rel="noopener" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            {t('work.evidence')} <OpenInNewIcon sx={{ fontSize: 14 }} />
          </Link>
        </Typography>

        <Box sx={{ mt: 'auto' }}>
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
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
            color={isCompleted ? 'success' : 'primary'}
          />

          {!isCompleted && (
            <Tooltip title={isOwner ? t('work.ownWorkError') : (hasConfirmed ? t('work.alreadyConfirmed') : '')}>
              <Box>
                <Button 
                  fullWidth 
                  variant={hasConfirmed ? "outlined" : "contained"}
                  startIcon={<CheckCircleIcon />}
                  onClick={handleConfirm}
                  disabled={loading || isOwner || hasConfirmed}
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  {hasConfirmed ? t('work.confirmed') : t('work.confirm')}
                </Button>
              </Box>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ContributionCard;
