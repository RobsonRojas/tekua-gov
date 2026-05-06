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
  Chip as MuiChip,
  Switch,
  FormControlLabel,
  Divider
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
  const [isBoardMember, setIsBoardMember] = useState(false);
  const [isTransversalCouncil, setIsTransversalCouncil] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFullName(member.full_name || '');
      const initialRoles = member.roles || (member.role ? [member.role] : ['member']);
      setRoles(initialRoles);
      
      const initialFunctions = member.functions || (member.board_role ? [member.board_role] : (member.is_board_member ? ['Diretoria'] : []));
      setFunctions(initialFunctions);
      
      setIsBoardMember(initialFunctions.length > 0 || !!member.is_board_member);
      setIsTransversalCouncil(initialRoles.includes('transversal_council'));
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

    // Sync roles array with toggles
    let finalRoles = roles.filter(r => r !== 'transversal_council');
    if (isTransversalCouncil) {
      finalRoles.push('transversal_council');
    }

    // Ensure primary role exists (admin or member)
    if (!finalRoles.includes('admin') && !finalRoles.includes('member')) {
      finalRoles.push('member');
    }

    const finalFunctions = isBoardMember ? functions : [];

    const success = await updateMember(member.id, { 
      full_name: fullName,
      roles: finalRoles,
      functions: finalFunctions,
      // Legacy compatibility
      role: finalRoles.includes('admin') ? 'admin' : (finalRoles.includes('transversal_council') ? 'transversal_council' : 'member'),
      is_board_member: isBoardMember,
      board_role: finalFunctions.length > 0 ? finalFunctions[0] : null
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
            value={roles.includes('admin') ? 'admin' : 'member'}
            onChange={(e) => {
              const val = e.target.value;
              setRoles(prev => {
                const filtered = prev.filter(r => r !== 'admin' && r !== 'member');
                return [...filtered, val];
              });
            }}
          >
            <MenuItem value="member">Membro</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
          </TextField>

          <Divider />

          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Switch 
                  checked={isTransversalCouncil} 
                  onChange={(e) => setIsTransversalCouncil(e.target.checked)} 
                  color="primary"
                />
              }
              label={
                <Typography variant="body1" fontWeight={500}>
                  {t('profile.transversal_council') || 'Membro do Conselho Transversal'}
                </Typography>
              }
            />

            <FormControlLabel
              control={
                <Switch 
                  checked={isBoardMember} 
                  onChange={(e) => setIsBoardMember(e.target.checked)} 
                  color="primary"
                />
              }
              label={
                <Typography variant="body1" fontWeight={500}>
                  {t('profile.isBoardMember') || 'Membro da Diretoria'}
                </Typography>
              }
            />
          </Stack>

          {isBoardMember && (
            <Autocomplete
              multiple
              freeSolo
              options={['Presidente', 'Vice-Presidente', 'Diretor', 'Tesoureiro', 'Secretário', 'Conselheiro']}
              value={functions}
              onChange={(_, newValue) => setFunctions(newValue)}
              renderInput={(params) => (
                <TextField {...params} label={t('profile.boardRole') || "Cargo na Diretoria"} placeholder="Adicionar cargo..." />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <MuiChip label={option} {...getTagProps({ index })} size="small" color="secondary" />
                ))
              }
            />
          )}
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
