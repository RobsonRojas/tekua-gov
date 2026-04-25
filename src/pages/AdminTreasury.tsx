import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  TextField, 
  Autocomplete,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip
} from '@mui/material';
import { 
  Database, 
  PlusCircle, 
  History, 
  Users, 
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

interface Transaction {
  id: string;
  from_id: string | null;
  to_id: string;
  amount: number;
  description: string;
  activity_id: string | null;
  created_at: string;
  to_profile?: { full_name: string; avatar_url: string };
  from_profile?: { full_name: string; avatar_url: string };
}

const AdminTreasury: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Minting State
  const [recipient, setRecipient] = useState<Profile | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Stats State
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [recentMints, setRecentMints] = useState<Transaction[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      // 1. Stats via API
      const { data: stats, error: statsError } = await apiClient.invoke('api-wallet', 'fetchTreasuryStats');
      if (statsError) throw new Error(statsError);
      
      setTotalSupply(stats.totalSupply);
      setTotalParticipants(stats.totalParticipants);
      setRecentMints(stats.recentMints || []);

      // 2. User lists via api-members
      const { data: profileData, error: profileError } = await apiClient.invoke('api-members', 'fetchUsers');
      if (profileError) throw new Error(profileError);
      setProfiles(profileData || []);

    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) return;

    setIsMinting(true);
    setMintStatus(null);

    try {
      const { error } = await apiClient.invoke('api-wallet', 'mintCurrency', {
        recipientId: recipient.id,
        amount: parseFloat(amount),
        description: description
      });

      if (error) throw new Error(error);

      setMintStatus({ type: 'success', text: `Sucesso! ${amount} Surreais emitidos para ${recipient.full_name}.` });
      setAmount('');
      setRecipient(null);
      setDescription('');
      fetchStats();
    } catch (err: any) {
       setMintStatus({ type: 'error', text: err.message || t('wallet.error') });
    } finally {
      setIsMinting(false);
    }
  };

  if (loadingStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" color="primary.main">
          {t('wallet.treasury')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestão central da economia Surreal. Emita recompensas e audite o suprimento da associação.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Statistics Widgets */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: 'background.paper',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 3
            }}
          >
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', color: 'white' }}>
              <Database size={32} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                {t('wallet.total_supply')}
              </Typography>
              <Typography variant="h1" sx={{ fontWeight: 800 }}>
                {totalSupply.toLocaleString()} $S
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: 'background.paper',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 3
            }}
          >
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'secondary.main', color: 'white' }}>
              <Users size={32} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Participantes Ativos
              </Typography>
              <Typography variant="h1" sx={{ fontWeight: 800 }}>
                {totalParticipants}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Minting Form */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: 'background.paper',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PlusCircle size={24} style={{ marginRight: 12 }} color="#10b981" />
              <Typography variant="h3">{t('wallet.mint')}</Typography>
            </Box>

            {mintStatus && (
              <Alert severity={mintStatus.type} sx={{ mb: 3, borderRadius: '12px' }}>
                {mintStatus.text}
              </Alert>
            )}

            <Box component="form" onSubmit={handleMint} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Autocomplete
                options={profiles}
                getOptionLabel={(option) => `${option.full_name} (${option.email})`}
                value={recipient}
                onChange={(_, newValue) => setRecipient(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label={t('wallet.recipient')} 
                    variant="outlined" 
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <Search size={18} style={{ marginRight: 8, color: '#94a3b8' }} />
                    }}
                  />
                )}
              />
              <TextField
                fullWidth
                label={t('wallet.amount')}
                type="number"
                variant="outlined"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, fontWeight: 700, color: 'primary.main' }}>$S</Typography>
                }}
              />
              <TextField
                fullWidth
                label={t('wallet.description')}
                variant="outlined"
                required
                multiline
                rows={3}
                placeholder="Ex: Recompensa por tarefa realizada..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button 
                variant="contained" 
                size="large" 
                type="submit"
                disabled={isMinting || !recipient || !amount}
                startIcon={isMinting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle2 size={20} />}
                sx={{ py: 1.5, borderRadius: '12px' }}
              >
                {isMinting ? 'Processando...' : 'Confirmar Emissão'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Audit Log / Recent Mints */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: 'background.paper',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <History size={24} style={{ marginRight: 12 }} color="#6366f1" />
              <Typography variant="h3">Auditoria de Emissões</Typography>
            </Box>

            {recentMints.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">Nenhuma emissão recente.</Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {recentMints.map((mint, index) => (
                  <React.Fragment key={mint.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>
                              {mint.amount} $S → {mint.to_profile?.full_name || 'Desconhecido'}
                            </Typography>
                            <Chip label="EMISSÃO" size="small" color="secondary" variant="outlined" sx={{ borderRadius: '4px' }} />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                              {mint.description}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(mint.created_at).toLocaleString()}
                              </Typography>
                              {mint.activity_id && (
                                <Typography 
                                  variant="caption" 
                                  color="primary.main" 
                                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                  onClick={() => navigate('/work-wall')}
                                >
                                  Ver Atividade →
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentMints.length - 1 && <Divider component="li" sx={{ opacity: 0.05 }} />}
                  </React.Fragment>
                ))}
              </List>
            )}
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', display: 'flex', gap: 2 }}>
              <AlertTriangle color="#f59e0b" size={20} />
              <Typography variant="body2" color="text.secondary">
                Ações de tesouraria são registradas permanentemente no banco de dados e não podem ser revertidas manualmente. Use com cautela.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminTreasury;
