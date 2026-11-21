import React, { useState } from 'react';
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
  TablePagination,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Edit2, Search, KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMembers } from '../hooks/useMembers';
import MemberEditModal from '../components/admin/MemberEditModal';

const MemberManagement: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { members, loading, error, refreshMembers, sendPasswordSetupEmail } = useMembers();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; text: string } | null>(null);

  const handleSendPasswordEmail = async (member: any) => {
    if (sendingId || !member.email) return;
    if (!window.confirm(t('admin.sendPasswordEmailConfirm', { email: member.email }))) return;
    setSendingId(member.id);
    const result = await sendPasswordSetupEmail(member.id);
    setSendingId(null);
    if (!result.success) {
      setFeedback({ severity: 'error', text: result.error || t('common.error') });
    } else if (result.emailStatus === 'queued') {
      setFeedback({ severity: 'success', text: t('admin.sendPasswordEmailQueued') });
    } else {
      setFeedback({ severity: 'success', text: t('admin.sendPasswordEmailSent', { email: member.email }) });
    }
  };

  const handleEditClick = (member: any) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.roles?.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const paginatedMembers = filteredMembers.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" color="primary.main" gutterBottom>
          {t('admin.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('admin.subtitle')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4, borderRadius: '16px', bgcolor: 'background.paper' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('admin.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search size={18} style={{ marginRight: 8, color: '#94a3b8' }} />,
            }}
          />
          <TextField
            select
            size="small"
            sx={{ minWidth: 200 }}
            label={t('admin.filters')}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="all">{t('common.all') || 'Todos'}</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
            <MenuItem value="transversal_council">Conselho Transversal</MenuItem>
            <MenuItem value="member">Membro</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: '16px', overflow: 'hidden', bgcolor: 'background.paper' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.colMember')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.colEmail')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.colRole')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.colStatus')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {t('admin.noUsersFound')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedMembers.map((member) => (
                <TableRow key={member.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={member.avatar_url} sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                        {member.full_name?.charAt(0) || member.email?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {member.full_name || t('admin.noName')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {member.roles?.map((role: string) => (
                          <Chip 
                            key={role}
                            label={
                              role === 'admin' 
                                ? 'Admin' 
                                : role === 'transversal_council' 
                                ? 'Conselho' 
                                : role === 'beneficiary'
                                ? 'Beneficiário (Vila)'
                                : 'Membro'
                            } 
                            color={
                              role === 'admin' 
                                ? 'secondary' 
                                : role === 'transversal_council' 
                                ? 'info'
                                : role === 'beneficiary'
                                ? 'success'
                                : 'default'
                            }
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {member.functions?.map((func: string) => (
                          <Chip 
                            key={func}
                            label={func} 
                            color="primary"
                            size="small"
                            sx={{ fontSize: '0.65rem' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={t('admin.active')} 
                      color="success" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleSendPasswordEmail(member)}
                      disabled={sendingId !== null || !member.email}
                      title={t('admin.sendPasswordEmail')}
                      aria-label={t('admin.sendPasswordEmail')}
                    >
                      {sendingId === member.id ? <CircularProgress size={18} /> : <KeyRound size={18} />}
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEditClick(member)} title={t('admin.editMember')}>
                      <Edit2 size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredMembers.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => setPageSize(parseInt(e.target.value, 10))}
        />
      </TableContainer>

      <Snackbar open={!!feedback} autoHideDuration={6000} onClose={() => setFeedback(null)}>
        {feedback ? <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>{feedback.text}</Alert> : undefined}
      </Snackbar>

      {selectedMember && (
        <MemberEditModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          member={selectedMember}
          onSave={refreshMembers}
        />
      )}
    </Box>
  );
};

export default MemberManagement;
