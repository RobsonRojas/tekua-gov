import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
export default function RewardsManager() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cost: 100,
    status: 'active',
    deadline: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('rewards').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setRewards(data || []);
    }
    setLoading(false);
  };

  const handleOpen = (reward?: any) => {
    if (reward) {
      setEditingId(reward.id);
      setFormData({
        title: reward.title,
        description: reward.description || '',
        cost: reward.cost,
        status: reward.status,
        deadline: reward.deadline ? new Date(reward.deadline).toISOString().split('T')[0] : '',
        image_url: reward.image_url || ''
      });
      setImageFile(null);
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        cost: 100,
        status: 'active',
        deadline: '',
        image_url: ''
      });
      setImageFile(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setMessage(null);
  };

  const handleSave = async () => {
    try {
      setUploadingImage(true);
      let finalImageUrl = formData.image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `rewards/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('public-assets')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('public-assets')
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrlData.publicUrl;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        cost: formData.cost,
        status: formData.status,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        image_url: finalImageUrl
      };

      if (editingId) {
        const { error } = await supabase.from('rewards').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('rewards').insert(payload);
        if (error) throw error;
      }
      
      setMessage({ type: 'success', text: 'Prêmio salvo com sucesso.' });
      fetchRewards();
      handleClose();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este prêmio?')) return;
    try {
      const { error } = await supabase.from('rewards').delete().eq('id', id);
      if (error) throw error;
      fetchRewards();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" color="primary">Gerenciar Prêmios</Typography>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpen()}>
          Novo Prêmio
        </Button>
      </Box>

      {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box p={3} textAlign="center"><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Custo ($S)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data Limite</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rewards.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>{r.cost}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.deadline ? new Date(r.deadline).toLocaleDateString() : 'Sem prazo'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(r)}><Edit size={18} /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(r.id)}><Trash2 size={18} /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rewards.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">Nenhum prêmio cadastrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Prêmio' : 'Novo Prêmio'}</DialogTitle>
        <DialogContent dividers>
          {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}
          <TextField
            fullWidth
            label="Título"
            margin="normal"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            fullWidth
            label="Descrição"
            margin="normal"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            fullWidth
            label="Custo em Surreais"
            type="number"
            margin="normal"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
          />
          <TextField
            fullWidth
            label="Data Limite (Opcional)"
            type="date"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Imagem do Prêmio
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            {(formData.image_url || imageFile) && (
              <Box mt={1}>
                <Typography variant="caption" color="textSecondary">
                  {imageFile ? 'Nova imagem selecionada' : 'Imagem atual mantida'}
                </Typography>
              </Box>
            )}
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={formData.status === 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
              />
            }
            label={formData.status === 'active' ? 'Ativo' : 'Inativo'}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={uploadingImage}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.title || formData.cost <= 0 || uploadingImage}>
            {uploadingImage ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
