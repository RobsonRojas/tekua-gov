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
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Mms as MuralIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  const { user } = useAuth();

  const [tabIndex, setTabIndex] = useState(0);
  const [filters, setFilters] = useState<WorkFilterValues>({
    requesterId: '',
    workerId: '',
    type: 'all'
  });

  const fetcher = useCallback(async () => {
    if (!user) return { data: [], error: null };
    
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
    [user, filters]
  );

  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!rawActivities || !user) return;

    let filtered = rawActivities;
    if (tabIndex === 1) { // Abertas
      filtered = rawActivities.filter((a: any) => a.status === 'open');
    } else if (tabIndex === 2) { // Em Execução
      filtered = rawActivities.filter((a: any) => a.status === 'in_progress');
    } else if (tabIndex === 3) { // Para Validar
      filtered = rawActivities.filter((a: any) => a.status === 'pending_validation');
    } else if (tabIndex === 4) { // Finalizadas
      filtered = rawActivities.filter((a: any) => a.status === 'completed');
    }

    setActivities(filtered);
  }, [rawActivities, tabIndex, user]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MuralIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight={700}>
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

      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Tabs 
          value={tabIndex} 
          onChange={(_, val) => setTabIndex(val)} 
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t('common.all') || 'Todos'} />
          <Tab label={t('work.open') || 'Abertas'} />
          <Tab label={t('work.in_progress') || 'Em Execução'} />
          <Tab label={t('work.forValidating') || 'Para Validar'} />
          <Tab label={t('work.completed') || 'Finalizadas'} />
        </Tabs>
      </Paper>

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
                >
                  <ActivityCard 
                    activity={activity} 
                    onRefresh={refetch}
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
          sx={{ position: 'fixed', bottom: 104, right: 32, display: { sm: 'none' } }}
          onClick={() => navigate('/create-demand')}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <Tooltip title={t('work.register')} placement="left">
        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ position: 'fixed', bottom: 32, right: 32, display: { sm: 'none' } }}
          onClick={() => navigate('/register-work')}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Container>
  );
};

export default WorkWall;
