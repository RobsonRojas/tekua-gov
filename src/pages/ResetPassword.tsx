import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check if we have a session (the link from email should have set it)
  useEffect(() => {
    if (!authLoading && !session) {
      setError(t('auth.invalid_session'));
    }
  }, [authLoading, session, t]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (password !== confirmPassword) {
      setError(t('forgotPassword.errorMismatch'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('forgotPassword.errorTooShort'));
      setLoading(false);
      return;
    }

    try {
      // Retry mechanism for NavigatorLockAcquireTimeoutError
      let retries = 3;
      let updateError = null;
      
      while (retries > 0) {
        try {
          const { error } = await supabase.auth.updateUser({
            password: password,
          });
          updateError = error;
          break; // success or normal error (not lock timeout)
        } catch (err: any) {
          if (err.name === 'NavigatorLockAcquireTimeoutError' || err.message?.includes('Lock')) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, 500)); // wait 500ms before retry
            continue;
          }
          throw err;
        }
      }
      
      if (updateError) throw updateError;
      setSuccess(true);
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Update password error:', err);
      setError(err.message || t('auth.unknown_error'));
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
            <Typography variant="h4" color="primary.main" gutterBottom sx={{ fontWeight: 800 }}>
              {t('forgotPassword.resetTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('forgotPassword.resetSubtitle')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              icon={<CheckCircle size={20} />} 
              sx={{ mb: 3, borderRadius: '12px' }}
            >
              {t('forgotPassword.resetSuccess')}
            </Alert>
          )}

          {authLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : !success ? (
            <form onSubmit={handleUpdatePassword}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label={t('forgotPassword.newPassword')}
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading || authLoading}
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

              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label={t('forgotPassword.confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading || authLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={20} color="#94a3b8" />
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
                disabled={loading || authLoading || !!error}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle size={20} />}
                sx={{ 
                  height: 56, 
                  borderRadius: '16px',
                  mb: 3
                }}
              >
                {loading ? t('forgotPassword.resetSubmitting') : t('forgotPassword.resetSubmit')}
              </Button>
            </form>
          ) : (
             <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ 
                  height: 56, 
                  borderRadius: '16px',
                  mb: 3
                }}
              >
                {t('forgotPassword.backToLogin')}
              </Button>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;
