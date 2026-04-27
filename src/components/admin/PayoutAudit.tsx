import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Check, X } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useTranslation } from 'react-i18next';

const PayoutAudit: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPendingAudits = async () => {
    setLoading(true);
    try {
      const { data, error } = await apiClient.invoke('api-work', 'fetchPendingPayouts');

      if (error) throw new Error(error);
      setActivities(data || []);
    } catch (err: any) {
      console.error('Error fetching pending audits:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAudits();
  }, []);

  const handleAudit = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      const { error } = await apiClient.invoke('api-work', 'auditPayout', {
        activityId: id,
        status: status
      });

      if (error) throw new Error(error);
      
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      console.error('Error processing audit:', err);
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" gutterBottom fontWeight={600}>
          {t('admin.payoutAudit', 'Auditoria de Pagamentos')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('admin.payoutAuditDesc', 'Revise e aprove pagamentos pendentes de validação.')}
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {activities.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: '16px' }}>{t('admin.noPendingAudits', 'Nenhum payout pendente de auditoria.')}</Alert>
      ) : (
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
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.colMember', 'Membro')}</TableCell>
                <TableCell>{t('activity.title', 'Atividade')}</TableCell>
                <TableCell>{t('wallet.amount', 'Valor')}</TableCell>
                <TableCell>{t('common.date', 'Data')}</TableCell>
                <TableCell align="right">{t('common.actions', 'Ações')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    {activity.profiles?.full_name || activity.profiles?.email}
                  </TableCell>
                  <TableCell>
                    {activity.title[i18n.language] || activity.title['pt']}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={700} color="secondary.main">
                      {activity.reward_amount} SUR
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(activity.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success"
                        startIcon={<Check size={16} />}
                        onClick={() => handleAudit(activity.id, 'approved')}
                        disabled={!!processing}
                      >
                        {t('common.approve', 'Aprovar')}
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        startIcon={<X size={16} />}
                        onClick={() => handleAudit(activity.id, 'rejected')}
                        disabled={!!processing}
                      >
                        {t('common.reject', 'Rejeitar')}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PayoutAudit;
