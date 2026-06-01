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
  Divider,
  Avatar,
  IconButton
} from '@mui/material';
import { Camera, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMembers } from '../../hooks/useMembers';
import { uploadFile, getFileUrl } from '../../utils/storage';

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

  // Photo states
  const [avatarUrl, setAvatarUrl] = useState(member?.avatar_url || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(member?.avatar_url || null);

  useEffect(() => {
    if (member) {
      setFullName(member.full_name || '');
      const initialRoles = member.roles || (member.role ? [member.role] : ['member']);
      setRoles(initialRoles);
      
      const initialFunctions = member.functions || (member.board_role ? [member.board_role] : (member.is_board_member ? ['Diretoria'] : []));
      setFunctions(initialFunctions);
      
      setIsBoardMember(initialFunctions.length > 0 || !!member.is_board_member);
      setIsTransversalCouncil(initialRoles.includes('transversal_council'));

      setAvatarUrl(member.avatar_url || '');
      setPhotoPreview(member.avatar_url || null);
      setPhotoFile(null);
    }
  }, [member]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5242880) {
        setError('O tamanho da foto não deve exceder 5MB.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setAvatarUrl(''); // Reset since we have a new file
      setError(null);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    setAvatarUrl('');
  };

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

    try {
      let finalAvatarUrl = avatarUrl;
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const path = `avatars/${fileName}`;
        await uploadFile(photoFile, {
          bucket: 'member-photos',
          path
        });
        finalAvatarUrl = await getFileUrl('member-photos', path, true);
      }

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
        avatar_url: finalAvatarUrl || null,
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
    } catch (err: any) {
      console.error('Error saving member changes:', err);
      setError(err.message || 'Erro ao salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {t('profile.edit')}
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Email
            </Typography>
            <Typography variant="body1">
              {member?.email}
            </Typography>
          </Box>
        </Box>

        {/* Foto de Perfil Uploader */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative', width: 90, height: 90 }}>
            <Avatar
              src={photoPreview || undefined}
              sx={{
                width: 90,
                height: 90,
                fontSize: '2rem',
                fontWeight: 700,
                border: '3px solid rgba(99, 102, 241, 0.5)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                bgcolor: 'primary.main',
              }}
            >
              {fullName ? fullName.charAt(0).toUpperCase() : (member?.email ? member.email.charAt(0).toUpperCase() : '?')}
            </Avatar>
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                bgcolor: 'primary.main',
                color: 'white',
                p: 0.75,
                border: '2px solid',
                borderColor: 'background.paper',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }}
            >
              <input
                type="file"
                hidden
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
              />
              <Camera size={14} />
            </IconButton>
          </Box>
          <Box sx={{ mt: 1 }}>
            {photoPreview ? (
              <Button
                size="small"
                color="error"
                variant="text"
                startIcon={<Trash2 size={12} />}
                onClick={handleRemovePhoto}
                sx={{ textTransform: 'none', py: 0 }}
              >
                Remover Foto
              </Button>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Formatos: JPG, PNG, WEBP (Máx: 5MB)
              </Typography>
            )}
          </Box>
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
