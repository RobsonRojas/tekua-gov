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
  Paper
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Mms as MuralIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';
import ActivityCard from '../components/ActivityCard';
import ActivityCardSkeleton from '../components/Skeletons/ActivityCardSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

const WorkWall: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tabIndex, setTabIndex] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          requester:profiles!requester_id (id, full_name),
          worker:profiles!worker_id (id, full_name),
          confirmations:activity_confirmations (count),
          evidence:activity_evidence (evidence_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which ones the user has already confirmed
      const { data: userConfirms } = await supabase
        .from('activity_confirmations')
        .select('activity_id')
        .eq('user_id', user.id);
      
      const confirmedIds = new Set(userConfirms?.map(c => c.activity_id) || []);

      const refinedData = data?.map(item => ({
        ...item,
        user_has_confirmed: confirmedIds.has(item.id)
      })) || [];

      // Filter based on tab
      if (tabIndex === 1) { // My Involvement
         setActivities(refinedData.filter(c => c.worker_id === user.id || c.requester_id === user.id));
      } else if (tabIndex === 2) { // To Validate
         setActivities(refinedData.filter(c => c.worker_id !== user.id && !confirmedIds.has(c.id) && c.status === 'pending_validation'));
      } else { // All
         setActivities(refinedData);
      }

    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, [user, tabIndex]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

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
            onClick={() => fetchActivities()}
          >
            {t('admin.refresh')}
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

      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Tabs 
          value={tabIndex} 
          onChange={(_, val) => setTabIndex(val)} 
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={t('common.all') || t('admin.all') || 'All'} />
          <Tab label={t('work.myInvolvement')} />
          <Tab label={t('work.forValidating')} />
        </Tabs>
      </Paper>

      {loading ? (
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
                    onRefresh={fetchActivities}
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
