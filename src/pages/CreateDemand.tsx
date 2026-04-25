import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Alert, 
  Snackbar,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { 
  Assignment as TaskIcon, 
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { logActivity } from '../utils/activityLogger';

const CreateDemand: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await apiClient.invoke('api-work', 'createActivity', {
        title,
        description,
        rewardAmount: Number(amount),
        type: 'task'
      });

      if (error) throw new Error(error);

      logActivity(user.id, 'task', {
        pt: `Demanda criada: ${title}`,
        en: `Demand created: ${title}`
      });

      setMessage({ type: 'success', text: t('work.demandCreated') || 'Demanda criada com sucesso!' });
      setTimeout(() => navigate('/work-wall'), 2000);
    } catch (err: any) {
      console.error('Error creating demand:', err);
      setMessage({ type: 'error', text: err.message || t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <MuiLink component={Link} to="/" color="inherit" underline="hover">
          {t('layout.dashboard')}
        </MuiLink>
        <MuiLink component={Link} to="/work-wall" color="inherit" underline="hover">
          {t('work.mural')}
        </MuiLink>
        <Typography color="text.primary">{t('work.createDemand') || 'Criar Demanda'}</Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <TaskIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" component="h1">
            {t('work.createDemand') || 'Criar Demanda'}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('work.title') || 'Título da Demanda'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex: Pintura da sede comunitária"
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('work.description')}
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Descreva o que precisa ser feito em detalhes..."
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t('work.reward') || 'Valor da Recompensa (Surreal)'}
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{ px: 4, borderRadius: 2 }}
              >
                {t('work.publish') || 'Publicar Demanda'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate(-1)}
                startIcon={<ArrowBackIcon />}
                sx={{ borderRadius: 2 }}
              >
                {t('common.cancel')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
      >
        <Alert 
          onClose={() => setMessage(null)} 
          severity={message?.type || 'info'} 
          sx={{ width: '100%' }}
        >
          {message?.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateDemand;
