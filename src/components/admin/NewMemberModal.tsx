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
  Stack,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMembers } from '../../hooks/useMembers';
import { BOARD_ROLES } from '../../constants/boardRoles';

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
  const [isBoardMember, setIsBoardMember] = useState(false);
  const [boardRole, setBoardRole] = useState('');
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

    const result = await inviteMember(email, fullName, role, isBoardMember, isBoardMember ? boardRole : null);

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
    setIsBoardMember(false);
    setBoardRole('');
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

            <FormControlLabel
              control={
                <Switch 
                  checked={isBoardMember} 
                  onChange={(e) => setIsBoardMember(e.target.checked)} 
                />
              }
              label="Membro da Diretoria"
            />

            {isBoardMember && (
              <TextField
                select
                fullWidth
                label="Cargo na Diretoria"
                value={boardRole}
                onChange={(e) => setBoardRole(e.target.value)}
              >
                <MenuItem value=""><em>Nenhum específico</em></MenuItem>
                {BOARD_ROLES.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </TextField>
            )}
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
