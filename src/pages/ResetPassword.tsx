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
import { Lock, Eye, EyeOff, CheckCircle, ShieldCheck, MailWarning } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import LanguageSelector from '../components/LanguageSelector';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [validating, setValidating] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 1. Initial Validation on Mount
  // Reads ?e= (email) and ?t= (token_hash) from the Supabase Recovery email template:
  // {{ .SiteURL }}reset-password/?e={{ .Email }}&t={{ .TokenHash }}
  useEffect(() => {
    const validateToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('e');
      const tokenHashParam = params.get('t');

      if (!emailParam || !tokenHashParam) {
        setError(t('forgotPassword.invalidRequest', 'A solicitação de troca de senha não existe ou expirou.'));
        setValidating(false);
        return;
      }

      try {
        // token_hash is the correct field for email-link recovery flows (not token, which is for 6-digit OTPs)
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHashParam,
          type: 'recovery',
        });

        if (verifyError) {
          console.error('verifyOtp error:', verifyError);
          setError(t('forgotPassword.invalidRequest', 'A solicitação de troca de senha não existe ou expirou.'));
        } else {
          // verifyOtp with token_hash establishes a Supabase session automatically
          setIsValidSession(true);
        }
      } catch (err) {
        console.error('Exception during verifyOtp:', err);
        setError(t('forgotPassword.invalidRequest', 'A solicitação de troca de senha não existe ou expirou.'));
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [t]);

  // 2. Update password directly using the Supabase session established by verifyOtp
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError(t('forgotPassword.errorMismatch', 'As senhas não coincidem.'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('forgotPassword.errorTooShort', 'A senha deve conter no mínimo 6 caracteres.'));
      setLoading(false);
      return;
    }

    try {
      // verifyOtp already created an authenticated session — use updateUser directly
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      setSuccess(true);

      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Error updating password:', err);
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
              {t('forgotPassword.resetTitle', 'Nova Senha')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('forgotPassword.resetSubtitle', 'Escolha uma nova senha forte para acessar sua conta')}
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              icon={<MailWarning size={20} />}
              sx={{ mb: 3, borderRadius: '12px' }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              icon={<CheckCircle size={20} />} 
              sx={{ mb: 3, borderRadius: '12px' }}
            >
              {t('forgotPassword.resetSuccess', 'Senha alterada com sucesso! Redirecionando...')}
            </Alert>
          )}

          {validating ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
              <CircularProgress color="primary" />
              <Typography variant="body2" color="text.secondary">
                {t('forgotPassword.validating', 'Validando solicitação de recuperação...')}
              </Typography>
            </Box>
          ) : !isValidSession ? (
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ 
                height: 56, 
                borderRadius: '16px',
                mt: 2
              }}
            >
              {t('forgotPassword.backToLogin', 'Voltar para o Login')}
            </Button>
          ) : success ? (
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ 
                height: 56, 
                borderRadius: '16px',
                mt: 2
              }}
            >
              {t('forgotPassword.backToLogin', 'Voltar para o Login')}
            </Button>
          ) : (
            <form onSubmit={handleRequestOtp}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label={t('forgotPassword.newPassword', 'Nova Senha')}
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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

              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label={t('forgotPassword.confirmPassword', 'Confirmar Senha')}
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
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
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ShieldCheck size={20} />}
                sx={{ 
                  height: 56, 
                  borderRadius: '16px',
                  mb: 3
                }}
              >
                {loading ? t('forgotPassword.resetSubmitting', 'Processando...') : t('forgotPassword.resetSubmit', 'Confirmar e Alterar Senha')}
              </Button>
            </form>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;
