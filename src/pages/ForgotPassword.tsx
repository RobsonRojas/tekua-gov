import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import LanguageSelector from '../components/LanguageSelector';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      console.error('Reset request error:', err);
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
              {t('forgotPassword.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('forgotPassword.subtitle')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
              {t('forgotPassword.success')}
            </Alert>
          )}

          {!success ? (
            <form onSubmit={handleResetRequest}>
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label={t('forgotPassword.email')}
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

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
                sx={{ 
                  height: 56, 
                  borderRadius: '16px',
                  mb: 3
                }}
              >
                {loading ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
              </Button>
            </form>
          ) : null}

          <Box sx={{ textAlign: 'center' }}>
            <Link 
              component={RouterLink} 
              to="/login" 
              variant="body2" 
              color="primary"
              sx={{ 
                textDecoration: 'none', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <ArrowLeft size={16} />
              {t('forgotPassword.backToLogin')}
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
