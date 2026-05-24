import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Tabs, 
  Tab, 
  Button,
  Fab,
  Tooltip,
  Paper,
  Alert,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Mms as MuralIcon,
  Menu as MenuIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';
import ActivityCard from '../components/ActivityCard';
import ActivityCardSkeleton from '../components/Skeletons/ActivityCardSkeleton';
import WorkFilters from '../components/WorkFilters';
import type { WorkFilterValues } from '../components/WorkFilters';
import { useQueryWithCache } from '../hooks/useQueryWithCache';
import { motion, AnimatePresence } from 'framer-motion';

const WorkWall: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();
  
  const taskId = searchParams.get('task');

  const [tabIndex, setTabIndex] = useState(0);
  const [filters, setFilters] = useState<WorkFilterValues>({
    requesterId: '',
    workerId: '',
    type: 'all'
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const fetcher = useCallback(async () => {
    if (!user || authLoading) return { data: [], error: null };
    
    const { data, error } = await apiClient.invoke('api-work', 'fetchActivities', {
      requesterId: filters.requesterId || undefined,
      workerId: filters.workerId || undefined,
      type: filters.type !== 'all' ? filters.type : undefined
    });

    if (error) return { data: null, error };

    return { data: data || [], error: null };
  }, [user, filters]);

  const { data: rawActivities, loading, error, isOfflineData, refetch } = useQueryWithCache(
    `work-wall-activities-${JSON.stringify(filters)}`,
    fetcher,
    [user, filters, authLoading]
  );

  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!rawActivities || !user) return;

    const isCouncilOrAdmin = profile?.roles?.includes('admin') || profile?.roles?.includes('transversal_council');

    let filtered = rawActivities;
    if (tabIndex === 0) { // Todos
      if (!isCouncilOrAdmin) {
        filtered = rawActivities.filter((a: any) => 
          (a.status !== 'pending_approval' && a.status !== 'rejected') || a.requester_id === user?.id
        );
      }
    } else if (tabIndex === 1) { // Abertas
      filtered = rawActivities.filter((a: any) => a.status === 'open');
    } else if (tabIndex === 2) { // Em Execução
      filtered = rawActivities.filter((a: any) => a.status === 'in_progress');
    } else if (tabIndex === 3) { // Para Validar
      filtered = rawActivities.filter((a: any) => a.status === 'pending_validation');
    } else if (tabIndex === 4) { // Finalizadas
      filtered = rawActivities.filter((a: any) => a.status === 'completed');
    } else if (tabIndex === 5) { // Moderação
      filtered = rawActivities.filter((a: any) => a.status === 'pending_approval');
    }

    setActivities(filtered);
  }, [rawActivities, tabIndex, user]);

  const isCouncilOrAdmin = profile?.roles?.includes('admin') || profile?.roles?.includes('transversal_council');

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleMenuSelect = (index: number) => {
    setTabIndex(index);
    handleMenuClose();
  };

  const statusOptions = [
    { label: t('common.all') || 'Todos', value: 0 },
    { label: t('work.open') || 'Abertas', value: 1 },
    { label: t('work.in_progress') || 'Em Execução', value: 2 },
    { label: t('work.forValidating') || 'Para Validar', value: 3 },
    { label: t('work.completed') || 'Finalizadas', value: 4 },
    ...(isCouncilOrAdmin ? [{ label: t('work.moderation') || 'Moderação', value: 5 }] : [])
  ];

  const currentStatusLabel = statusOptions.find(opt => opt.value === tabIndex)?.label || statusOptions[0].label;

  useEffect(() => {
    if (taskId) {
      navigate(`/tasks/${taskId}`, { replace: true });
    }
  }, [taskId, navigate]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MuralIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {t('work.mural')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={() => refetch()}
          >
            {t('admin.refresh')}
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/create-demand')}
            color="secondary"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            {t('work.createDemand') || 'Criar Demanda'}
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/register-work')}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            {t('work.register')}
          </Button>
        </Box>
      </Box>

      {isOfflineData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('offline.usingCached') || 'Exibindo dados em cache. Algumas informações podem estar desatualizadas.'}
        </Alert>
      )}

      <WorkFilters onFilterChange={setFilters} />
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {t('common.retry') || 'Tentar Novamente'}
            </Button>
          }
        >
          {t('common.errorLoadingData') || 'Erro ao carregar dados:'} {error.message || error}
        </Alert>
      )}

      {isMobile ? (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleMenuClick}
            startIcon={<FilterListIcon />}
            fullWidth
            sx={{ 
              justifyContent: 'space-between', 
              py: 1.5, 
              borderRadius: '12px',
              backgroundColor: tabIndex === 5 ? 'secondary.main' : 'primary.main',
              '&:hover': {
                backgroundColor: tabIndex === 5 ? 'secondary.dark' : 'primary.dark',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mr: 1, opacity: 0.8 }}>
                {t('common.status') || 'Status'}:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {currentStatusLabel}
              </Typography>
            </Box>
            <MenuIcon />
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: '16px',
                minWidth: 280,
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.05)'
              }
            }}
          >
            {statusOptions.map((option) => (
              <MenuItem 
                key={option.value} 
                onClick={() => handleMenuSelect(option.value)}
                selected={tabIndex === option.value}
                sx={{ 
                  py: 1.5, 
                  px: 2.5,
                  fontSize: '1rem',
                  fontWeight: tabIndex === option.value ? 700 : 500,
                  color: option.value === 5 ? 'secondary.main' : 'inherit'
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      ) : (
        <Paper sx={{ mb: 4, borderRadius: 2 }}>
          <Tabs 
            value={tabIndex} 
            onChange={(_, val) => setTabIndex(val)} 
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                fontWeight: 600,
                px: { xs: 1.5, sm: 3 }
              }
            }}
          >
            {statusOptions.map((option) => (
              <Tab 
                key={option.value} 
                label={option.label} 
                sx={option.value === 5 ? { color: 'secondary.main', fontWeight: 700 } : {}}
              />
            ))}
          </Tabs>
        </Paper>
      )}

      {loading && !rawActivities ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <ActivityCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {activities.length > 0 ? (
          <AnimatePresence>
            {activities.map((activity, index) => (
              <Grid 
                size={{ xs: 12, sm: 6, md: 4 }} 
                key={activity.id}
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  id={`activity-${activity.id}`}
                >
                  <ActivityCard 
                    activity={activity} 
                    onRefresh={refetch}
                    highlighted={taskId === activity.id}
                  />
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
          ) : (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                <Typography variant="h6">{t('work.noItems')}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

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
    </Container>
  );
};

export default WorkWall;
