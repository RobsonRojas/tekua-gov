import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Fab,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Mms as MuralIcon,
  ViewColumn as KanbanIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';
import WorkFilters from '../components/WorkFilters';
import type { WorkFilterValues } from '../components/WorkFilters';
import { useQueryWithCache } from '../hooks/useQueryWithCache';
import KanbanColumn from '../components/work/KanbanColumn';

interface ColumnDef {
  id: string;
  statuses: string[];
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  adminOnly?: boolean;
}

const WorkWall: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();
  
  const taskId = searchParams.get('task');

  const [filters, setFilters] = useState<WorkFilterValues>({
    requesterId: '',
    workerId: '',
    type: 'all'
  });

  const [snackbarState, setSnackbarState] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const isCouncilOrAdmin = profile?.roles?.includes('admin') || profile?.roles?.includes('transversal_council') || profile?.role === 'admin';

  const fetcher = useCallback(async () => {
    if (!user || authLoading) return { data: [], error: null };
    
    const { data, error } = await apiClient.invoke('api-work', 'fetchActivities', {
      requesterId: filters.requesterId || undefined,
      workerId: filters.workerId || undefined,
      type: filters.type !== 'all' ? filters.type : undefined,
      projectId: filters.projectId || undefined
    });

    if (error) return { data: null, error };

    return { data: data || [], error: null };
  }, [user, filters, authLoading]);

  const { data: rawActivities, loading, error, isOfflineData, refetch } = useQueryWithCache(
    `work-wall-activities-${JSON.stringify(filters)}`,
    fetcher,
    [user, filters, authLoading]
  );

  useEffect(() => {
    if (taskId) {
      navigate(`/tasks/${taskId}`, { replace: true });
    }
  }, [taskId, navigate]);

  // Column definitions for Kanban Board
  const columnDefs: ColumnDef[] = [
    {
      id: 'open',
      statuses: ['open'],
      title: t('work.open') || 'Abertas',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.04)',
      borderColor: 'rgba(59, 130, 246, 0.15)'
    },
    {
      id: 'in_progress',
      statuses: ['in_progress'],
      title: t('work.in_progress') || 'Em Execução',
      color: '#eab308',
      bgColor: 'rgba(234, 179, 8, 0.04)',
      borderColor: 'rgba(234, 179, 8, 0.15)'
    },
    {
      id: 'pending_validation',
      statuses: ['pending_validation'],
      title: t('work.forValidating') || 'Para Validar',
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.04)',
      borderColor: 'rgba(168, 85, 247, 0.15)'
    },
    {
      id: 'completed',
      statuses: ['completed'],
      title: t('work.completed') || 'Concluídas',
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.04)',
      borderColor: 'rgba(34, 197, 94, 0.15)'
    },
    ...(isCouncilOrAdmin ? [{
      id: 'moderation',
      statuses: ['pending_approval'],
      title: t('work.moderation') || 'Moderação',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.04)',
      borderColor: 'rgba(249, 115, 22, 0.15)',
      adminOnly: true
    }] : [])
  ];

  // Group activities into columns
  const getColumnActivities = (statuses: string[]) => {
    if (!rawActivities) return [];
    return rawActivities.filter((a: any) => statuses.includes(a.status));
  };

  // Handle Drag & Drop Status Transition
  const handleDropCard = async (activityId: string, sourceStatus: string, targetColumnId: string) => {
    if (sourceStatus === targetColumnId) return;

    try {
      if (targetColumnId === 'in_progress' && sourceStatus === 'open') {
        // Claim task
        const { error: apiErr } = await apiClient.invoke('api-work', 'claimTask', { activityId });
        if (apiErr) throw new Error(typeof apiErr === 'string' ? apiErr : (apiErr as any).message || 'Erro ao assumir tarefa.');
        setSnackbarState({ open: true, message: t('work.taskClaimedSuccess') || 'Tarefa assumida com sucesso!', severity: 'success' });
        refetch();
      } else if (targetColumnId === 'pending_validation' && sourceStatus === 'in_progress') {
        // Submit proof / evidence
        navigate(`/tasks/${activityId}/submit`);
      } else if (targetColumnId === 'completed' && sourceStatus === 'pending_validation') {
        // Confirm activity
        const { error: apiErr } = await apiClient.invoke('api-work', 'confirmActivity', { activityId });
        if (apiErr) throw new Error(typeof apiErr === 'string' ? apiErr : (apiErr as any).message || 'Erro ao confirmar tarefa.');
        setSnackbarState({ open: true, message: t('work.confirmationSuccess') || 'Confirmação registrada com sucesso!', severity: 'success' });
        refetch();
      } else if (sourceStatus === 'pending_approval' && (targetColumnId === 'open' || targetColumnId === 'completed')) {
        // Moderate task (approve)
        if (!isCouncilOrAdmin) {
          throw new Error('Ação permitida apenas para moderadores ou administradores.');
        }
        const { error: apiErr } = await apiClient.invoke('api-work', 'moderateActivity', { activityId, action: 'approve' });
        if (apiErr) throw new Error(typeof apiErr === 'string' ? apiErr : (apiErr as any).message || 'Erro na moderação.');
        setSnackbarState({ open: true, message: t('work.moderationSuccess') || 'Atividade aprovada com sucesso!', severity: 'success' });
        refetch();
      } else {
        setSnackbarState({
          open: true,
          message: t('work.invalidTransition') || 'Transição entre colunas não permitida diretamente.',
          severity: 'info'
        });
      }
    } catch (err: any) {
      console.error('Error handling column drop:', err);
      setSnackbarState({
        open: true,
        message: err?.message || 'Falha ao mover tarefa entre colunas.',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MuralIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
              {t('work.mural')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <KanbanIcon fontSize="small" /> Quadro de Atividades (Kanban)
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={() => refetch()}
            sx={{ borderRadius: '12px' }}
          >
            {t('admin.refresh')}
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/create-demand')}
            color="secondary"
            sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: '12px' }}
          >
            {t('work.createDemand') || 'Criar Demanda'}
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/register-work')}
            sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: '12px' }}
          >
            {t('work.register')}
          </Button>
        </Box>
      </Box>

      {isOfflineData && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
          {t('offline.usingCached') || 'Exibindo dados em cache. Algumas informações podem estar desatualizadas.'}
        </Alert>
      )}

      {/* Filters */}
      <WorkFilters onFilterChange={setFilters} />
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {t('common.retry') || 'Tentar Novamente'}
            </Button>
          }
        >
          {t('common.errorLoadingData') || 'Erro ao carregar dados:'} {error.message || error}
        </Alert>
      )}

      {/* Kanban Board Layout Container */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 1, md: 1.5 },
          overflowX: { xs: 'auto', sm: 'visible' },
          pb: 4,
          pt: 1,
          minHeight: 'calc(100vh - 280px)',
          width: '100%',
          alignItems: 'stretch'
        }}
      >
        {columnDefs.map((col) => {
          const colActivities = getColumnActivities(col.statuses);
          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              count={colActivities.length}
              color={col.color}
              bgColor={col.bgColor}
              borderColor={col.borderColor}
              activities={colActivities}
              onRefresh={refetch}
              highlightedId={taskId}
              onDropCard={handleDropCard}
              loading={loading && !rawActivities}
            />
          );
        })}
      </Box>

      {/* Floating Action Buttons for Mobile */}
      <Tooltip title={t('work.createDemand') || 'Criar Demanda'} placement="left">
        <Fab 
          color="secondary" 
          aria-label="add-demand" 
          size="medium"
          sx={{ position: 'fixed', bottom: 150, right: 20, display: { sm: 'none' }, zIndex: 1100, boxShadow: 4 }}
          onClick={() => navigate('/create-demand')}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <Tooltip title={t('work.register')} placement="left">
        <Fab 
          color="primary" 
          aria-label="add" 
          size="medium"
          sx={{ position: 'fixed', bottom: 85, right: 20, display: { sm: 'none' }, zIndex: 1100, boxShadow: 4 }}
          onClick={() => navigate('/register-work')}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Snackbar Feedback */}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={4000}
        onClose={() => setSnackbarState(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarState(prev => ({ ...prev, open: false }))} 
          severity={snackbarState.severity} 
          sx={{ width: '100%', borderRadius: '12px', boxShadow: 6 }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WorkWall;
