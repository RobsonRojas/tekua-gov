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
  Chip as MuiChip,
  Avatar,
  IconButton,
  Typography
} from '@mui/material';
import { Camera, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMembers } from '../../hooks/useMembers';
import { uploadFile, getFileUrl } from '../../utils/storage';

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

  // Photo states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5242880) {
        setError('O tamanho da foto não deve exceder 5MB.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError(t('common.required'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let avatarUrl = null;
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const path = `avatars/${fileName}`;
        await uploadFile(photoFile, {
          bucket: 'member-photos',
          path
        });
        avatarUrl = await getFileUrl('member-photos', path, true);
      }

      const result = await inviteMember(email, fullName, roles, functions, avatarUrl);

      if (result.success) {
        onSuccess();
        handleClose();
      } else {
        setError(result.error || t('common.error'));
      }
    } catch (err: any) {
      console.error('Error in handleInvite:', err);
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setFullName('');
    setRoles(['member']);
    setFunctions([]);
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
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
            {/* Foto de Perfil Uploader */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
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
                  {fullName ? fullName.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : '?')}
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
