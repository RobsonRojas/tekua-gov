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
  Tab
} from '@mui/material';
import { 
  Shield, 
  Edit2, 
  Calendar,
  CheckCircle2,
  User,
  Settings
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import SecurityTab from './components/SecurityTab';

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
        <Box sx={{ py: 4 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { profile, user: authUser, loading: authLoading } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!authUser) return;
    
    setUpdating(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', authUser.id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: t('profile.updateSuccess') });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Update profile error:', err);
      setMessage({ type: 'error', text: err.message || t('profile.updateError') });
    } finally {
      setUpdating(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setMessage(null); // Clear messages when switching tabs
  };

  if (authLoading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h2" color="primary.main">
          {t('profile.title')}
        </Typography>
        {tabValue === 0 && (
          <Button 
            variant="contained" 
            disabled={updating}
            startIcon={updating ? <CircularProgress size={18} color="inherit" /> : (isEditing ? <CheckCircle2 size={18} /> : <Edit2 size={18} />)}
            onClick={isEditing ? handleUpdateProfile : () => setIsEditing(true)}
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
              gap: 1
            }
          }}
        >
          <Tab 
            icon={<User size={18} />} 
            iconPosition="start" 
            label={t('profile.security_tab.infoTab')} 
          />
          <Tab 
            icon={<Settings size={18} />} 
            iconPosition="start" 
            label={t('profile.security_tab.tabTitle')} 
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: 'background.paper',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box 
                    sx={{ 
                      bgcolor: profile?.role === 'admin' ? 'primary.main' : 'secondary.main', 
                      p: 0.5, 
                      borderRadius: '50%',
                      border: '4px solid #1e293b'
                    }}
                  >
                    <Shield size={14} color="white" />
                  </Box>
                }
              >
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 3, 
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    fontWeight: 700,
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {profile?.full_name?.charAt(0) || authUser?.email?.charAt(0) || '?'}
                </Avatar>
              </Badge>

              <Typography variant="h3" gutterBottom>
                {profile?.full_name || t('profile.defaultName')}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom sx={{ textTransform: 'capitalize' }}>
                {profile?.role === 'admin' ? 'Admin' : t('profile.member')}
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
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
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
                      {profile?.full_name || t('profile.notInformed')}
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('profile.corporateEmail')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {authUser?.email}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('profile.role')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                    {profile?.role === 'admin' ? 'Admin' : t('profile.member')}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('profile.memberSince')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(profile?.created_at || authUser?.created_at) 
                      ? new Date(profile?.created_at || authUser?.created_at as string).toLocaleDateString() 
                      : t('profile.na')}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 6 }}>
                <Typography variant="h3" gutterBottom sx={{ mb: 3 }}>
                  {t('profile.accountSettings')}
                </Typography>
                <List sx={{ p: 0 }}>
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
                  <ListItem 
                    sx={{ 
                      px: 0, 
                      cursor: 'pointer',
                      '&:hover .MuiListItemText-primary': { color: 'primary.main' }
                    }}
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
            p: 4,
            backgroundColor: 'background.paper',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <SecurityTab />
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default Profile;
