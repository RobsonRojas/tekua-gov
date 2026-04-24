import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Chip,
  Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ActivityReportItem } from '../hooks/useActivityReports';

interface ContributionTableProps {
  data: ActivityReportItem[];
}

const ContributionTable: React.FC<ContributionTableProps> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'pt' ? 'pt' : 'en';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'rejected': return 'error';
      case 'open': return 'info';
      case 'in_progress': return 'primary';
      default: return 'warning';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary">
          {t('work.noItems') || 'Nenhum resultado encontrado.'}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
      <Table stickyHeader aria-label="activity reports table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('admin.date') || 'Data'}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('work.type') || 'Tipo'}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('work.contributor') || 'Membro'}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('docs.title') || 'Título'}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">{t('work.amount') || 'Valor'}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">{t('work.status') || 'Status'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{formatDate(row.created_at)}</TableCell>
              <TableCell>
                <Chip 
                  label={t(`work.${row.type}`) || row.type} 
                  size="small" 
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {row.worker?.full_name || row.requester?.full_name || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(row.worker_id || row.requester_id || '').substring(0, 8)}...
                </Typography>
              </TableCell>
              <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.title?.[lang] || row.title?.pt || row.title?.en || 'N/A'}
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Typography variant="body2" fontWeight={600}>
                    $S {row.reward_amount.toLocaleString()}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Chip 
                  label={t(`work.${row.status}`) || row.status} 
                  color={getStatusColor(row.status) as any} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContributionTable;
