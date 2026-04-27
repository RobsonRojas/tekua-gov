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
  Alert, 
  CircularProgress,
  Button
} from '@mui/material';
import { RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

interface Discrepancy {
  wallet_id: string;
  profile_id: string;
  materialized_balance: number;
  ledger_sum: number;
  discrepancy: number;
}

const FinancialIntegrity: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [error, setError] = useState<string | null>(null);

  const checkIntegrity = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase.rpc('verify_ledger_integrity');
      
      if (fetchError) throw fetchError;
      setDiscrepancies(data || []);
    } catch (err: any) {
      console.error('Error checking integrity:', err);
      setError(err.message || 'Error checking financial integrity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkIntegrity();
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {t('admin.financialIntegrity') || 'Integridade Financeira'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('admin.integrityDesc') || 'Verificação de reconciliação entre o saldo materializado e o livro razão (ledger).'}
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshCw size={18} />}
          onClick={checkIntegrity}
          disabled={loading}
        >
          {t('common.refresh')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : discrepancies.length === 0 ? (
        <Alert 
          icon={<ShieldCheck size={24} />} 
          severity="success" 
          sx={{ borderRadius: '16px', py: 2 }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {t('admin.noDiscrepancies') || 'Sistema Reconciliado'}
          </Typography>
          <Typography variant="body2">
            {t('admin.noDiscrepanciesDesc') || 'Todas as carteiras estão em conformidade com o livro razão.'}
          </Typography>
        </Alert>
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
            <TableHead sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>{t('admin.walletId')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('admin.currentBalance')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('admin.ledgerSum')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ef4444' }}>{t('admin.discrepancy')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discrepancies.map((d) => (
                <TableRow key={d.wallet_id}>
                  <TableCell>{d.wallet_id}</TableCell>
                  <TableCell>{d.materialized_balance.toFixed(2)}</TableCell>
                  <TableCell>{d.ledger_sum.toFixed(2)}</TableCell>
                  <TableCell sx={{ color: '#ef4444', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AlertTriangle size={16} />
                      {d.discrepancy.toFixed(2)}
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

export default FinancialIntegrity;
