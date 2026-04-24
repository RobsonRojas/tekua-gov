import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton,
  Link,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import LanguageSelector from '../components/LanguageSelector';
import { logActivity } from '../utils/activityLogger';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const mapSupabaseError = (message: string): string => {
    if (message.toLowerCase().includes('invalid login credentials')) return t('auth.invalid_credentials');
    if (message.toLowerCase().includes('email not confirmed')) return t('auth.email_not_confirmed');
    if (message.toLowerCase().includes('user not found')) return t('auth.user_not_found');
    if (message.toLowerCase().includes('rate limit exceeded')) return t('auth.rate_limit_exceeded');
    return t('auth.unknown_error');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data?.user) {
        // We don't await this so it doesn't block navigation
        logActivity(data.user.id, 'auth', { 
          pt: 'Sessão Iniciada', 
          en: 'Session Started' 
        });
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(mapSupabaseError(err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ position: 'fixed', top: 24, right: 24 }}>
        <LanguageSelector />
      </Box>
      <Box 
        sx={{ 
          pt: 10, 
          pb: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: '100%',
            backgroundColor: 'background.paper',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" color="primary.main" gutterBottom sx={{ fontWeight: 800 }}>
              {t('login.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('login.subtitle')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label={t('login.email')}
                variant="outlined"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color="#94a3b8" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label={t('login.password')}
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color="#94a3b8" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LogIn size={20} />}
              sx={{ 
                height: 56, 
                borderRadius: '16px',
                mb: 3
              }}
            >
              {loading ? t('login.submitting') : t('login.submit')}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link 
                component={RouterLink} 
                to="/forgot-password" 
                variant="body2" 
                color="primary"
                sx={{ textDecoration: 'none', fontWeight: 600 }}
              >
                {t('login.forgotPassword')}
              </Link>
            </Box>
          </form>

          <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Typography variant="body2" color="text.secondary">
              {t('login.restrictedAccess')}
            </Typography>
          </Divider>

          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: '12px', 
              backgroundColor: 'rgba(99, 102, 241, 0.05)', 
              color: 'primary.light',
              '& .MuiAlert-icon': { color: 'primary.light' }
            }}
          >
            {t('login.onlyMembers')}
          </Alert>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
