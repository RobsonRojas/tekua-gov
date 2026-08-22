import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
  LinearProgress,
  Button,
  Grid,
  Container,
  Chip,
  IconButton
} from '@mui/material';
import { Share2, Clock, Target, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RewardRanking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reward, setReward] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchRewardAndRanking(id);
    }
  }, [id]);

  const fetchRewardAndRanking = async (rewardId: string) => {
    setLoading(true);
    try {
      const { data: rewardData, error: rewardErr } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', rewardId)
        .single();
      
      if (rewardErr) throw rewardErr;
      if (!rewardData) throw new Error('Prêmio não encontrado');
      
      setReward(rewardData);

      const { data: rankingData, error: rankingErr } = await supabase
        .rpc('get_reward_ranking', { p_reward_id: rewardId });
      
      if (rankingErr) throw rankingErr;
      
      setRanking(rankingData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (balance: number, cost: number) => {
    if (balance >= cost) return 100;
    return (balance / cost) * 100;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Ranking: ${reward?.title}`,
        text: `Veja o ranking da campanha ${reward?.title} na Tekuá!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#0f172a">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !reward) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" pt={10} minHeight="100vh" bgcolor="#0f172a">
        <Typography variant="h5" color="error" gutterBottom>{error || 'Prêmio não encontrado'}</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Voltar para o Início</Button>
      </Box>
    );
  }

  const isExpired = reward.deadline && new Date(reward.deadline) < new Date();

  return (
    <Box minHeight="100vh" bgcolor="#0f172a" pt={4} pb={10}>
      <Container maxWidth="md">
        <Paper 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 4, 
            bgcolor: 'rgba(30, 41, 59, 0.7)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            mb: 4
          }}
        >
          <Grid container spacing={4} alignItems="center">
            {reward.image_url && (
              <Grid size={{ xs: 12, md: 4 }} display="flex" justifyContent="center">
                <Box 
                  component="img" 
                  src={reward.image_url} 
                  alt={reward.title} 
                  sx={{ width: '100%', maxWidth: 200, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} 
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: reward.image_url ? 8 : 12 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography variant="h3" fontWeight={800} color="primary.main" gutterBottom>
                  {reward.title}
                </Typography>
                <IconButton onClick={handleShare} sx={{ color: 'text.secondary', bgcolor: 'rgba(255,255,255,0.05)' }}>
                  <Share2 size={20} />
                </IconButton>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
                {reward.description}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size="auto">
                  <Chip 
                    icon={<Target size={16} />} 
                    label={`Meta: ${reward.cost} $S`} 
                    color="primary" 
                    variant="outlined" 
                    sx={{ fontWeight: 700, fontSize: '1rem', py: 2.5 }}
                  />
                </Grid>
                {reward.deadline && (
                  <Grid size="auto">
                    <Chip 
                      icon={<Clock size={16} />} 
                      label={isExpired ? 'Encerrado' : `Até ${new Date(reward.deadline).toLocaleDateString()}`} 
                      color={isExpired ? 'error' : 'warning'} 
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: '1rem', py: 2.5 }}
                    />
                  </Grid>
                )}
              </Grid>

              {!isExpired && (
                <Button 
                  variant="contained" 
                  size="large" 
                  color="secondary" 
                  endIcon={<ArrowRight />}
                  onClick={() => navigate('/work-wall')}
                  sx={{ 
                    borderRadius: 3, 
                    px: 4, 
                    py: 1.5, 
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.39)'
                  }}
                >
                  Ganhar Surreais no Work Wall
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Trophy color="#f59e0b" />
          Ranking da Comunidade
        </Typography>

        <Paper 
          sx={{ 
            borderRadius: 4, 
            bgcolor: 'background.paper', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden'
          }}
        >
          {ranking.map((user, index) => {
            const progress = calculateProgress(user.balance, reward.cost);
            return (
              <Box 
                key={user.user_id} 
                sx={{ 
                  p: 3, 
                  borderBottom: index < ranking.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  bgcolor: user.achieved ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' }
                }}
              >
                <Typography variant="h5" fontWeight={800} color={index < 3 ? 'primary.main' : 'text.secondary'} sx={{ width: 30, textAlign: 'center' }}>
                  {index + 1}
                </Typography>
                
                <Avatar src={user.avatar_url} sx={{ width: 50, height: 50, bgcolor: 'primary.dark' }}>
                  {user.full_name?.charAt(0) || '?'}
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {user.full_name || 'Membro Anônimo'}
                    </Typography>
                    {user.achieved ? (
                      <Chip 
                        icon={<CheckCircle2 size={14} />} 
                        label="Garantido!" 
                        color="success" 
                        size="small" 
                        sx={{ fontWeight: 700 }}
                      />
                    ) : (
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {user.balance.toFixed(0)} / {reward.cost} $S
                      </Typography>
                    )}
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    color={user.achieved ? "success" : "primary"}
                    sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)' }}
                  />
                </Box>
              </Box>
            );
          })}

          {ranking.length === 0 && (
            <Box p={5} textAlign="center">
              <Typography variant="body1" color="text.secondary">Nenhum membro participando ainda.</Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
