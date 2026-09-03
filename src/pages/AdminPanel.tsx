import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  InputAdornment, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  CircularProgress, 
  Alert, 
  Tooltip, 
  Tabs, 
  Tab, 
  Stack,
  Typography,
  Paper,
  Grid,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Search, 
  MoreVertical, 
  UserPlus, 
  UserMinus, 
  ShieldAlert,
  User as UserIcon,
  Filter,
  RefreshCw,
  Settings,
  Users,
  FileText,
  DollarSign,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import DocumentManager from '../components/admin/DocumentManager';
import FinancialIntegrity from '../components/admin/FinancialIntegrity';
import PayoutAudit from '../components/admin/PayoutAudit';
import ActivityHistoryTab from '../components/admin/ActivityHistoryTab';
import NewMemberModal from '../components/admin/NewMemberModal';
import EconomyTab from '../components/admin/EconomyTab';
import { useAuth } from '../context/useAuth';
import { useMembers } from '../hooks/useMembers';
import { History, TrendingUp, Gift } from 'lucide-react';
import RewardsManager from '../components/admin/RewardsManager';

const AdminPanel: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAdjustBalanceModalOpen, setIsAdjustBalanceModalOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustJustification, setAdjustJustification] = useState('');
  const { user: authUser } = useAuth();
  const { fetchMembersWithBalances } = useMembers();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');

  const ADMIN_TABS = [
    { id: 'users', label: t('admin.userManagement'), icon: <Users size={18} />, value: 0 },
    { id: 'config', label: t('governance.config'), icon: <Settings size={18} />, value: 1 },
    { id: 'docs', label: t('docs.docsTitle', 'Documentação'), icon: <FileText size={18} />, value: 2 },
    { id: 'financial', label: t('admin.financial'), icon: <DollarSign size={18} />, value: 3 },
    { id: 'economy', label: 'Economia', icon: <TrendingUp size={18} />, value: 4 },
    { id: 'payouts', label: t('admin.payoutAudit'), icon: <ShieldCheck size={18} />, value: 5 },
    { id: 'activity', label: t('audit.title'), icon: <History size={18} />, value: 6 },
    { id: 'rewards', label: 'Prêmios', icon: <Gift size={18} />, value: 7 }
  ];

  const [tabValue, setTabValue] = useState(() => {
    if (!currentTab) return 0;
    const tab = ADMIN_TABS.find(t => t.id === currentTab);
    return tab ? tab.value : 0;
  });

  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [threshold, setThreshold] = useState<number>(3);
  const [frequencies, setFrequencies] = useState<any>({
    urgent_important: '1 hour',
    urgent_not_important: '1 day',
    not_urgent_important: '1 day',
    not_urgent_not_important: '1 week'
  });
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    if (currentTab) {
      const tab = ADMIN_TABS.find(t => t.id === currentTab);
      if (tab && tab.value !== tabValue) {
        setTabValue(tab.value);
      }
    }
  }, [currentTab]);

  const handleTabChange = (_: any, newValue: number) => {
    setTabValue(newValue);
    const tab = ADMIN_TABS.find(t => t.value === newValue);
    if (tab) {
      setSearchParams({ tab: tab.id });
    }
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const handleMobileMenuSelect = (value: number) => {
    handleTabChange(null, value);
    handleMobileMenuClose();
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchMembersWithBalances();
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setMessage({ type: 'error', text: t('admin.loadError') });
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const { data, error } = await apiClient.invoke('api-governance', 'fetchSettings');
      if (!error && data) {
        // Handle singleton config structure
        setThreshold(data.min_contribution_confirmations || 3);
        if (data.task_reminder_frequencies) {
          setFrequencies(data.task_reminder_frequencies);
        }
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchConfig();
  }, []);

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      // Validate frequencies (basic check)
      const intervalRegex = /^\d+\s+(hour|day|week|month)s?$/;
      for (const key in frequencies) {
        if (!intervalRegex.test(frequencies[key])) {
          throw new Error(t('admin.invalidInterval', { key }) || `Intervalo inválido para ${key}. Use formatos como "1 hour" ou "2 days".`);
        }
      }

      const { error } = await apiClient.invoke('api-governance', 'saveConfig', {
        config: { 
          min_contribution_confirmations: threshold,
          task_reminder_frequencies: frequencies
        }
      });

      if (error) throw new Error(error);
      setMessage({ type: 'success', text: t('common.success') });
    } catch (err: any) {
      console.error('Error saving config:', err);
      setMessage({ type: 'error', text: err.message || t('common.error') });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Note: selectedUser is NOT cleared here to allow Dialogs to use its data
    // It will be cleared when a Dialog is closed or an action completes
  };

  const handleToggleRole = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    handleMenuClose();
    
    try {
      const roles = ['member', 'transversal_council', 'admin'];
      const currentIndex = roles.indexOf(selectedUser.role || 'member');
      const newRole = roles[(currentIndex + 1) % roles.length];
      
      const { error } = await apiClient.invoke('api-members', 'manageAdmin', {
        targetUserId: selectedUser.id,
        role: newRole
      });

      if (error) throw new Error(error);
      
      setMessage({ type: 'success', text: t('admin.updateRoleSuccess', { name: selectedUser.full_name, role: newRole }) });
      fetchUsers();
    } catch (err: any) {
      console.error('Error updating role:', err);
      setMessage({ type: 'error', text: err.message || t('admin.updateRoleError') });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    // Don't close the dialog yet, wait for the action to complete or fail
    
    try {
      const { error } = await apiClient.invoke('api-members', 'removeMember', {
        targetUserId: selectedUser.id
      });

      if (error) throw new Error(error);
      
      setMessage({ type: 'success', text: t('admin.removeMemberSuccess', { name: selectedUser.full_name || selectedUser.email }) });
      setIsDeleteDialogOpen(false); // Close only on success
      fetchUsers();
    } catch (err: any) {
      console.error('Error removing member:', err);
      setMessage({ type: 'error', text: err.message || t('admin.removeMemberError') });
    } finally {
      setActionLoading(false);
      // Only clear selectedUser when we are sure no more UI needs it
      if (!isDeleteDialogOpen) {
        setSelectedUser(null);
      }
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser || !adjustAmount || !adjustJustification) return;
    
    setActionLoading(true);
    try {
      const { error } = await apiClient.invoke('api-wallet', 'adjustBalance', {
        recipientId: selectedUser.id,
        amount: Number(adjustAmount),
        description: adjustJustification
      });

      if (error) throw new Error(error);
      
      setMessage({ type: 'success', text: 'Saldo ajustado com sucesso!' });
      setIsAdjustBalanceModalOpen(false);
      setAdjustAmount('');
      setAdjustJustification('');
      fetchUsers();
    } catch (err: any) {
      console.error('Error adjusting balance:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao ajustar saldo' });
    } finally {
      setActionLoading(false);
      if (!isAdjustBalanceModalOpen) {
        setSelectedUser(null);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || t('admin.noName')).toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" color="primary.main" gutterBottom>
          {t('admin.title')}
        </Typography>
      </Box>

      {message && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage(null)}
          sx={{ mb: 4, borderRadius: '12px' }}
        >
          {message.text}
        </Alert>
      )}

      {isMobile ? (
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={handleMobileMenuOpen}
            variant="outlined"
            startIcon={ADMIN_TABS.find(t => t.value === tabValue)?.icon}
            endIcon={<ChevronDown size={14} />}
            sx={{ 
              borderRadius: '12px', 
              textTransform: 'none', 
              fontWeight: 600,
              minWidth: '100%',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              bgcolor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {ADMIN_TABS.find(t => t.value === tabValue)?.label}
          </Button>
          <Menu
            anchorEl={mobileMenuAnchorEl}
            open={Boolean(mobileMenuAnchorEl)}
            onClose={handleMobileMenuClose}
            transformOrigin={{ horizontal: 'center', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
            PaperProps={{
              sx: { 
                borderRadius: '12px', 
                minWidth: 'calc(100% - 32px)', 
                mt: 1,
                bgcolor: 'background.paper',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
              }
            }}
          >
            {ADMIN_TABS.map((opt) => (
              <MenuItem 
                key={opt.value} 
                onClick={() => handleMobileMenuSelect(opt.value)}
                selected={tabValue === opt.value}
                sx={{ py: 1.5 }}
              >
                <ListItemIcon sx={{ color: tabValue === opt.value ? 'primary.main' : 'inherit' }}>
                  {opt.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={opt.label} 
                  primaryTypographyProps={{ 
                    fontWeight: tabValue === opt.value ? 700 : 500,
                    color: tabValue === opt.value ? 'primary.main' : 'inherit'
                  }} 
                />
              </MenuItem>
            ))}
          </Menu>
        </Box>
      ) : (
        <Paper sx={{ mb: 4, borderRadius: '16px', bgcolor: 'background.paper', overflow: 'hidden' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                gap: 1
              }
            }}
          >
            {ADMIN_TABS.map((opt) => (
              <Tab 
                key={opt.value}
                icon={opt.icon} 
                iconPosition="start" 
                label={opt.label} 
              />
            ))}
          </Tabs>
        </Paper>
      )}

      {tabValue === 0 ? (
        <>
          <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h4" color="primary.main" gutterBottom fontWeight={600}>
                {t('admin.userManagement')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('admin.subtitle')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
              <Tooltip title={t('admin.refresh')}>
                <IconButton onClick={fetchUsers} disabled={loading}>
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </IconButton>
              </Tooltip>
              <Button 
                variant="contained" 
                startIcon={<UserPlus size={20} />}
                onClick={() => setIsNewMemberModalOpen(true)}
                sx={{ py: 1.5, px: 3, borderRadius: '12px', flex: { xs: 1, sm: 'none' } }}
              >
                {t('admin.newMember')}
              </Button>
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              backgroundColor: 'background.paper',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              gap: 2,
              alignItems: 'center'
            }}
          >
            <TextField
              fullWidth
              placeholder={t('admin.searchPlaceholder')}
              variant="outlined"
              size="medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#94a3b8" />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: '400px' }}
            />
            <Button 
              variant="outlined" 
              startIcon={<Filter size={18} />}
              sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: 'text.secondary' }}
            >
              {t('admin.filters')}
            </Button>
          </Paper>

          {!isMobile ? (
            <TableContainer 
              component={Paper} 
              elevation={0}
              sx={{ 
                backgroundColor: 'background.paper', 
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                overflowX: 'auto',
                position: 'relative'
              }}
            >
              {loading && (
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(15, 23, 42, 0.5)', zIndex: 1 }}>
                  <CircularProgress />
                </Box>
              )}
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 3 }}>{t('admin.colMember')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('admin.colEmail')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('admin.colRole')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('admin.colStatus')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Saldo SR$</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 && !loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                        <Typography variant="body1" color="text.secondary">
                          {t('admin.noUsersFound')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow 
                        key={user.id}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' }
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                width: 40, 
                                height: 40, 
                                bgcolor: user.role === 'admin' ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                              }}
                            >
                              {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                            </Avatar>
                            <Typography variant="body1" fontWeight={600}>
                              {user.full_name || t('admin.noName')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email || t('profile.na')}</TableCell>
                        <TableCell>
                          <Stack spacing={0.5} alignItems="flex-start">
                            <Chip 
                              label={
                                user.role === 'admin' ? 'Admin' : 
                                user.role === 'transversal_council' ? t('profile.transversal_council') || 'Conselho' : 
                                t('profile.member')
                              } 
                              size="small" 
                              variant="outlined" 
                              sx={{ 
                                textTransform: 'capitalize', 
                                color: user.role === 'admin' ? 'primary.light' : user.role === 'transversal_council' ? 'secondary.light' : 'text.secondary',
                                borderColor: user.role === 'admin' ? 'rgba(99, 102, 241, 0.3)' : user.role === 'transversal_council' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                              }} 
                            />
                            {user.is_board_member && (
                              <Chip 
                                label={user.board_role || 'Diretoria'} 
                                size="small" 
                                color="secondary"
                                sx={{ fontSize: '0.65rem', height: '18px' }} 
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: 'secondary.main' 
                              }} 
                            />
                            <Typography variant="body2">{t('admin.active')}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {user.surreal_balance?.toFixed(2) || '0.00'} SR$
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={(e: React.MouseEvent<HTMLElement>) => handleMenuOpen(e, user)}>
                            <MoreVertical size={20} color="#94a3b8" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Stack spacing={2}>
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              {filteredUsers.length === 0 && !loading ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <Typography variant="body1" color="text.secondary">
                    {t('admin.noUsersFound')}
                  </Typography>
                </Paper>
              ) : (
                filteredUsers.map((user) => (
                  <Paper 
                    key={user.id}
                    sx={{ 
                      p: 2, 
                      borderRadius: '16px', 
                      bgcolor: 'background.paper', 
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          bgcolor: user.role === 'admin' ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}
                      >
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ color: 'text.primary' }}>
                          {user.full_name || t('admin.noName')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {user.email || t('profile.na')}
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuOpen(e, user)}
                        sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
                      >
                        <MoreVertical size={20} />
                      </IconButton>
                    </Box>
                    
                    <Divider sx={{ mb: 2, opacity: 0.1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <Stack spacing={1}>
                        <Chip 
                          label={
                            user.role === 'admin' ? 'Admin' : 
                            user.role === 'transversal_council' ? t('profile.transversal_council') || 'Conselho' : 
                            t('profile.member')
                          } 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            textTransform: 'capitalize',
                            color: user.role === 'admin' ? 'primary.light' : user.role === 'transversal_council' ? 'secondary.light' : 'text.secondary',
                            borderColor: user.role === 'admin' ? 'rgba(99, 102, 241, 0.3)' : user.role === 'transversal_council' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                            fontSize: '0.75rem'
                          }}
                        />
                        {user.is_board_member && (
                          <Chip 
                            label={user.board_role || 'Diretoria'} 
                            size="small" 
                            color="secondary"
                            sx={{ fontSize: '0.65rem', height: '18px' }} 
                          />
                        )}
                      </Stack>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          {user.surreal_balance?.toFixed(2) || '0.00'} SR$
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main' }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {t('admin.active')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                ))
              )}
            </Stack>
          )}
        </>
      ) : tabValue === 1 ? (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" color="primary.main" gutterBottom fontWeight={600}>
              {t('governance.config')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('governance.thresholdDesc')}
            </Typography>
          </Box>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              borderRadius: '24px', 
              bgcolor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <Stack spacing={3} sx={{ maxWidth: 400 }}>
            <TextField
              label={t('governance.threshold')}
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              InputProps={{ inputProps: { min: 1, max: 20 } }}
              fullWidth
            />

            <Divider sx={{ my: 2 }}>
              <Chip label="Frequências de Lembrete (Eisenhower)" size="small" />
            </Divider>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Urgente & Importante"
                  value={frequencies.urgent_important}
                  onChange={(e) => setFrequencies({ ...frequencies, urgent_important: e.target.value })}
                  fullWidth
                  helperText="Ex: 1 hour"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Urgente & Não Importante"
                  value={frequencies.urgent_not_important}
                  onChange={(e) => setFrequencies({ ...frequencies, urgent_not_important: e.target.value })}
                  fullWidth
                  helperText="Ex: 1 day"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Não Urgente & Importante"
                  value={frequencies.not_urgent_important}
                  onChange={(e) => setFrequencies({ ...frequencies, not_urgent_important: e.target.value })}
                  fullWidth
                  helperText="Ex: 1 day"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Não Urgente & Não Importante"
                  value={frequencies.not_urgent_not_important}
                  onChange={(e) => setFrequencies({ ...frequencies, not_urgent_not_important: e.target.value })}
                  fullWidth
                  helperText="Ex: 1 week"
                />
              </Grid>
            </Grid>

            <Button 
              variant="contained" 
              size="large"
              onClick={handleSaveConfig}
              disabled={savingConfig}
              startIcon={savingConfig ? <CircularProgress size={20} /> : <Settings size={20} />}
              sx={{ borderRadius: '12px', py: 1.5, mt: 2 }}
            >
              {t('governance.save')}
            </Button>
          </Stack>
        </Paper>
        </>
      ) : tabValue === 2 ? (
        <DocumentManager />
      ) : tabValue === 3 ? (
        <FinancialIntegrity />
      ) : tabValue === 4 ? (
        <EconomyTab />
      ) : tabValue === 5 ? (
        <PayoutAudit />
      ) : tabValue === 6 ? (
        <ActivityHistoryTab />
      ) : tabValue === 7 ? (
        <RewardsManager />
      ) : null}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 8,
          sx: {
            backgroundColor: 'background.paper',
            borderRadius: '12px',
            minWidth: 200,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            mt: 1,
          }
        }}
      >
        <MenuItem onClick={() => {
          const userId = selectedUser?.id;
          handleMenuClose();
          if (userId) navigate(`/profile/${userId}`);
          setSelectedUser(null); // Clear now as we are navigating away
        }}>
          <ListItemIcon><UserIcon size={18} /></ListItemIcon>
          <ListItemText primary={t('admin.viewProfile')} />
        </MenuItem>
        <MenuItem onClick={async () => {
          await handleToggleRole();
          setSelectedUser(null); // Clear after action
        }} disabled={actionLoading}>
          <ListItemIcon>
            {actionLoading ? <CircularProgress size={18} /> : <ShieldAlert size={18} />}
          </ListItemIcon>
          <ListItemText primary={
            selectedUser?.role === 'admin' ? t('admin.makeMember') || 'Tornar Membro' : 
            selectedUser?.role === 'transversal_council' ? t('admin.makeAdmin') || 'Tornar Admin' : 
            t('admin.makeCouncil') || 'Tornar Conselho'
          } />
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          setIsAdjustBalanceModalOpen(true);
        }}>
          <ListItemIcon><DollarSign size={18} /></ListItemIcon>
          <ListItemText primary="Ajustar Saldo" />
        </MenuItem>
        <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
        <MenuItem 
          onClick={() => {
            handleMenuClose();
            setIsDeleteDialogOpen(true);
          }} 
          sx={{ color: '#ef4444' }}
          disabled={selectedUser?.id === authUser?.id}
        >
          <ListItemIcon><UserMinus size={18} color="#ef4444" /></ListItemIcon>
          <ListItemText primary={t('admin.removeAccess')} />
        </MenuItem>
      </Menu>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => {
          if (!actionLoading) {
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: 'background.paper',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {t('admin.confirmRemoveTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('admin.confirmRemoveDesc', { name: selectedUser?.full_name || selectedUser?.email })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => {
              setIsDeleteDialogOpen(false);
              setSelectedUser(null);
            }}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
            disabled={actionLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleRemoveMember}
            variant="contained"
            color="error"
            autoFocus
            sx={{ borderRadius: '8px' }}
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {t('admin.removeAccess')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isAdjustBalanceModalOpen}
        onClose={() => {
          if (!actionLoading) {
            setIsAdjustBalanceModalOpen(false);
            setSelectedUser(null);
            setAdjustAmount('');
            setAdjustJustification('');
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: 'background.paper',
            minWidth: { xs: '300px', sm: '400px' }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Ajustar Saldo
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Ajustando saldo de: <strong>{selectedUser?.full_name || selectedUser?.email}</strong>
            <br />
            Saldo atual: {selectedUser?.surreal_balance?.toFixed(2)} SR$
          </DialogContentText>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Valor (use negativo para reduzir)"
              type="number"
              fullWidth
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              disabled={actionLoading}
            />
            <TextField
              label="Justificativa"
              fullWidth
              multiline
              rows={2}
              value={adjustJustification}
              onChange={(e) => setAdjustJustification(e.target.value)}
              disabled={actionLoading}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => {
              setIsAdjustBalanceModalOpen(false);
              setSelectedUser(null);
              setAdjustAmount('');
              setAdjustJustification('');
            }}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
            disabled={actionLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleAdjustBalance}
            variant="contained"
            color="primary"
            sx={{ borderRadius: '8px' }}
            disabled={actionLoading || !adjustAmount || !adjustJustification}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Ajustar
          </Button>
        </DialogActions>
      </Dialog>

      <NewMemberModal 
        open={isNewMemberModalOpen} 
        onClose={() => setIsNewMemberModalOpen(false)}
        onSuccess={() => {
          setMessage({ type: 'success', text: t('common.success') });
          fetchUsers();
        }}
      />
    </Box>
  );
};

export default AdminPanel;
