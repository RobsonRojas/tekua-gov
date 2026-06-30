import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Chip
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
import FileUploader from '../components/common/FileUploader';
import type { Attachment } from '../components/common/FileUploader';
import { Divider } from '@mui/material';

const CreateDemand: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [executorIds, setExecutorIds] = useState<string[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const canAssignTask = profile?.role === 'admin' || profile?.roles?.includes('admin') || profile?.role === 'transversal_council' || profile?.roles?.includes('transversal_council');

  useEffect(() => {
    fetchProjects();
    if (canAssignTask) {
      fetchMembers();
    }
  }, [canAssignTask]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await apiClient.invoke('api-work', 'fetchProjects');
      if (error) throw new Error(error);
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await apiClient.invoke('api-work', 'createActivity', {
        title,
        description,
        rewardAmount: Number(amount),
        type: 'task',
        attachments,
        executorIds: executorIds.length > 0 ? executorIds : [],
        projectId: projectId || null
      });

      if (error) throw new Error(error);

      logActivity(user.id, 'task', {
        pt: `Demanda criada: ${title}`,
        en: `Demand created: ${title}`
      });

      setMessage({ type: 'success', text: t('work.pendingApprovalMessage') || 'Sua demanda foi enviada e aguarda aprovação do Conselho Transversal.' });
      setTimeout(() => navigate('/work-wall'), 2000);
    } catch (err: any) {
      console.error('Error creating demand:', err);
      setMessage({ type: 'error', text: err.message || t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setCreatingProject(true);
    try {
      const { data, error } = await apiClient.invoke('api-work', 'createProject', {
        name: newProjectName,
        description: newProjectDescription
      });
      if (error) throw new Error(error);
      
      await fetchProjects();
      setProjectId(data.id);
      setIsNewProjectDialogOpen(false);
      setNewProjectName('');
      setNewProjectDescription('');
      setMessage({ type: 'success', text: t('work.projectCreated') || 'Projeto criado com sucesso!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao criar projeto.' });
    } finally {
      setCreatingProject(false);
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
                label={t('work.demandDescription')}
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

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  select
                  label={t('work.project') || 'Projeto (Opcional)'}
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>{t('common.none') || 'Nenhum'}</em>
                  </MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Button 
                  variant="outlined" 
                  onClick={() => setIsNewProjectDialogOpen(true)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {t('work.newProject') || 'Novo Projeto'}
                </Button>
              </Box>
            </Grid>

            {canAssignTask && (
              <Grid size={{ xs: 12, md: 6 }}>
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
                      label={t('work.executor') || 'Atribuir a Membros (Opcional)'}
                      placeholder={t('work.executorHelper') || 'Buscar membros...'}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip label={option.full_name || option.email} {...getTagProps({ index })} size="small" color="primary" />
                    ))
                  }
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                {t('work.demandAttachments') || 'Documentos de Referência'}
              </Typography>
              <FileUploader 
                onUploadComplete={setAttachments} 
                maxFiles={5}
                bucket="task-evidence"
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
      <Dialog open={isNewProjectDialogOpen} onClose={() => setIsNewProjectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('work.createProject') || 'Criar Novo Projeto'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('common.name') || 'Nome do Projeto'}
            fullWidth
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label={t('common.description') || 'Descrição'}
            fullWidth
            multiline
            rows={3}
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewProjectDialogOpen(false)}>{t('common.cancel') || 'Cancelar'}</Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained" 
            disabled={creatingProject || !newProjectName.trim()}
          >
            {creatingProject ? <CircularProgress size={24} /> : (t('common.create') || 'Criar')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateDemand;
