import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import { Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserRewardsProps {
  userId: string;
}

export default function UserRewards({ userId }: UserRewardsProps) {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRewards = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_rewards')
          .select(`
            id,
            achieved_at,
            rewards (
              id,
              title,
              description,
              image_url
            )
          `)
          .eq('user_id', userId)
          .order('achieved_at', { ascending: false });

        if (error) throw error;
        setRewards(data || []);
      } catch (err) {
        console.error('Error fetching user rewards:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserRewards();
    }
  }, [userId]);

  if (loading) {
    return <Box p={2} textAlign="center"><CircularProgress size={24} /></Box>;
  }

  if (rewards.length === 0) {
    return null; // Oculta se não houver prêmios
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Trophy size={24} color="#f59e0b" />
        Prêmios Conquistados
      </Typography>
      <Grid container spacing={2}>
        {rewards.map((ur) => {
          const reward = ur.rewards;
          if (!reward) return null;
          
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ur.id}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  height: '100%'
                }}
              >
                {reward.image_url ? (
                  <Box
                    component="img"
                    src={reward.image_url}
                    alt={reward.title}
                    sx={{ width: 48, height: 48, borderRadius: 1.5, objectFit: 'cover' }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 1.5, 
                      bgcolor: 'rgba(245, 158, 11, 0.2)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <Trophy size={24} color="#f59e0b" />
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    {reward.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Conquistado em {new Date(ur.achieved_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
