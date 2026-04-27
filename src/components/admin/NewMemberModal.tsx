import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  MenuItem, 
  Box,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMembers } from '../../hooks/useMembers';

interface NewMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewMemberModal: React.FC<NewMemberModalProps> = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { inviteMember } = useMembers();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError(t('common.required'));
      return;
    }

    setLoading(true);
    setError(null);

    const result = await inviteMember(email, fullName, role);

    if (result.success) {
      onSuccess();
      handleClose();
    } else {
      setError(result.error || t('common.error'));
    }
    setLoading(false);
  };

  const handleClose = () => {
    setEmail('');
    setFullName('');
    setRole('member');
    setError(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          bgcolor: 'background.paper',
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pt: 3 }}>
        {t('admin.newMember')}
      </DialogTitle>
      <Box component="form" onSubmit={handleInvite}>
        <DialogContent sx={{ pb: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
          
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <TextField
              fullWidth
              label={t('profile.fullName')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('admin.noName')}
            />
            <TextField
              select
              fullWidth
              label={t('profile.role')}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="member">{t('profile.member')}</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 3, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <Button onClick={handleClose} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button 
            type="submit"
            variant="contained" 
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
            sx={{ px: 4, borderRadius: '8px' }}
          >
            {loading ? t('common.sending') : t('common.send')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default NewMemberModal;
