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
  Autocomplete,
  Chip as MuiChip
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
  const [roles, setRoles] = useState<string[]>(['member']);
  const [functions, setFunctions] = useState<string[]>([]);
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

    const result = await inviteMember(email, fullName, roles, functions);

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
    setRoles(['member']);
    setFunctions([]);
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
              SelectProps={{
                multiple: true,
                renderValue: (selected: any) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value: string) => (
                      <MuiChip key={value} label={value === 'admin' ? 'Admin' : value === 'transversal_council' ? 'Conselho' : 'Membro'} size="small" />
                    ))}
                  </Box>
                ),
              }}
              value={roles}
              onChange={(e) => setRoles(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            >
              <MenuItem value="member">{t('profile.member')}</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="transversal_council">{t('profile.transversal_council') || 'Conselho Transversal'}</MenuItem>
            </TextField>

            <Autocomplete
              multiple
              freeSolo
              options={['Presidente', 'Diretor', 'Tesoureiro', 'Secretário', 'Conselheiro']}
              value={functions}
              onChange={(_, newValue) => setFunctions(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Funções Organizacionais" placeholder="Adicionar função..." />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <MuiChip label={option} {...getTagProps({ index })} size="small" color="secondary" />
                ))
              }
            />
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
