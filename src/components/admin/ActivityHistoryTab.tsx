import React from 'react';
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
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LogIn, FileText, CheckSquare, Edit2, Activity, Info } from 'lucide-react';
import { useAdminActivity } from '../../hooks/useAdminActivity';
import ActivityFilters from './ActivityFilters';
import ActivityStats from './ActivityStats';

export type ActivityActionType = 'auth' | 'vote' | 'task' | 'document' | 'profile_update' | 'other';

const ActivityHistoryTab: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { 
    logs, 
    loading, 
    error, 
    totalCount, 
    page, 
    setPage, 
    pageSize, 
    filters, 
    updateFilters 
  } = useAdminActivity();

  const getIconForType = (type: ActivityActionType) => {
    switch (type) {
      case 'auth': return <LogIn size={18} />;
      case 'vote': return <FileText size={18} />;
      case 'task': return <CheckSquare size={18} />;
      case 'document': return <FileText size={18} />;
      case 'profile_update': return <Edit2 size={18} />;
      default: return <Activity size={18} />;
    }
  };

  const getColorForType = (type: ActivityActionType) => {
    switch (type) {
      case 'auth': return 'info';
      case 'vote': return 'secondary';
      case 'task': return 'success';
      case 'profile_update': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" gutterBottom fontWeight={600}>
          {t('audit.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('audit.description')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      <ActivityStats logs={logs} />

      <ActivityFilters filters={filters} onFilterChange={updateFilters} />

      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          backgroundColor: 'background.paper', 
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden'
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 3 }}>{t('audit.table.user')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('audit.table.action')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('audit.table.date')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('audit.table.details')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                  <Typography variant="body1" color="text.secondary">
                    {t('activity.noActivity')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const currentLang = i18n.language || 'pt';
                const description = log.description[currentLang] || log.description['pt'] || 'Activity';
                
                return (
                  <TableRow 
                    key={log.id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}
                        >
                          {log.profiles?.full_name?.charAt(0) || log.profiles?.email?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {log.profiles?.full_name || t('admin.noName')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.profiles?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={getIconForType(log.action_type)}
                        label={t(`activity.type.${log.action_type === 'profile_update' ? 'profile' : log.action_type}`)}
                        color={getColorForType(log.action_type) as any}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '8px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(log.created_at).toLocaleDateString(currentLang)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.created_at).toLocaleTimeString(currentLang)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {description}
                        </Typography>
                        {Object.keys(log.description).length > 1 && (
                          <Tooltip title={JSON.stringify(log.description, null, 2)}>
                            <IconButton size="small" sx={{ color: 'primary.light' }}>
                              <Info size={14} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
          sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
        />
      </TableContainer>
    </Box>
  );
};

export default ActivityHistoryTab;
