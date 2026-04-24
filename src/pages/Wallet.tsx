import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Send, 
  RefreshCw,
  Info,
  User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  from_id: string | null;
  to_id: string | null;
  amount: number;
  description: string;
  activity_id: string | null;
  created_at: string;
  from_profile?: { full_name: string; email: string };
  to_profile?: { full_name: string; email: string };
}

const Wallet: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Transfer Modal State
  const [openTransfer, setOpenTransfer] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch Balance
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('profile_id', user.id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') throw walletError;
      setBalance(walletData?.balance || 0);

      // 2. Fetch Transactions with profile info
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select(`
          *,
          from_profile:from_id (full_name, email),
          to_profile:to_id (full_name, email)
        `)
        .or(`from_id.eq.${user.id},to_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (transError) throw transError;
      setTransactions(transData || []);

    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTransfer = async () => {
    setTransferError(null);
    setTransferLoading(true);

    try {
      // 1. Find recipient by email
      const { data: recipientData, error: recipientError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', recipientEmail.trim())
        .single();

      if (recipientError) {
        throw new Error(t('auth.user_not_found'));
      }

      // 2. Call RPC
      const { data, error: rpcError } = await supabase.rpc('perform_transfer', {
        p_to_id: recipientData.id,
        p_amount: parseFloat(amount),
        p_description: description
      });

      if (rpcError) throw rpcError;
      if (data && !data.success) throw new Error(data.error);

      setTransferSuccess(true);
      setOpenTransfer(false);
      setAmount('');
      setRecipientEmail('');
      setDescription('');
      fetchData(true);
    } catch (err: any) {
      setTransferError(err.message || t('wallet.error'));
    } finally {
      setTransferLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h2" color="primary.main">
          {t('wallet.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />}
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            {t('admin.refresh')}
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Send size={18} />}
            onClick={() => setOpenTransfer(true)}
            data-testid="transfer-button"
          >
            {t('wallet.transfer')}
          </Button>
        </Box>
      </Box>

      {transferSuccess && (
        <Alert severity="success" sx={{ mb: 4, borderRadius: '12px' }} onClose={() => setTransferSuccess(false)}>
          {t('wallet.success')}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Balance Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              height: '100%',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, opacity: 0.8 }}>
                <WalletIcon size={20} style={{ marginRight: 8 }} />
                <Typography variant="subtitle1">{t('wallet.balance')}</Typography>
              </Box>
              <Typography variant="h1" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'baseline' }}>
                <span style={{ fontSize: '2rem', marginRight: 8 }}>$S</span>
                {balance.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {t('wallet.surreais')}
              </Typography>
            </Box>
            
            {/* Decorative background circle */}
            <Box sx={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 120, 
              height: 120, 
              borderRadius: '50%', 
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              zIndex: 0
            }} />
          </Paper>
        </Grid>

        {/* Info / Quick Actions */}
        <Grid size={{ xs: 12, md: 8 }}>
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
            <Typography variant="h3" gutterBottom sx={{ mb: 3 }}>
              {t('home.cardGovTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              O sistema de **Surreais** é a moeda social da Tekuá. Você pode usá-la para reconhecer contribuições de outros membros ou trocar serviços dentro da nossa comunidade.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Tooltip title="Em breve: Troca por produtos físicos">
                <IconButton color="primary" sx={{ border: '1px solid', borderColor: 'primary.main' }}>
                  <Info size={20} />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>

        {/* Transaction History */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: 'background.paper',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <History size={24} style={{ marginRight: 12 }} color="#6366f1" />
              <Typography variant="h3">{t('wallet.history')}</Typography>
            </Box>

            {transactions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">{t('wallet.noTransactions')}</Typography>
              </Box>
            ) : (
              <List sx={{ width: '100%', p: 0 }}>
                {transactions.map((tx, index) => {
                  const isDebit = tx.from_id === user?.id;
                  const otherParty = isDebit 
                    ? (tx.to_profile?.full_name || tx.to_profile?.email || 'System')
                    : (tx.from_profile?.full_name || tx.from_profile?.email || t('wallet.treasury'));

                  return (
                    <React.Fragment key={tx.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemIcon>
                          <Avatar sx={{ 
                            bgcolor: isDebit ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: isDebit ? 'error.main' : 'secondary.main'
                          }}>
                            {isDebit ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                {tx.description || (isDebit ? t('wallet.send') : t('wallet.receive'))}
                              </Typography>
                              <Typography 
                                variant="h4" 
                                color={isDebit ? 'error.main' : 'secondary.main'}
                                sx={{ fontWeight: 800 }}
                              >
                                {isDebit ? '-' : '+'}{tx.amount} $S
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                  {isDebit ? `${t('wallet.to')}: ` : `${t('wallet.from')}: `}
                                  <strong>{otherParty}</strong>
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(tx.created_at).toLocaleDateString()}
                                </Typography>
                              </Box>
                              {tx.activity_id && (
                                <Typography 
                                  variant="caption" 
                                  color="primary.main" 
                                  sx={{ mt: 0.5, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                  onClick={() => navigate('/work-wall')}
                                >
                                  {t('work.viewActivity') || 'Ver Atividade Relacionada'} →
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < transactions.length - 1 && <Divider component="li" sx={{ opacity: 0.05 }} />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Transfer Dialog */}
      <Dialog 
        open={openTransfer} 
        onClose={() => !transferLoading && setOpenTransfer(false)}
        PaperProps={{
          sx: { borderRadius: '24px', p: 2, maxWidth: 450, width: '100%' }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h3">{t('wallet.send')}</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Envie moedas Surreal para outro membro informando seu email corporativo.
          </Typography>
          
          {transferError && <Alert severity="error" sx={{ mb: 3 }}>{transferError}</Alert>}
          
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              fullWidth
              label={t('wallet.recipient')}
              variant="outlined"
              placeholder="email@tekua.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              InputProps={{
                startAdornment: <User size={18} style={{ marginRight: 8, color: '#94a3b8' }} />
              }}
            />
            <TextField
              fullWidth
              label={t('wallet.amount')}
              type="number"
              variant="outlined"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ "data-testid": "amount-input" }}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, fontWeight: 700, color: 'primary.main' }}>$S</Typography>
              }}
            />
            <TextField
              fullWidth
              label={t('wallet.description')}
              variant="outlined"
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenTransfer(false)} disabled={transferLoading}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleTransfer}
            data-testid="confirm-transfer-button"
            scroll-behavior="smooth"
            disabled={transferLoading || !amount || !recipientEmail}
            startIcon={transferLoading && <CircularProgress size={18} color="inherit" />}
          >
            {t('wallet.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Wallet;
