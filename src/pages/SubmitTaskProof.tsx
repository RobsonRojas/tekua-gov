import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Alert, 
  Snackbar,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Card,
  CardMedia
} from '@mui/material';
import { 
  ChevronRight,
  Home as HomeIcon,
  Camera,
  MapPin,
  Send,
  Upload
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

const SubmitTaskProof: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [capturingGeo, setCapturingGeo] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      
      // Auto capture location when photo is selected if possible
      handleCaptureLocation();
    }
  };

  const handleCaptureLocation = () => {
    setCapturingGeo(true);
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported' });
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
        setMessage({ type: 'error', text: 'Unable to retrieve location' });
        setCapturingGeo(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !id) return;

    setUploading(true);
    try {
      // 1. Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `evidence/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task-evidence')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('task-evidence')
        .getPublicUrl(filePath);

      // 2. Insert evidence record
      const { error: evidenceError } = await supabase
        .from('activity_evidence')
        .insert({
          activity_id: id,
          worker_id: user.id,
          evidence_url: publicUrl,
          location: location ? `POINT(${location.lng} ${location.lat})` : null
        });

      if (evidenceError) throw evidenceError;

      // 3. Update activity status
      const { error: activityError } = await supabase
        .from('activities')
        .update({ status: 'pending_validation' })
        .eq('id', id);

      if (activityError) throw activityError;

      setMessage({ type: 'success', text: t('work.success') });
      setTimeout(() => navigate('/tasks-board'), 2000);
    } catch (err: any) {
      console.error('Error submitting proof:', err);
      setMessage({ type: 'error', text: err.message || t('common.error') });
    } finally {
      setUploading(false);
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
        <Typography color="primary.main" fontWeight={600}>{t('work.submit')}</Typography>
      </Breadcrumbs>

      <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Camera size={40} style={{ marginRight: '16px', color: '#6366f1' }} />
          <Typography variant="h4" fontWeight={700}>
            {t('work.submit')}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box 
                sx={{ 
                  border: '2px dashed rgba(255, 255, 255, 0.1)', 
                  borderRadius: '16px', 
                  p: 4, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' }
                }}
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <input
                  type="file"
                  id="photo-upload"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {preview ? (
                  <Card sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      image={preview}
                      alt="Proof preview"
                      sx={{ maxHeight: 300, objectFit: 'contain' }}
                    />
                  </Card>
                ) : (
                  <Box>
                    <Upload size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
                    <Typography variant="h6">Clique para tirar ou selecionar foto</Typography>
                    <Typography variant="body2" color="text.secondary">A evidência visual é obrigatória</Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <MapPin size={24} color={location ? '#10b981' : '#ef4444'} />
                    <Typography variant="h6">Localização (GPS)</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {location 
                      ? `Coordenadas capturadas: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` 
                      : 'Aguardando captura de GPS...'}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={handleCaptureLocation}
                    disabled={capturingGeo}
                    startIcon={capturingGeo ? <CircularProgress size={16} /> : <MapPin size={16} />}
                  >
                    {location ? 'Recapturar Localização' : 'Capturar Localização'}
                  </Button>
                </Paper>

                <Alert severity="info" sx={{ borderRadius: '12px' }}>
                  Sua prova será enviada para o requisitante e para a comunidade validar. O pagamento em Surreais será automático após a aprovação.
                </Alert>

                <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    type="submit"
                    disabled={uploading || !file}
                    startIcon={uploading ? <CircularProgress size={20} /> : <Send size={18} />}
                    sx={{ borderRadius: '12px', py: 1.5 }}
                  >
                    {uploading ? 'Enviando...' : 'Enviar Prova'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate(-1)}
                    sx={{ borderRadius: '12px' }}
                  >
                    {t('common.cancel')}
                  </Button>
                </Box>
              </Box>
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

export default SubmitTaskProof;
