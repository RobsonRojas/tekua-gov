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
  CircularProgress,
  Stack,
  Autocomplete,
  Chip as MuiChip
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
  const [roles, setRoles] = useState<string[]>(member?.roles || []);
  const [functions, setFunctions] = useState<string[]>(member?.functions || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFullName(member.full_name || '');
      setRoles(member.roles || (member.role ? [member.role] : ['member']));
      setFunctions(member.functions || (member.board_role ? [member.board_role] : (member.is_board_member ? ['Diretoria'] : [])));
    }
  }, [member]);

  const handleSave = async () => {
    // Basic validation: ensure at least one admin remains
    if (member.roles?.includes('admin') && !roles.includes('admin')) {
      const adminCount = members.filter(m => m.roles?.includes('admin')).length;
      if (adminCount <= 1) {
        setError('Não é possível remover o único administrador do sistema.');
        return;
      }
    }

    if (roles.length === 0) {
      setError('O usuário deve ter pelo menos um papel.');
      return;
    }

    setSaving(true);
    setError(null);
    const success = await updateMember(member.id, { 
      full_name: fullName,
      roles: roles,
      functions: functions,
      // Legacy compatibility
      role: roles.includes('admin') ? 'admin' : (roles.includes('transversal_council') ? 'transversal_council' : 'member'),
      is_board_member: functions.length > 0,
      board_role: functions.length > 0 ? functions[0] : null
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
            <MenuItem value="member">Membro</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
            <MenuItem value="transversal_council">Conselho Transversal</MenuItem>
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

export default MemberEditModal;
