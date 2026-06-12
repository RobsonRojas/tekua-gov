import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Alert,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign,
  History
} from 'lucide-react';

import { useMembers, type EconomyStats } from '../../hooks/useMembers';

const EconomyTab = () => {
  const theme = useTheme();
  const { fetchEconomyStats } = useMembers();
  
  const [stats, setStats] = useState<EconomyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchEconomyStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar estatísticas financeiras.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>
        {error || 'Dados indisponíveis'}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" gutterBottom fontWeight={600}>
          Visão Geral da Economia
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Acompanhe os principais indicadores de circulação de Surreais na plataforma.
        </Typography>
      </Box>

      {/* Resumo Financeiro */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp size={24} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
              <Typography variant="subtitle1" color="text.secondary">Total em Circulação</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{stats.totalCirculating.toFixed(2)} SR$</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Briefcase size={24} color={theme.palette.secondary.main} style={{ marginRight: 8 }} />
              <Typography variant="subtitle1" color="text.secondary">Saldo do Tesouro</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{stats.treasuryBalance.toFixed(2)} SR$</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <History size={24} color={theme.palette.info.main} style={{ marginRight: 8 }} />
              <Typography variant="subtitle1" color="text.secondary">Total de Transações</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{stats.totalTransactions}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Top Contribuidores */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Users size={20} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
              <Typography variant="h5" fontWeight={600}>Top Contribuidores</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Membro</TableCell>
                    <TableCell align="right">Tarefas</TableCell>
                    <TableCell align="right">Saldo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.topContributors.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.position}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={c.avatar_url || ''} sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {c.full_name?.charAt(0) || '?'}
                          </Avatar>
                          <Typography variant="body2">{c.full_name || 'Usuário Desconhecido'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{c.completed_tasks}</TableCell>
                      <TableCell align="right">{c.surreal_balance.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {stats.topContributors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>Nenhum dado encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Top Holders */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DollarSign size={20} color={theme.palette.secondary.main} style={{ marginRight: 8 }} />
              <Typography variant="h5" fontWeight={600}>Top Holders</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Membro</TableCell>
                    <TableCell align="right">Saldo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.topHolders.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell>{h.position}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={h.avatar_url || ''} sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {h.full_name?.charAt(0) || '?'}
                          </Avatar>
                          <Typography variant="body2">{h.full_name || 'Usuário Desconhecido'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{h.surreal_balance.toFixed(2)} SR$</TableCell>
                    </TableRow>
                  ))}
                  {stats.topHolders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>Nenhum dado encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EconomyTab;
