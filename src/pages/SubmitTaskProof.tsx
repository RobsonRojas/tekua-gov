import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { 
  ChevronRight,
  Home as HomeIcon,
  Camera,
  MapPin,
  Send,
  ShieldCheck
} from 'lucide-react';
import FileUploader from '../components/common/FileUploader';
import type { Attachment } from '../components/common/FileUploader';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';

const SubmitTaskProof: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [uploading, setUploading] = useState(false);
  const [capturingGeo, setCapturingGeo] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activityStatus, setActivityStatus] = useState<string | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // The status of the activity decides what the primary action does:
  //  - `in_progress` -> the task is completed (evidence optional);
  //  - anything else -> the evidence is only attached (the status is untouched).
  useEffect(() => {
    let active = true;

    const loadActivity = async () => {
      if (!id) {
        setLoadingActivity(false);
        return;
      }

      try {
        const { data, error } = await apiClient.invoke('api-work', 'fetchActivityDetail', { id });
        if (error) throw new Error(error);
        if (active) setActivityStatus(data?.status ?? null);
      } catch (err) {
        console.error('Error loading activity:', err);
      } finally {
        if (active) setLoadingActivity(false);
      }
    };

    loadActivity();

    return () => {
      active = false;
    };
  }, [id]);

  const isAlreadyCompleted = activityStatus !== null && activityStatus !== 'in_progress';

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
    if (!user || !id) return;

    setUploading(true);
    try {
      // The evidence is optional: the task is completed even when nothing is attached.
      const action = isAlreadyCompleted ? 'addEvidence' : 'completeTask';

      const { error: apiError } = await apiClient.invoke('api-work', action, {
        activityId: id,
        location: location ? `POINT(${location.lng} ${location.lat})` : null,
        attachments
      });

      if (apiError) throw new Error(apiError);

      setMessage({
        type: 'success',
        text: isAlreadyCompleted
          ? t('work.evidenceAttachedSuccess')
          : t('work.completeTaskSuccess')
      });
      setTimeout(() => navigate(`/tasks/${id}`), 2000);
    } catch (err: any) {
      console.error('Error completing task:', err);
      setMessage({ type: 'error', text: err.message || t('common.error') });
    } finally {
      setUploading(false);
    }
  };

  const primaryLabel = isAlreadyCompleted
    ? t('work.attachEvidence')
    : t('work.completeTask');

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
        <Typography color="primary.main" fontWeight={600}>{t('work.completeTask')}</Typography>
      </Breadcrumbs>

      <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Camera size={40} style={{ marginRight: '16px', color: '#6366f1' }} />
          <Typography variant="h4" fontWeight={700}>
            {t('work.completeTask')}
          </Typography>
        </Box>

        <Alert severity="info" icon={<ShieldCheck size={20} />} sx={{ borderRadius: '12px', mb: 3 }}>
          {t('work.trustNotice')}
        </Alert>

        {isAlreadyCompleted && (
          <Alert severity="warning" sx={{ borderRadius: '12px', mb: 3 }}>
            {t('work.alreadyCompletedNotice')}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>{t('work.evidenceOptional')}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('work.evidenceOptionalHint')}
              </Typography>
              <FileUploader 
                onUploadComplete={setAttachments} 
                maxFiles={5}
                bucket="task-evidence"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <MapPin size={24} color={location ? '#10b981' : '#ef4444'} />
                    <Typography variant="h6">{t('work.gpsLocation')}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {location 
                      ? t('work.gpsCaptured', { lat: location.lat.toFixed(6), lng: location.lng.toFixed(6) })
                      : t('work.gpsWaiting')}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={handleCaptureLocation}
                    disabled={capturingGeo}
                    startIcon={capturingGeo ? <CircularProgress size={16} /> : <MapPin size={16} />}
                  >
                    {location ? t('work.recaptureLocation') : t('work.captureLocation')}
                  </Button>
                </Paper>

                <Alert severity="success" sx={{ borderRadius: '12px' }}>
                  {t('work.validationNotice')}
                </Alert>

                <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    type="submit"
                    disabled={uploading || loadingActivity}
                    startIcon={uploading ? <CircularProgress size={20} /> : <Send size={18} />}
                    sx={{ borderRadius: '12px', py: 1.5 }}
                  >
                    {uploading ? t('work.sending') : primaryLabel}
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
