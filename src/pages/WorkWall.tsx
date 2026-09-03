import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Mms as MuralIcon,
  ViewColumn as KanbanIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [role="button"]')) {
      return;
    }
    setIsMouseDown(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  
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

  const scrollToColumn = (colId: string) => {
    const container = scrollContainerRef.current;
    const el = document.getElementById(`kanban-col-${colId}`);
    if (container && el) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const scrollOffset = container.scrollLeft + (elRect.left - containerRect.left) - 12;
      container.scrollTo({ left: Math.max(0, scrollOffset), behavior: 'smooth' });
    }
  };

  const scrollBoard = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Column definitions for Kanban Board
  const columnDefs: ColumnDef[] = [
    ...(isCouncilOrAdmin ? [{
      id: 'moderation',
      statuses: ['pending_approval'],
      title: t('work.moderation') || 'Moderação',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.04)',
      borderColor: 'rgba(249, 115, 22, 0.15)',
      adminOnly: true
    }] : []),
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
    }
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
    <Container maxWidth={false} disableGutters sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 2, md: 3 }, width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* Header Bar */}
      <Box sx={{ mb: 2.5, width: '100%', boxSizing: 'border-box' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <MuralIcon sx={{ fontSize: { xs: 28, sm: 32 }, mr: 1.5, color: 'primary.main', flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" component="h1" fontWeight={800} sx={{ fontSize: { xs: '1.35rem', sm: '1.75rem', md: '2.125rem' } }}>
              {t('work.mural')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <KanbanIcon fontSize="small" /> Quadro de Atividades (Kanban)
            </Typography>
          </Box>
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

      {/* Action Buttons Toolbar (Positioned between Filters and Task Board) */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5, 
          my: 2.5, 
          width: '100%', 
          boxSizing: 'border-box' 
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/create-demand')}
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              borderRadius: '12px', 
              px: { xs: 1.5, sm: 2.5 }, 
              py: 1,
              fontWeight: 700, 
              fontSize: '0.875rem',
              whiteSpace: 'nowrap'
            }}
          >
            {t('work.createDemand') || 'Criar Demanda'}
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<ClockIcon />} 
            onClick={() => navigate('/register-work')}
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              borderRadius: '12px', 
              px: { xs: 1.5, sm: 2.5 }, 
              py: 1,
              fontWeight: 700, 
              fontSize: '0.875rem',
              whiteSpace: 'nowrap'
            }}
          >
            {t('work.register')}
          </Button>
        </Box>

        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={() => refetch()}
          sx={{ 
            borderRadius: '12px', 
            px: 2, 
            py: 1,
            fontSize: '0.875rem', 
            whiteSpace: 'nowrap',
            alignSelf: { xs: 'stretch', sm: 'center' }
          }}
        >
          {t('admin.refresh')}
        </Button>
      </Box>

      {/* Quick Column Navigation Pills with Scroll Arrows */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2, width: '100%' }}>
        <IconButton 
          size="small" 
          onClick={() => scrollBoard('left')}
          sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)', p: 0.5 }}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1, 
            overflowX: 'auto', 
            py: 0.5, 
            flexGrow: 1,
            minWidth: 0,
            touchAction: 'pan-x',
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          {columnDefs.map((col) => {
            const count = getColumnActivities(col.statuses).length;
            return (
              <Chip
                key={col.id}
                label={`${col.title} (${count})`}
                onClick={() => scrollToColumn(col.id)}
                size="small"
                sx={{
                  bgcolor: col.bgColor,
                  color: col.color,
                  borderColor: col.borderColor,
                  border: '1px solid',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  '&:active': {
                    opacity: 0.8
                  }
                }}
              />
            );
          })}
        </Box>

        <IconButton 
          size="small" 
          onClick={() => scrollBoard('right')}
          sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)', p: 0.5 }}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Kanban Board Layout Container */}
      <Box
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2, md: 2.5 },
          overflowX: 'auto',
          overflowY: 'hidden',
          touchAction: 'pan-x pan-y',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: isMouseDown ? 'none' : { xs: 'x mandatory', sm: 'none' },
          cursor: isMouseDown ? 'grabbing' : 'grab',
          userSelect: isMouseDown ? 'none' : 'auto',
          pb: 2,
          pt: 1,
          px: { xs: 1, sm: 1.5, md: 2 },
          height: { xs: 'calc(100vh - 220px)', sm: 'calc(100vh - 240px)' },
          maxHeight: { xs: 'calc(100vh - 220px)', sm: 'calc(100vh - 240px)' },
          width: '100%',
          alignItems: 'stretch',
          '&::-webkit-scrollbar': {
            height: '8px'
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(16, 185, 129, 0.4)',
            borderRadius: '4px',
            '&:hover': {
              bgcolor: 'rgba(16, 185, 129, 0.7)'
            }
          }
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
        {/* Trailing End Spacer so rightmost column is never clipped by viewport overflow */}
        <Box sx={{ width: { xs: 12, sm: 24 }, flexShrink: 0 }} />
      </Box>

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
