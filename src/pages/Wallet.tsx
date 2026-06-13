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
  Tooltip,
  Autocomplete
} from '@mui/material';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Send, 
  RefreshCw,
  Info,
  User,
  QrCode,
  Scan
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { apiClient } from '../lib/api';
import QRScanner from '../components/QRScanner';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [balance, setBalance] = useState<number>(0);
  const [lockedBalance, setLockedBalance] = useState<number>(0);
  const [auditPendingBalance, setAuditPendingBalance] = useState<number>(0);
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
  const [isExternalEmail, setIsExternalEmail] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  
  // Users Search State
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // QR Code State
  const [openQrModal, setOpenQrModal] = useState(false);
  const [openScannerModal, setOpenScannerModal] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch Balance & Transactions & Activity Info from API
      const [walletRes, transRes] = await Promise.all([
        apiClient.invoke('api-wallet', 'getBalance'),
        apiClient.invoke('api-wallet', 'fetchTransactions', { limit: 50 })
      ]);

      if (walletRes.error) throw new Error(walletRes.error);
      if (transRes.error) throw new Error(transRes.error);

      setBalance(walletRes.data?.balance || 0);
      setLockedBalance(walletRes.data?.locked_balance || 0);
      setAuditPendingBalance(walletRes.data?.pending_audit_balance || 0);
      setTransactions(transRes.data || []);

    } catch (err: any) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchAvailableUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await apiClient.invoke('api-members', 'fetchUsers');
      if (error) throw new Error(error);
      const filteredUsers = (data || []).filter((u: any) => u.id !== user?.id);
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Error fetching users for transfer:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (openTransfer && users.length === 0) {
      fetchAvailableUsers();
    }
  }, [openTransfer]);

  const handleTransfer = async () => {
    setTransferError(null);
    setTransferLoading(true);

    try {
      // Call the unified transfer API (which handles email resolution and balance checks server-side)
      const { error } = await apiClient.invoke('api-wallet', 'transfer', {
        toEmail: recipientEmail.trim(),
        amount: parseFloat(amount),
        description
      });

      if (error) throw new Error(error);

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
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />}
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            {t('admin.refresh')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<QrCode size={18} />}
            onClick={() => setOpenQrModal(true)}
            color="secondary"
          >
            Meu QR Code
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
          
          {(lockedBalance > 0 || auditPendingBalance > 0) && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {lockedBalance > 0 && (
                <Paper variant="outlined" sx={{ p: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)', bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Bloqueado (Tempo)</Typography>
                  <Typography variant="body1" fontWeight={700}>$S {lockedBalance.toLocaleString()}</Typography>
                </Paper>
              )}
              {auditPendingBalance > 0 && (
                <Paper variant="outlined" sx={{ p: 1.5, borderColor: 'rgba(255, 171, 0, 0.3)', bgcolor: 'rgba(255, 171, 0, 0.05)', borderRadius: '12px' }}>
                  <Typography variant="caption" color="warning.main" display="block">Pendente de Auditoria</Typography>
                  <Typography variant="body1" fontWeight={700} color="warning.main">$S {auditPendingBalance.toLocaleString()}</Typography>
                </Paper>
              )}
            </Box>
          )}
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
        <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3">{t('wallet.send')}</Typography>
          <Button
            size="small"
            startIcon={<Scan size={16} />}
            onClick={() => {
              setOpenTransfer(false);
              setOpenScannerModal(true);
            }}
            variant="text"
            color="secondary"
          >
            Escanear
          </Button>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Envie moedas Surreal para outro membro informando seu email corporativo ou convide alguém externo.
          </Typography>
          
          {transferError && <Alert severity="error" sx={{ mb: 3 }}>{transferError}</Alert>}
          {isExternalEmail && isValidEmail && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
              Este email não está cadastrado. Enviaremos um convite automaticamente junto com os Surreais!
            </Alert>
          )}
          
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Autocomplete
              freeSolo
              options={users}
              loading={usersLoading}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.email}
              isOptionEqualToValue={(option, value) => {
                if (typeof option === 'string' || typeof value === 'string') return option === value;
                return option.email === value.email;
              }}
              onInputChange={(_event, newInputValue) => {
                setRecipientEmail(newInputValue);
                // Check if it's external and valid email
                const foundUser = users.find(u => u.email === newInputValue);
                setIsExternalEmail(!foundUser && newInputValue.length > 0);
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                setIsValidEmail(emailRegex.test(newInputValue));
              }}
              onChange={(_event, newValue) => {
                let emailStr = '';
                if (typeof newValue === 'string') {
                  emailStr = newValue;
                } else if (newValue && typeof newValue === 'object') {
                  emailStr = newValue.email;
                }
                setRecipientEmail(emailStr);
                const foundUser = users.find(u => u.email === emailStr);
                setIsExternalEmail(!foundUser && emailStr.length > 0);
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                setIsValidEmail(emailRegex.test(emailStr));
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props as any;
                return (
                  <Box component="li" key={key} {...optionProps} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={option.avatar_url} sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                      {option.full_name ? option.full_name.charAt(0).toUpperCase() : option.email.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {option.full_name || option.email}
                      </Typography>
                      {option.full_name && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {option.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('wallet.recipient')}
                  placeholder="Pesquisar por nome ou email..."
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <User size={18} style={{ marginRight: 8, marginLeft: 8, color: '#94a3b8' }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
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
            disabled={transferLoading || !amount || !recipientEmail || (isExternalEmail && !isValidEmail)}
            startIcon={transferLoading && <CircularProgress size={18} color="inherit" />}
          >
            {t('wallet.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* My QR Code Dialog */}
      <Dialog
        open={openQrModal}
        onClose={() => setOpenQrModal(false)}
        PaperProps={{ sx: { borderRadius: '24px', p: 3, maxWidth: 350, width: '100%', textAlign: 'center' } }}
      >
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar src={user?.user_metadata?.avatar_url} sx={{ width: 64, height: 64, mb: 2, bgcolor: 'primary.main' }}>
            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || <User />}
          </Avatar>
          <Typography variant="h4" gutterBottom>
            {user?.user_metadata?.full_name || 'Usuário Tekuá'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {user?.email}
          </Typography>

          <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, display: 'inline-block' }}>
            {user?.email && (
              <QRCodeSVG value={user.email} size={200} level="H" includeMargin={false} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            Apresente este código para receber moedas de outro membro de forma rápida.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button variant="contained" onClick={() => setOpenQrModal(false)} fullWidth>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog
        open={openScannerModal}
        onClose={() => setOpenScannerModal(false)}
        PaperProps={{ sx: { borderRadius: '24px', p: 2, maxWidth: 450, width: '100%' } }}
      >
        <DialogTitle sx={{ pb: 1, textAlign: 'center' }}>
          <Typography variant="h3">Escanear QR Code</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 1 }}>
          {openScannerModal && (
            <QRScanner
              onScan={(result) => {
                setRecipientEmail(result);
                setOpenScannerModal(false);
                setOpenTransfer(true);
              }}
              onCancel={() => setOpenScannerModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Wallet;
