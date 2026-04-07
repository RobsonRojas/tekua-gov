import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';

const SecurityTab: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

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
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Update password error:', err);
      setError(err.message || t('auth.unknown_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 1 }}>
        {t('profile.security_tab.changePassword')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        {t('profile.security_tab.passwordDescription')}
      </Typography>

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
          {t('profile.security_tab.successMessage')}
        </Alert>
      )}

      <form onSubmit={handleUpdatePassword}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            id="new-password"
            name="new-password"
            label={t('profile.security_tab.newPassword')}
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
            id="confirm-password"
            name="confirm-password"
            label={t('profile.security_tab.confirmPassword')}
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
          variant="contained"
          size="large"
          type="submit"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle size={20} />}
          sx={{ 
            height: 50, 
            borderRadius: '12px',
            px: 4
          }}
        >
          {loading ? t('forgotPassword.resetSubmitting') : t('profile.security_tab.updateButton')}
        </Button>
      </form>
    </Box>
  );
};

export default SecurityTab;
