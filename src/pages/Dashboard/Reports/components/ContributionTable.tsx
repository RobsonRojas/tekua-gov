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
import type { ContributionReportItem } from '../hooks/useContributionReports';

interface ContributionTableProps {
  data: ContributionReportItem[];
}

const ContributionTable: React.FC<ContributionTableProps> = ({ data }) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'rejected': return 'error';
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
      <Table stickyHeader aria-label="contribution reports table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('admin.date') || 'Data'}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('work.contributor') || 'Contribuidor'}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('work.description') || 'Descrição'}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">{t('work.amount') || 'Valor'}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">{t('work.status') || 'Status'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{formatDate(row.created_at)}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {row.profiles?.full_name || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.user_id.substring(0, 8)}...
                </Typography>
              </TableCell>
              <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.description}
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Typography variant="body2" fontWeight={600}>
                    ₮ {row.amount_suggested.toLocaleString()}
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
