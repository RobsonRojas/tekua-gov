import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Stack, 
  Chip
} from '@mui/material';
import { 
  PlusCircle, 
  PlayCircle, 
  Upload, 
  CheckCircle2, 
  Trophy, 
  History,
  XCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface ActionHistoryEvent {
  id: string;
  type: 'creation' | 'claimed' | 'evidence' | 'confirmation' | 'completed' | 'rejected';
  title: string;
  actorName: string;
  actorAvatar?: string;
  timestamp: string;
  description?: string;
  icon: React.ReactNode;
  color: string;
}

interface DemandActionHistoryProps {
  activity: any;
}

export const DemandActionHistory: React.FC<DemandActionHistoryProps> = ({ activity }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'pt' ? 'pt' : 'en';

  if (!activity) return null;

  const events: ActionHistoryEvent[] = [];

  // 1. Demand Creation Event
  if (activity.created_at) {
    const titleText = activity.title?.[lang] || activity.title?.pt || '';
    events.push({
      id: `creation-${activity.id}`,
      type: 'creation',
      title: t('work.historyEventCreated') || 'Demanda Criada',
      actorName: activity.requester?.full_name || t('work.requester') || 'Solicitante',
      actorAvatar: activity.requester?.avatar_url,
      timestamp: activity.created_at,
      description: `${t('work.reward') || 'Recompensa'}: ${activity.reward_amount} $S - "${titleText}"`,
      icon: <PlusCircle size={18} color="#3b82f6" />,
      color: 'primary.main'
    });
  }

  // 2. Claimed / Executor Assignment Event
  if (activity.executors && activity.executors.length > 0) {
    activity.executors.forEach((executor: any, idx: number) => {
      events.push({
        id: `claimed-${executor.id || idx}`,
        type: 'claimed',
        title: t('work.historyEventClaimed') || 'Tarefa Assumida',
        actorName: executor.full_name || t('work.executor') || 'Executor',
        actorAvatar: executor.avatar_url,
        timestamp: activity.updated_at || activity.created_at,
        description: t('work.historyClaimedDesc') || 'Executor atribuído à demanda',
        icon: <PlayCircle size={18} color="#eab308" />,
        color: 'warning.main'
      });
    });
  } else if (activity.worker) {
    events.push({
      id: `claimed-${activity.worker.id}`,
      type: 'claimed',
      title: t('work.historyEventClaimed') || 'Tarefa Assumida',
      actorName: activity.worker.full_name || t('work.executor') || 'Executor',
      actorAvatar: activity.worker.avatar_url,
      timestamp: activity.updated_at || activity.created_at,
      description: t('work.historyClaimedDesc') || 'Executor começou o trabalho',
      icon: <PlayCircle size={18} color="#eab308" />,
      color: 'warning.main'
    });
  }

  // 3. Evidence Submissions
  if (activity.evidence && activity.evidence.length > 0) {
    activity.evidence.forEach((ev: any) => {
      events.push({
        id: `evidence-${ev.id}`,
        type: 'evidence',
        title: t('work.historyEventEvidence') || 'Evidência de Conclusão Enviada',
        actorName: activity.worker?.full_name || activity.executors?.[0]?.full_name || t('work.executor') || 'Executor',
        actorAvatar: activity.worker?.avatar_url || activity.executors?.[0]?.avatar_url,
        timestamp: ev.created_at || activity.updated_at,
        description: t('work.historyEvidenceDesc') || 'Fotos ou documentos enviados como comprovação',
        icon: <Upload size={18} color="#a855f7" />,
        color: 'secondary.main'
      });
    });
  }

  // 4. Confirmations
  if (activity.confirmations && activity.confirmations.length > 0) {
    activity.confirmations.forEach((conf: any) => {
      events.push({
        id: `confirmation-${conf.id}`,
        type: 'confirmation',
        title: t('work.historyEventConfirmed') || 'Confirmação Registrada',
        actorName: conf.profile?.full_name || t('work.communityMember') || 'Membro da Comunidade',
        actorAvatar: conf.profile?.avatar_url,
        timestamp: conf.created_at,
        description: t('work.historyConfirmedDesc') || 'Validação de conclusão aprovada',
        icon: <CheckCircle2 size={18} color="#22c55e" />,
        color: 'success.main'
      });
    });
  }

  // 5. Completed / Payout Event
  if (activity.status === 'completed') {
    events.push({
      id: `completed-${activity.id}`,
      type: 'completed',
      title: t('work.historyEventCompleted') || 'Demanda Concluída e Finalizada',
      actorName: 'Sistema Tekuá',
      timestamp: activity.updated_at || activity.created_at,
      description: `${t('work.payoutDistributed') || 'Pagamento de'} ${activity.reward_amount} $S ${t('work.distributedSuccessfully') || 'distribuído aos executores.'}`,
      icon: <Trophy size={18} color="#f59e0b" />,
      color: 'warning.main'
    });
  } else if (activity.status === 'rejected') {
    events.push({
      id: `rejected-${activity.id}`,
      type: 'rejected',
      title: t('work.historyEventRejected') || 'Demanda Rejeitada',
      actorName: 'Administração',
      timestamp: activity.updated_at || activity.created_at,
      description: t('work.historyRejectedDesc') || 'A demanda foi rejeitada ou cancelada.',
      icon: <XCircle size={18} color="#ef4444" />,
      color: 'error.main'
    });
  }

  // Sort events chronologically (oldest first or newest first)
  // Let's sort oldest first for chronological flow
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <Box sx={{ mb: 5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <History size={22} color="#10b981" />
        <Typography variant="h6" fontWeight={700}>
          {t('work.actionHistoryTitle') || 'Histórico de Ações Realizadas'}
        </Typography>
        <Chip 
          label={`${events.length}`} 
          size="small" 
          sx={{ bgcolor: 'rgba(255,255,255,0.08)', fontWeight: 700, borderRadius: '8px' }} 
        />
      </Box>

      {events.length === 0 ? (
        <Paper
          sx={{
            p: 3,
            borderRadius: '16px',
            bgcolor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('work.noActionHistory') || 'Nenhuma ação registrada até o momento.'}
          </Typography>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: '24px',
            bgcolor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <Stack spacing={0} sx={{ position: 'relative' }}>
            {events.map((ev, index) => {
              const isLast = index === events.length - 1;
              const formattedDate = new Date(ev.timestamp).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Box sx={{ display: 'flex', gap: 2.5, position: 'relative', pb: isLast ? 0 : 3 }}>
                    {/* Vertical timeline line connector */}
                    {!isLast && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 19,
                          top: 38,
                          bottom: 0,
                          width: '2px',
                          bgcolor: 'rgba(255,255,255,0.08)'
                        }}
                      />
                    )}

                    {/* Timeline Node Badge Icon */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                        flexShrink: 0
                      }}
                    >
                      {ev.icon}
                    </Box>

                    {/* Content Body */}
                    <Box sx={{ flex: 1, pt: 0.5 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                          {ev.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>
                          {formattedDate}
                        </Typography>
                      </Box>

                      {/* Actor info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, mb: 0.5 }}>
                        <Avatar src={ev.actorAvatar} sx={{ width: 22, height: 22, fontSize: '0.75rem' }}>
                          {ev.actorName.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          {ev.actorName}
                        </Typography>
                      </Box>

                      {ev.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, opacity: 0.9 }}>
                          {ev.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </motion.div>
              );
            })}
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default DemandActionHistory;
