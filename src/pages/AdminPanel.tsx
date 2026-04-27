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
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip
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
  ShieldCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../lib/api';
import DocumentManager from '../components/admin/DocumentManager';
import FinancialIntegrity from '../components/admin/FinancialIntegrity';
import PayoutAudit from '../components/admin/PayoutAudit';
import ActivityHistoryTab from '../components/admin/ActivityHistoryTab';
import { History } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');

  const tabMap: Record<string, number> = {
    'users': 0,
    'config': 1,
    'docs': 2,
    'financial': 3,
    'payouts': 4,
    'activity': 5
  };

  const reverseTabMap: Record<number, string> = {
    0: 'users',
    1: 'config',
    2: 'docs',
    3: 'financial',
    4: 'payouts',
    5: 'activity'
  };

  const [tabValue, setTabValue] = useState(currentTab ? (tabMap[currentTab] ?? 0) : 0);
  const [threshold, setThreshold] = useState<number>(3);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    if (currentTab && tabMap[currentTab] !== undefined) {
      setTabValue(tabMap[currentTab]);
    }
  }, [currentTab]);

  const handleTabChange = (_: any, newValue: number) => {
    setTabValue(newValue);
    setSearchParams({ tab: reverseTabMap[newValue] });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await apiClient.invoke('api-members', 'fetchUsers');
      if (error) throw new Error(error);
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
      const { error } = await apiClient.invoke('api-governance', 'saveConfig', {
        config: { min_contribution_confirmations: threshold }
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
    setSelectedUser(null);
  };

  const handleToggleRole = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    handleMenuClose();
    
    try {
      const newRole = selectedUser.role === 'admin' ? 'member' : 'admin';
      
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

      <Paper sx={{ mb: 4, borderRadius: '16px', bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab icon={<Users size={18} />} iconPosition="start" label={t('admin.userManagement')} />
          <Tab icon={<Settings size={18} />} iconPosition="start" label={t('governance.config')} />
          <Tab icon={<FileText size={18} />} iconPosition="start" label={t('docs.docsTitle', 'Documentação')} />
          <Tab icon={<DollarSign size={18} />} iconPosition="start" label={t('admin.financial')} />
          <Tab icon={<ShieldCheck size={18} />} iconPosition="start" label={t('admin.payoutAudit')} />
          <Tab icon={<History size={18} />} iconPosition="start" label={t('audit.title')} />
        </Tabs>
      </Paper>

      {tabValue === 0 ? (
        <>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" color="primary.main" gutterBottom fontWeight={600}>
                {t('admin.userManagement')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('admin.subtitle')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title={t('admin.refresh')}>
                <IconButton onClick={fetchUsers} disabled={loading}>
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </IconButton>
              </Tooltip>
              <Button 
                variant="contained" 
                startIcon={<UserPlus size={20} />}
                sx={{ py: 1.5, px: 3, borderRadius: '12px' }}
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

          <TableContainer 
            component={Paper} 
            elevation={0}
            sx={{ 
              backgroundColor: 'background.paper', 
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              overflow: 'hidden',
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
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
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
                        <Chip 
                          label={user.role === 'admin' ? 'Admin' : t('profile.member')} 
                          size="small" 
                          variant="outlined" 
                          sx={{ textTransform: 'capitalize', color: 'primary.light', borderColor: 'rgba(99, 102, 241, 0.3)' }} 
                        />
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
            <Button 
              variant="contained" 
              size="large"
              onClick={handleSaveConfig}
              disabled={savingConfig}
              startIcon={savingConfig ? <CircularProgress size={20} /> : <Settings size={20} />}
              sx={{ borderRadius: '12px', py: 1.5 }}
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
        <PayoutAudit />
      ) : tabValue === 5 ? (
        <ActivityHistoryTab />
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
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><UserIcon size={18} /></ListItemIcon>
          <ListItemText primary={t('admin.viewProfile')} />
        </MenuItem>
        <MenuItem onClick={handleToggleRole} disabled={actionLoading}>
          <ListItemIcon>
            {actionLoading ? <CircularProgress size={18} /> : <ShieldAlert size={18} />}
          </ListItemIcon>
          <ListItemText primary={selectedUser?.role === 'admin' ? t('admin.removeAdmin') : t('admin.makeAdmin')} />
        </MenuItem>
        <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
        <MenuItem onClick={handleMenuClose} sx={{ color: '#ef4444' }}>
          <ListItemIcon><UserMinus size={18} color="#ef4444" /></ListItemIcon>
          <ListItemText primary={t('admin.removeAccess')} />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminPanel;
