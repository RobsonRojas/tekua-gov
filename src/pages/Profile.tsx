import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Avatar, 
  Button, 
  TextField, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { 
  Shield, 
  Edit2, 
  Calendar,
  CheckCircle2,
  User,
  Settings,
  Wallet,
  ChevronDown,
  Camera,
  Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { apiClient } from '../lib/api';
import SecurityTab from './components/SecurityTab';
import ActivityTab from './components/ActivityTab';
import PrivacyTab from './components/PrivacyTab';
import { logActivity } from '../utils/activityLogger';
import { InstallPrompt } from '../components/pwa/InstallPrompt';
import { uploadFile, getFileUrl } from '../utils/storage';
import UserRewards from './components/UserRewards';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 0 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { profile, user: authUser, loading: authLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [fullName, setFullName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [balance, setBalance] = useState<number | null>(null);
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Photo states
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const isAdminView = !!id && id !== authUser?.id;
  const currentProfile = isAdminView ? targetProfile : profile;
  const isLoading = authLoading || (isAdminView && loadingTarget);

  const tabOptions = [
    { 
      label: t('profile.security_tab.infoTab'), 
      icon: <User size={18} />, 
      value: 0,
      visible: true
    },
    { 
      label: t('profile.security_tab.tabTitle'), 
      icon: <Settings size={18} />, 
      value: 1,
      visible: !isAdminView || profile?.roles?.includes('admin')
    },
    { 
      label: t('profile.activity'), 
      icon: <Calendar size={18} />, 
      value: 2,
      visible: true
    },
    { 
      label: t('lgpd.privacyTab', 'Privacidade'), 
      icon: <Shield size={18} />, 
      value: 3,
      visible: !isAdminView
    }
  ].filter(opt => opt.visible);

  useEffect(() => {
    if (isAdminView) {
      fetchTargetProfile();
      setPhotoPreview(null);
    } else if (profile) {
      setFullName(profile.full_name || '');
      setPhotoPreview(profile.avatar_url || null);
      fetchBalance();
    }
  }, [id, profile, authUser]);

  const fetchTargetProfile = async () => {
    if (!id) return;
    setLoadingTarget(true);
    try {
      const { data, error } = await apiClient.invoke('api-members', 'fetchUser', { userId: id });
      if (error) throw new Error(error);
      setTargetProfile(data);
      setFullName(data?.full_name || '');
      setPhotoPreview(data?.avatar_url || null);
      
      // Fetch balance for target user if requester is admin
      if (profile?.roles?.includes('admin')) {
        const { data: balanceData } = await apiClient.invoke('api-wallet', 'getBalance', { targetUserId: id });
        if (balanceData) setBalance(balanceData.balance);
      }
    } catch (err: any) {
      console.error('Error fetching target profile:', err);
      setMessage({ type: 'error', text: err.message });
      // If unauthorized, redirect to own profile
      if (err.message === 'Forbidden') {
        navigate('/profile');
      }
    } finally {
      setLoadingTarget(false);
    }
  };

  const fetchBalance = async () => {
    if (!authUser) return;
    const { data, error } = await apiClient.invoke('api-wallet', 'getBalance');
    if (!error && data) setBalance(data.balance);
  };

  const handleUpdateProfile = async () => {
    if (!authUser) return;
    
    setUpdating(true);
    setMessage(null);
    
    try {
      const { error } = await apiClient.invoke('api-members', 'updateProfile', {
        updates: { full_name: fullName }
      });

      if (error) throw new Error(error);
      
      logActivity(authUser.id, 'profile_update', {
        pt: 'Perfil atualizado',
        en: 'Profile updated'
      });

      setMessage({ type: 'success', text: t('profile.updateSuccess') });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Update profile error:', err);
      setMessage({ type: 'error', text: err.message || t('profile.updateError') });
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5242880) {
        setMessage({ type: 'error', text: 'O tamanho da foto não deve exceder 5MB.' });
        return;
      }

      setUploadingPhoto(true);
      setMessage(null);
      
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const path = `avatars/${fileName}`;

        // Upload and compress image using utility
        await uploadFile(file, {
          bucket: 'member-photos',
          path
        });

        // Get public URL
        const newAvatarUrl = await getFileUrl('member-photos', path, true);

        // Update user profile via api-members Edge Function
        const { error } = await apiClient.invoke('api-members', 'updateProfile', {
          updates: { avatar_url: newAvatarUrl }
        });

        if (error) throw new Error(error);

        // Log user activity
        if (authUser) {
          logActivity(authUser.id, 'profile_update', {
            pt: 'Foto de perfil atualizada',
            en: 'Profile photo updated'
          });
        }

        setMessage({ type: 'success', text: 'Foto de perfil atualizada com sucesso!' });
      } catch (err: any) {
        console.error('Error uploading photo:', err);
        setMessage({ type: 'error', text: err.message || 'Erro ao fazer upload da foto.' });
        setPhotoPreview(profile?.avatar_url || null); // revert preview on error
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Tem certeza que deseja remover sua foto de perfil?')) {
      return;
    }

    setUploadingPhoto(true);
    setMessage(null);

    try {
      // Update user profile setting avatar_url to null via api-members
      const { error } = await apiClient.invoke('api-members', 'updateProfile', {
        updates: { avatar_url: null }
      });

      if (error) throw new Error(error);

      // Log user activity
      if (authUser) {
        logActivity(authUser.id, 'profile_update', {
          pt: 'Foto de perfil removida',
          en: 'Profile photo removed'
        });
      }

      setPhotoPreview(null);
      setMessage({ type: 'success', text: 'Foto de perfil removida com sucesso!' });
    } catch (err: any) {
      console.error('Error removing photo:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao remover a foto de perfil.' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setMessage(null); // Clear messages when switching tabs
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleMenuSelect = (value: number) => {
    setTabValue(value);
    setMessage(null);
    handleMenuClose();
  };

  if (isLoading && !currentProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Typography variant="h2" color="primary.main" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          {t('profile.title')}
        </Typography>
        {tabValue === 0 && !isAdminView && (
          <Button 
            variant="contained" 
            fullWidth={isMobile}
            disabled={updating}
            startIcon={updating ? <CircularProgress size={18} color="inherit" /> : (isEditing ? <CheckCircle2 size={18} /> : <Edit2 size={18} />)}
            onClick={isEditing ? handleUpdateProfile : () => setIsEditing(true)}
            sx={{ borderRadius: '12px', py: { xs: 1, sm: 1.5 } }}
          >
            {updating ? t('profile.saving') : (isEditing ? t('profile.save') : t('profile.edit'))}
          </Button>
        )}
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 4, borderRadius: '12px' }}>
          {message.text}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {isMobile ? (
          <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              onClick={handleMenuOpen}
              variant="outlined"
              startIcon={tabOptions.find(opt => opt.value === tabValue)?.icon || <User size={18} />}
              endIcon={<ChevronDown size={14} />}
              sx={{ 
                borderRadius: '12px', 
                textTransform: 'none', 
                fontWeight: 600,
                minWidth: { xs: '100%', sm: 250 },
                justifyContent: 'space-between',
                px: 2,
                py: 1,
                bgcolor: 'background.paper',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {tabOptions.find(opt => opt.value === tabValue)?.label || t('profile.security_tab.infoTab')}
            </Button>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'center', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
              PaperProps={{
                sx: { 
                  borderRadius: '12px', 
                  minWidth: { xs: 'calc(100% - 32px)', sm: 250 }, 
                  mt: 1,
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              {tabOptions.map((opt) => (
                <MenuItem 
                  key={opt.value} 
                  onClick={() => handleMenuSelect(opt.value)}
                  selected={tabValue === opt.value}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon sx={{ color: tabValue === opt.value ? 'primary.main' : 'inherit' }}>
                    {opt.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={opt.label} 
                    primaryTypographyProps={{ 
                      fontWeight: tabValue === opt.value ? 700 : 500,
                      color: tabValue === opt.value ? 'primary.main' : 'inherit'
                    }} 
                  />
                </MenuItem>
              ))}
            </Menu>
          </Box>
        ) : (
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="profile tabs"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                gap: 1,
                px: 3
              }
            }}
          >
            {tabOptions.map((opt) => (
              <Tab 
                key={opt.value}
                icon={opt.icon} 
                iconPosition="start" 
                label={opt.label} 
              />
            ))}
          </Tabs>
        )}
      </Box>

      <TabPanel value={tabValue} index={0}>
        <InstallPrompt variant="banner" />
        <Grid container spacing={{ xs: 2, sm: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 4 },
                textAlign: 'center',
                backgroundColor: 'background.paper',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <Box sx={{ position: 'relative', width: { xs: 90, sm: 120 }, height: { xs: 90, sm: 120 }, mx: 'auto', mb: 3 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box 
                      sx={{ 
                        bgcolor: currentProfile?.roles?.includes('admin') ? 'primary.main' : 'secondary.main', 
                        p: 0.5, 
                        borderRadius: '50%',
                        border: '4px solid #1e293b'
                      }}
                    >
                      <Shield size={14} color="white" />
                    </Box>
                  }
                  sx={{ width: '100%', height: '100%' }}
                >
                  <Avatar 
                    src={photoPreview || undefined}
                    sx={{ 
                      width: '100%', 
                      height: '100%', 
                      bgcolor: 'primary.main',
                      fontSize: { xs: '2rem', sm: '3rem' },
                      fontWeight: 700,
                      boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {currentProfile?.full_name?.charAt(0) || currentProfile?.email?.charAt(0) || '?'}
                  </Avatar>
                </Badge>
                {!isAdminView && (
                  <IconButton
                    component="label"
                    disabled={uploadingPhoto}
                    sx={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      bgcolor: 'primary.main',
                      color: 'white',
                      p: 0.75,
                      border: '2px solid',
                      borderColor: 'background.paper',
                      zIndex: 10,
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      }
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                    />
                    {uploadingPhoto ? <CircularProgress size={14} color="inherit" /> : <Camera size={14} />}
                  </IconButton>
                )}
              </Box>

              {!isAdminView && photoPreview && (
                <Box sx={{ mt: -2, mb: 2 }}>
                  <Button
                    size="small"
                    color="error"
                    variant="text"
                    startIcon={<Trash2 size={12} />}
                    onClick={handleRemovePhoto}
                    disabled={uploadingPhoto}
                    sx={{ textTransform: 'none', py: 0 }}
                  >
                    Remover Foto
                  </Button>
                </Box>
              )}

              <Typography 
                variant="h3" 
                gutterBottom 
                sx={{ 
                  fontSize: { xs: '1.25rem', sm: '1.75rem' },
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: 1.2,
                  mb: 1
                }}
              >
                {currentProfile?.full_name || t('profile.defaultName')}
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                gutterBottom 
                sx={{ 
                  textTransform: 'capitalize',
                  fontSize: '0.875rem',
                  whiteSpace: 'normal',
                  textAlign: 'center'
                }}
              >
                {currentProfile?.roles?.map((r: string) => r === 'admin' ? 'Admin' : r === 'transversal_council' ? 'Conselho' : 'Membro').join(' / ')}
                {currentProfile?.functions && currentProfile.functions.length > 0 && ` | ${currentProfile.functions.join(', ')}`}
              </Typography>
              
              <Box 
                sx={{ 
                  mt: 3, 
                  px: 2, 
                  py: 1, 
                  bgcolor: 'rgba(16, 185, 129, 0.1)', 
                  color: 'secondary.main',
                  borderRadius: '100px',
                  display: 'inline-block',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                {t('profile.statusActive')}
              </Box>

              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                  textAlign: 'left'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Wallet size={20} color="#6366f1" />
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('wallet.balance')}
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {balance !== null ? `${balance} $S` : '...'}
                </Typography>
                <Button 
                  size="small" 
                  fullWidth 
                  variant="text" 
                  onClick={() => navigate('/wallet')}
                  sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
                >
                  {t('home.access')}
                </Button>
              </Paper>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 4 },
                backgroundColor: 'background.paper',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
                {t('profile.personalInfo')}
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('profile.fullName')}
                  </Typography>
                  {isEditing ? (
                    <TextField 
                      fullWidth 
                      variant="outlined" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  ) : (
                    <Typography variant="body1" fontWeight={500}>
                      {currentProfile?.full_name || t('profile.notInformed')}
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('profile.corporateEmail')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {currentProfile?.email}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('profile.role')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {currentProfile?.roles?.map((role: string) => (
                      <Chip 
                        key={role}
                        label={role === 'admin' ? 'Admin' : role === 'transversal_council' ? 'Conselho Transversal' : 'Membro'} 
                        size="small"
                        color={role === 'admin' ? 'primary' : 'default'}
                      />
                    ))}
                  </Box>
                </Grid>

                {currentProfile?.functions && currentProfile.functions.length > 0 && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('profile.functions') || 'Funções'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {currentProfile.functions.map((func: string) => (
                        <Chip 
                          key={func}
                          label={func} 
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('profile.memberSince')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {currentProfile?.created_at
                      ? new Date(currentProfile?.created_at).toLocaleDateString() 
                      : t('profile.na')}
                  </Typography>
                </Grid>
              </Grid>
              
              {currentProfile?.id && (
                <UserRewards userId={currentProfile.id} />
              )}

              <Box sx={{ mt: 6 }}>
                <Typography variant="h3" gutterBottom sx={{ mb: 3 }}>
                  {t('profile.accountSettings')}
                </Typography>
                <List sx={{ p: 0 }}>
                  {(!isAdminView || profile?.roles?.includes('admin')) && (
                    <ListItem 
                      sx={{ 
                        px: 0, 
                        cursor: 'pointer',
                        '&:hover .MuiListItemText-primary': { color: 'primary.main' }
                      }}
                      onClick={() => setTabValue(1)}
                    >
                      <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
                        <Shield size={20} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={t('profile.security')} 
                        secondary={t('profile.securityDesc')} 
                      />
                    </ListItem>
                  )}
                  <ListItem 
                    sx={{ 
                      px: 0, 
                      cursor: 'pointer',
                      '&:hover .MuiListItemText-primary': { color: 'primary.main' }
                    }}
                    onClick={() => setTabValue(2)}
                  >
                    <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
                      <Calendar size={20} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('profile.activity')} 
                      secondary={t('profile.activityDesc')} 
                    />
                  </ListItem>
                </List>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            backgroundColor: 'background.paper',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {(!isAdminView || profile?.roles?.includes('admin')) && (
            <SecurityTab targetUserId={isAdminView ? id : undefined} />
          )}
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            backgroundColor: 'background.paper',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <ActivityTab targetUserId={id} />
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            backgroundColor: 'background.paper',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <PrivacyTab />
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default Profile;
