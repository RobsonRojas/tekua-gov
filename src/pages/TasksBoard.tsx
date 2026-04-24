import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress, 
  Button,
  Paper,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { 
  Plus as AddIcon, 
  RefreshCw as RefreshIcon,
  ClipboardList as BoardIcon,
  ChevronRight,
  Home as HomeIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ActivityCard from '../components/ActivityCard';

const TasksBoard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          requester:profiles!requester_id (id, full_name, email),
          worker:profiles!worker_id (id, full_name, email),
          confirmations:activity_confirmations (count)
        `)
        .eq('type', 'task')
        .neq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs 
          separator={<ChevronRight size={16} />} 
          sx={{ mb: 2, '& .MuiBreadcrumbs-ol': { alignItems: 'center' } }}
        >
          <MuiLink
            component={Link}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none', gap: 0.5 }}
          >
            <HomeIcon size={16} />
            {t('layout.dashboard')}
          </MuiLink>
          <MuiLink
            component={Link}
            to="/governance"
            sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none' }}
          >
            {t('home.cardGovTitle')}
          </MuiLink>
          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
            {t('work.title')}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BoardIcon size={32} style={{ marginRight: '16px', color: '#6366f1' }} />
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>
                {t('work.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('work.mural')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon size={18} />} 
              onClick={fetchActivities}
            >
              {t('admin.refresh')}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon size={18} />} 
              onClick={() => navigate('/tasks/new')}
            >
              {t('work.register')}
            </Button>
          </Box>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {activities.length > 0 ? (
            activities.map((activity) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={activity.id}>
                <ActivityCard 
                  activity={activity} 
                  onRefresh={fetchActivities}
                />
              </Grid>
            ))
          ) : (
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ textAlign: 'center', py: 8, borderRadius: 4, opacity: 0.6 }}>
                <Typography variant="h6">{t('work.noItems')}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default TasksBoard;
