import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Tabs, 
  Tab, 
  CircularProgress, 
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
import ContributionCard from '../components/ContributionCard';

const WorkWall: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tabIndex, setTabIndex] = useState(0);
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(3);

  const fetchThreshold = async () => {
    try {
      const { data } = await supabase
        .from('governance_settings')
        .select('value')
        .eq('key', 'min_contribution_confirmations')
        .single();
      
      if (data) {
        setThreshold(Number(data.value));
      }
    } catch (err) {
      console.error('Error fetching threshold:', err);
    }
  };

  const fetchContributions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          *,
          profiles:profiles!user_id (id, full_name),
          beneficiary_profiles:profiles!beneficiary_id (id, full_name),
          confirmations:contribution_confirmations (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which ones the user has already confirmed
      const { data: userConfirms } = await supabase
        .from('contribution_confirmations')
        .select('contribution_id')
        .eq('user_id', user.id);
      
      const confirmedIds = new Set(userConfirms?.map(c => c.contribution_id) || []);

      const refinedData = data?.map(item => ({
        ...item,
        user_has_confirmed: confirmedIds.has(item.id)
      })) || [];

      // Filter based on tab
      if (tabIndex === 1) { // My Involvement
         setContributions(refinedData.filter(c => c.user_id === user.id));
      } else if (tabIndex === 2) { // To Validate
         setContributions(refinedData.filter(c => c.user_id !== user.id && !confirmedIds.has(c.id) && c.status === 'pending'));
      } else { // All
         setContributions(refinedData);
      }

    } catch (err) {
      console.error('Error fetching contributions:', err);
    } finally {
      setLoading(false);
    }
  }, [user, tabIndex]);

  useEffect(() => {
    fetchThreshold();
    fetchContributions();
  }, [fetchContributions]);

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
            onClick={() => fetchContributions()}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {contributions.length > 0 ? (
            contributions.map((contribution) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={contribution.id}>
                <ContributionCard 
                  contribution={contribution} 
                  threshold={threshold}
                  onRefresh={fetchContributions}
                />
              </Grid>
            ))
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
