import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Container, Paper, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { apiClient } from '../lib/api';

const ShareSurrealLanding: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [shareData, setShareData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShare = async () => {
      if (!shareId) {
        setError('Link inválido.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await apiClient.invoke('api-public', 'getShareSurrealReceipt', { shareId });
        if (error) throw new Error(error);
        setShareData(data);
      } catch (err: any) {
        setError(err.message || 'Link inválido ou expirado.');
      } finally {
        setLoading(false);
      }
    };

    fetchShare();
  }, [shareId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
          <Typography variant="h5" gutterBottom>
            Não foi possível carregar este compartilhamento.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            O link pode estar incorreto ou não estar mais disponível. Entre para ver as oportunidades de trabalho e comece a ganhar Surreais.
          </Typography>
          <Button variant="contained" fullWidth onClick={() => navigate('/login')}>
            Ir para Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="overline" color="primary.main" fontWeight={700} sx={{ letterSpacing: 1.5 }}>
          {t('shareSurreal.heading') || 'Compartilhamento de Surreais'}
        </Typography>
        <Typography variant="h3" fontWeight={800} sx={{ mt: 2, mb: 2 }}>
          Você recebeu {shareData.amount} $S
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, whiteSpace: 'pre-wrap' }}>
          {shareData.recipientName
            ? `Parabéns para ${shareData.recipientName}! Este valor foi recebido e agora está disponível para continuar ajudando a comunidade.`
            : 'Este é um recibo público de Surreais recebidos.'}
        </Typography>

        {shareData.senderName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Recebido de {shareData.senderName}
          </Typography>
        )}

        {shareData.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {shareData.description}
          </Typography>
        )}

        <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
          Descubra demandas e trabalhos para ganhar seus próprios Surreais. Conecte-se à comunidade e transforme suas contribuições em reconhecimento.
        </Typography>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => navigate('/login')}
        >
          {t('shareSurreal.cta') || 'Explorar demandas'}
        </Button>

        <Button
          variant="text"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          {t('shareSurreal.backHome') || 'Voltar para o início'}
        </Button>
      </Paper>
    </Container>
  );
};

export default ShareSurrealLanding;
