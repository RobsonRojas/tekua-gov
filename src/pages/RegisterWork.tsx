import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  MenuItem, 
  Alert, 
  Snackbar,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { 
  Work as WorkIcon, 
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  NavigateNext as NavigateNextIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import CameraCapture from '../components/CameraCapture';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { logActivity } from '../utils/activityLogger';

const RegisterWork: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [beneficiaryType, setBeneficiaryType] = useState<'tekua' | 'member'>('tekua');
  const [beneficiaryId, setBeneficiaryId] = useState<string>('');
  const [members, setMembers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (beneficiaryType === 'member') {
      fetchMembers();
    }
  }, [beneficiaryType]);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const { data, error } = await apiClient.invoke('api-members', 'fetchUsers');
      
      if (error) throw new Error(error);
      // Filter out self if necessary, though api-members usually returns all
      setMembers(data?.filter((m: any) => m.id !== user?.id) || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const processAndUploadFile = async (file: File) => {
    setUploadingFile(true);
    try {
      const { uploadFile, getFileUrl } = await import('../utils/storage');
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const path = await uploadFile(file, {
        bucket: 'task-evidence',
        path: fileName
      });
      const url = await getFileUrl('task-evidence', path, true);
      setEvidenceUrl(url);
      setMessage({ type: 'success', text: 'Imagem carregada e otimizada com sucesso!' });
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setMessage({ type: 'error', text: 'Erro ao carregar imagem.' });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAndUploadFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const submissionData = {
        p_title: { pt: 'Contribuição Individual', en: 'Individual Contribution' },
        p_description: { pt: description, en: description },
        p_reward_amount: Number(amount),
        p_evidence_url: evidenceUrl,
        p_requester_id: beneficiaryType === 'member' ? beneficiaryId : null
      };

      if (!navigator.onLine) {
        const { enqueueAction } = await import('../lib/db');
        await enqueueAction('submit_task', submissionData);
        
        setMessage({ type: 'success', text: t('offline.saved') || 'Dados salvos localmente. Serão enviados quando houver conexão.' });
        setTimeout(() => navigate('/work-wall'), 2000);
        return;
      }

      const { error } = await apiClient.invoke('api-work', 'submitActivity', {
        title: submissionData.p_title,
        description: submissionData.p_description.pt,
        rewardAmount: submissionData.p_reward_amount,
        evidenceUrl: submissionData.p_evidence_url,
        requesterId: submissionData.p_requester_id
      });

      if (error) throw new Error(error);

      logActivity(user.id, 'task', {
        pt: `Trabalho registrado: ${description.substring(0, 30)}...`,
        en: `Work registered: ${description.substring(0, 30)}...`
      });

      setMessage({ type: 'success', text: t('work.success') });
      setTimeout(() => navigate('/work-wall'), 2000);
    } catch (err: any) {
      console.error('Error submitting work:', err);
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
        <Typography color="text.primary">{t('work.register')}</Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <WorkIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" component="h1">
            {t('work.register')}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('work.description')}
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Ex: Reforço na horta da Vila, tradução do manual, etc."
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  label={t('work.evidence')}
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  required
                  placeholder="https://link_ou_upload"
                  helperText="Link para fotos ou clique no botão ao lado para carregar"
                />
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={uploadingFile}
                    sx={{ height: 56, minWidth: 90 }}
                  >
                    {uploadingFile ? <CircularProgress size={24} /> : 'Upload'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setIsCameraOpen(true)}
                    disabled={uploadingFile}
                    sx={{ height: 56, minWidth: 90 }}
                    color="secondary"
                  >
                    <PhotoCameraIcon />
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t('work.suggested')}
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label={t('work.beneficiary')}
                value={beneficiaryType}
                onChange={(e) => setBeneficiaryType(e.target.value as any)}
              >
                <MenuItem value="tekua">{t('work.tekua')}</MenuItem>
                <MenuItem value="member">{t('work.otherMember')}</MenuItem>
              </TextField>
            </Grid>

            {beneficiaryType === 'member' && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label={t('work.otherMember')}
                  value={beneficiaryId}
                  onChange={(e) => setBeneficiaryId(e.target.value)}
                  required
                  disabled={loadingMembers}
                >
                  {members.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.full_name || member.email}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{ px: 4, borderRadius: 2 }}
              >
                {t('work.submit')}
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

      <CameraCapture
        open={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={processAndUploadFile}
      />

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

export default RegisterWork;
