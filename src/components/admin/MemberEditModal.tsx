import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  MenuItem, 
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMembers } from '../../hooks/useMembers';

interface MemberEditModalProps {
  open: boolean;
  onClose: () => void;
  member: any;
  onSave: () => void;
}

const MemberEditModal: React.FC<MemberEditModalProps> = ({ open, onClose, member, onSave }) => {
  const { t } = useTranslation();
  const { updateMember, members } = useMembers();
  const [fullName, setFullName] = useState(member?.full_name || '');
  const [role, setRole] = useState(member?.role || 'member');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFullName(member.full_name || '');
      setRole(member.role || 'member');
    }
  }, [member]);

  const handleSave = async () => {
    // Basic validation: ensure at least one admin remains
    if (member.role === 'admin' && role === 'member') {
      const adminCount = members.filter(m => m.role === 'admin').length;
      if (adminCount <= 1) {
        setError('Não é possível remover o único administrador do sistema.');
        return;
      }
    }

    setSaving(true);
    setError(null);
    const success = await updateMember(member.id, { 
      full_name: fullName,
      role: role
    });
    
    if (success) {
      onSave();
      onClose();
    } else {
      setError('Erro ao salvar as alterações.');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {t('profile.edit')}
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Email
          </Typography>
          <Typography variant="body1">
            {member?.email}
          </Typography>
        </Box>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label={t('profile.fullName')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextField
            select
            fullWidth
            label={t('profile.role')}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="member">Membro</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={saving}
          startIcon={saving && <CircularProgress size={20} color="inherit" />}
        >
          {saving ? t('profile.saving') : t('profile.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Need to import Stack from MUI
import { Stack } from '@mui/material';

export default MemberEditModal;
