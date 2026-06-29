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
  Link as MuiLink,
  Autocomplete,
  Chip
} from '@mui/material';
import { 
  Work as WorkIcon, 
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  NavigateNext as NavigateNextIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import CameraCapture from '../components/CameraCapture';
import FileUploader from '../components/common/FileUploader';
import type { Attachment } from '../components/common/FileUploader';
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
  const [executorIds, setExecutorIds] = useState<string[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const { data, error } = await apiClient.invoke('api-members', 'fetchUsers');
      
      if (error) throw new Error(error);
      setMembers(data || []);
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
        p_requester_id: beneficiaryType === 'member' ? beneficiaryId : null,
        p_executor_ids: executorIds.length > 0 ? executorIds : [user.id],
        attachments
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
        description: submissionData.p_description,
        rewardAmount: submissionData.p_reward_amount,
        evidenceUrl: submissionData.p_evidence_url,
        requesterId: submissionData.p_requester_id,
        executorIds: submissionData.p_executor_ids,
        attachments: submissionData.attachments
      });

      if (error) throw new Error(error);

      logActivity(user.id, 'task', {
        pt: `Trabalho registrado: ${description.substring(0, 30)}...`,
        en: `Work registered: ${description.substring(0, 30)}...`
      });

      setMessage({ type: 'success', text: t('work.pendingApprovalMessage') || 'Seu trabalho foi registrado e aguarda aprovação do Conselho Transversal.' });
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

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                {t('work.evidence') || 'Evidência do Trabalho'}
              </Typography>
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setIsCameraOpen(true)}
                  disabled={uploadingFile}
                  startIcon={<PhotoCameraIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  {t('camera.capture') || 'Capturar Foto'}
                </Button>
              </Box>
              <FileUploader 
                onUploadComplete={setAttachments} 
                maxFiles={5}
                bucket="task-evidence"
              />
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

            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                options={members}
                getOptionLabel={(option) => option.full_name || option.email}
                value={members.filter(m => executorIds.includes(m.id))}
                onChange={(_, newValue) => setExecutorIds(newValue.map(n => n.id))}
                disabled={loadingMembers}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label={t('work.executors', 'Quem executou o trabalho? (Deixe vazio se foi apenas você)')}
                    placeholder="Buscar membros..."
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option.full_name || option.email} {...getTagProps({ index })} size="small" color="primary" />
                  ))
                }
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
