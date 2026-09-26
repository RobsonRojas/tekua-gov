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
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { supabase } from '../../lib/supabase';
import { RefreshCw, Send } from 'lucide-react';

const EmailQueuePanel: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_queue')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setQueue(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar a fila de e-mails.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleRetry = async (id: string) => {
    setRetrying(id);
    try {
      // Try to re-send using the Edge Function
      const { error } = await supabase.functions.invoke('cron_retry_emails');
      if (error) throw error;
      
      // Refresh the list
      await fetchQueue();
    } catch (err: any) {
      console.error(err);
      setError('Erro ao acionar reenvio.');
    } finally {
      setRetrying(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Fila de E-mails Pendentes</Typography>
        <Button 
          startIcon={<RefreshCw size={16} />} 
          onClick={fetchQueue}
          variant="outlined"
          disabled={loading}
        >
          Atualizar
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>E-mail</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Mensagem de Erro</TableCell>
              <TableCell>Data</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : queue.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  Nenhum e-mail na fila.
                </TableCell>
              </TableRow>
            ) : (
              queue.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={item.status} 
                      color={item.status === 'sent' ? 'success' : item.status === 'failed' ? 'error' : 'warning'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.error_message}
                  </TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button 
                      size="small" 
                      startIcon={retrying === item.id ? <CircularProgress size={12} /> : <Send size={14} />}
                      onClick={() => handleRetry(item.id)}
                      disabled={retrying !== null || item.status === 'sent'}
                      variant="outlined"
                    >
                      Reenviar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmailQueuePanel;
