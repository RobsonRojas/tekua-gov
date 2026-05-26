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
import { apiClient } from '../lib/api';
import LanguageSelector from '../components/LanguageSelector';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [validating, setValidating] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const [email, setEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // 1. Initial Validation on Mount
  useEffect(() => {
    const validateToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      
      // Look for token in query params (?token=... or ?code=...)
      let tokenParam = params.get('token') || params.get('code');
      
      // Look for access_token in the hash (#access_token=...) if not found in query params
      if (!tokenParam && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        tokenParam = hashParams.get('access_token');
      }

      if (!emailParam || !tokenParam) {
        setError(t('forgotPassword.invalidRequest', 'A solicitação de troca de senha não existe ou expirou.'));
        setValidating(false);
        return;
      }

      setEmail(emailParam);
      
      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: emailParam,
          token: tokenParam,
          type: 'recovery',
        });

        if (verifyError) {
          console.error('verifyOtp error:', verifyError);
          setError(t('forgotPassword.invalidRequest', 'A solicitação de troca de senha não existe ou expirou.'));
        } else {
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

  // 2. Request OTP code via Edge Function
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic password validation
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
      const { error: apiErr } = await apiClient.invoke('api-public', 'sendResetPasswordOtp', {
        email
      });

      if (apiErr) throw new Error(apiErr);
      
      setOtpSent(true);
    } catch (err: any) {
      console.error('Error requesting reset OTP:', err);
      setError(err.message || t('auth.unknown_error'));
    } finally {
      setLoading(false);
    }
  };

  // 3. Confirm and finalize password update via Edge Function using OTP
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (otpCode.length !== 6) {
      setError(t('forgotPassword.invalidOtpLength', 'O código OTP deve ter 6 dígitos.'));
      setLoading(false);
      return;
    }

    try {
      const { error: apiErr } = await apiClient.invoke('api-public', 'confirmResetPasswordWithOtp', {
        email,
        otp: otpCode,
        newPassword: password
      });

      if (apiErr) throw new Error(apiErr);

      setSuccess(true);
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Error confirming reset with OTP:', err);
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
              {otpSent 
                ? t('forgotPassword.otpSubtitle', 'Confirmar redefinição com código de segurança') 
                : t('forgotPassword.resetSubtitle', 'Escolha uma nova senha forte para acessar sua conta')}
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
          ) : !otpSent ? (
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
                {loading ? t('forgotPassword.sendingOtp', 'Enviando OTP...') : t('forgotPassword.requestOtpButton', 'Enviar Código por E-mail')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleConfirmReset}>
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label={t('forgotPassword.otpCode', 'Código OTP')}
                  variant="outlined"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  placeholder="123456"
                  disabled={loading}
                  inputProps={{ 
                    style: { textAlign: 'center', fontSize: '20px', letterSpacing: '4px', fontWeight: 'bold' } 
                  }}
                />
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading || otpCode.length !== 6}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle size={20} />}
                sx={{ 
                  height: 56, 
                  borderRadius: '16px',
                  mb: 3
                }}
              >
                {loading ? t('forgotPassword.resetSubmitting', 'Processando...') : t('forgotPassword.resetSubmit', 'Confirmar e Alterar Senha')}
              </Button>

              <Button
                fullWidth
                variant="text"
                size="small"
                onClick={() => setOtpSent(false)}
                disabled={loading}
                sx={{ textTransform: 'none' }}
              >
                {t('forgotPassword.changePasswordBack', 'Voltar para alterar senha')}
              </Button>
            </form>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;
