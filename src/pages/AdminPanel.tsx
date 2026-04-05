import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Avatar,
  Chip,
  IconButton,
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
  Tooltip
} from '@mui/material';
import { 
  Search, 
  MoreVertical, 
  UserPlus, 
  UserMinus, 
  ShieldAlert,
  User as UserIcon,
  Filter,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setMessage({ type: 'error', text: 'Erro ao carregar lista de usuários.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
      
      // Note: This would ideally be an Edge Function call for security/RBAC.
      // For now, we update directly if RLS allows or via service role.
      // The prompt specified Edge Functions, so we should call one.
      const { data: _data, error } = await supabase.functions.invoke('update-user-role', {
        body: { userId: selectedUser.id, role: newRole }
      });

      if (error) throw error;
      
      setMessage({ type: 'success', text: `Cargo de ${selectedUser.full_name} atualizado para ${newRole}.` });
      fetchUsers();
    } catch (err: any) {
      console.error('Error updating role:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar cargo. Verifique se a Edge Function está configurada.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h2" color="primary.main" gutterBottom>
            Gerenciamento de Usuários
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualize e gerencie os membros da associação e suas permissões.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Atualizar">
            <IconButton onClick={fetchUsers} disabled={loading}>
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </IconButton>
          </Tooltip>
          <Button 
            variant="contained" 
            startIcon={<UserPlus size={20} />}
            sx={{ py: 1.5, px: 3 }}
          >
            Novo Membro
          </Button>
        </Box>
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
          placeholder="Buscar por nome ou email..."
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
          Filtros
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
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 3 }}>MEMBRO</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>EMAIL</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>CARGO</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>STATUS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhum usuário encontrado.
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
                        {user.full_name || 'Sem nome'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
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
                      <Typography variant="body2">Ativo</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                      <MoreVertical size={20} color="#94a3b8" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
          <ListItemText primary="Ver Perfil" />
        </MenuItem>
        <MenuItem onClick={handleToggleRole} disabled={actionLoading}>
          <ListItemIcon>
            {actionLoading ? <CircularProgress size={18} /> : <ShieldAlert size={18} />}
          </ListItemIcon>
          <ListItemText primary={selectedUser?.role === 'admin' ? "Remover Administrador" : "Tornar Administrador"} />
        </MenuItem>
        <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
        <MenuItem onClick={handleMenuClose} sx={{ color: '#ef4444' }}>
          <ListItemIcon><UserMinus size={18} color="#ef4444" /></ListItemIcon>
          <ListItemText primary="Remover Acesso" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminPanel;
