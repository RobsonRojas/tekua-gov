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
  Link as MuiLink,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  ChevronRight,
  Home as HomeIcon,
  Plus as PlusIcon,
  MapPin,
  Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

const CreateTask: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState<number | string>('');
  const [geoRequired, setGeoRequired] = useState(false);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [capturingGeo, setCapturingGeo] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleCaptureLocation = () => {
    setCapturingGeo(true);
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
      setCapturingGeo(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setCapturingGeo(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setMessage({ type: 'error', text: 'Unable to retrieve your location' });
        setCapturingGeo(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          title: { pt: title, en: title },
          description: { pt: description, en: description },
          type: 'task',
          requester_id: user.id,
          reward_amount: Number(rewardAmount),
          status: 'open',
          validation_method: 'requester_approval',
          geo_required: geoRequired,
          // location is stored in activity_evidence later, but maybe we want a reference here?
          // Framework says activities table doesn't have location, but activity_evidence does.
        });

      if (error) throw error;

      setMessage({ type: 'success', text: t('common.success') });
      setTimeout(() => navigate('/tasks-board'), 500);
    } catch (err: any) {
      console.error('Error creating task:', err);
      setMessage({ type: 'error', text: err.message || t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs 
        separator={<ChevronRight size={16} />} 
        sx={{ mb: 3, '& .MuiBreadcrumbs-ol': { alignItems: 'center' } }}
      >
        <MuiLink component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none', gap: 0.5 }}>
          <HomeIcon size={16} />
          {t('layout.dashboard')}
        </MuiLink>
        <MuiLink component={Link} to="/tasks-board" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
          {t('work.title')}
        </MuiLink>
        <Typography color="primary.main" fontWeight={600}>{t('work.register')}</Typography>
      </Breadcrumbs>

      <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <PlusIcon size={40} style={{ marginRight: '16px', color: '#6366f1' }} />
          <Typography variant="h4" fontWeight={700}>
            {t('work.register')}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('docs.title') || 'Título'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex: Limpeza da trilha principal"
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
                placeholder="Descreva detalhadamente o que precisa ser feito..."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t('work.suggested')}
                type="number"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                required
                InputProps={{ inputProps: { min: 1 } }}
                helperText="Valor em Surreais ($S)"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={geoRequired} 
                    onChange={(e) => setGeoRequired(e.target.checked)} 
                    color="primary"
                  />
                }
                label="Exigir Geoprova (GPS)"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                variant="outlined"
                startIcon={<MapPin size={18} />}
                onClick={handleCaptureLocation}
                disabled={capturingGeo}
              >
                {location ? `Localização Capturada: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Anexar Localização Sugerida'}
              </Button>
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Send size={18} />}
                sx={{ px: 4, borderRadius: '12px' }}
              >
                {t('work.submit')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate(-1)}
                sx={{ borderRadius: '12px' }}
              >
                {t('common.cancel') || 'Cancelar'}
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

export default CreateTask;
