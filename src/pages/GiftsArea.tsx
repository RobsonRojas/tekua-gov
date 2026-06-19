import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Avatar,
  Tooltip
} from '@mui/material';
import { 
  CardGiftcard as GiftIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const GiftsArea: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [gifts, setGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [recordingUsageId, setRecordingUsageId] = useState<string | null>(null);

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const { data, error } = await apiClient.invoke('api-gifts', 'fetchGifts');
      if (error) throw new Error(error);
      setGifts(data || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching gifts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const handleCreateGift = async () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    
    setSubmitting(true);
    try {
      const { error } = await apiClient.invoke('api-gifts', 'createGift', {
        title: newTitle,
        description: newDescription
      });
      if (error) throw new Error(error);
      
      setIsDialogOpen(false);
      setNewTitle('');
      setNewDescription('');
      fetchGifts();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordUsage = async (giftId: string) => {
    if (!user) return;
    setRecordingUsageId(giftId);
    try {
      const { error } = await apiClient.invoke('api-gifts', 'recordUsage', {
        giftId
      });
      if (error) throw new Error(error);
      
      alert(t('gifts.usageRecorded'));
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setRecordingUsageId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <GiftIcon sx={{ fontSize: 32, mr: 2, color: 'secondary.main' }} />
          <Typography variant="h4" component="h1" fontWeight={700}>
            {t('gifts.area')}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="secondary"
          startIcon={<AddIcon />} 
          onClick={() => setIsDialogOpen(true)}
        >
          {t('gifts.create')}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {loading ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : gifts.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
              <Typography variant="h6">Nenhuma dádiva cadastrada ainda.</Typography>
            </Box>
          </Grid>
        ) : (
          <AnimatePresence>
            {gifts.map((gift, index) => {
              const title = typeof gift.title === 'string' ? gift.title : (gift.title?.pt || gift.title?.en || '');
              const desc = typeof gift.description === 'string' ? gift.description : (gift.description?.pt || gift.description?.en || '');
              const isOwnGift = user?.id === gift.provider_id;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={gift.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar src={gift.provider?.avatar_url} sx={{ width: 32, height: 32, mr: 1 }} />
                          <Typography variant="subtitle2" color="text.secondary">
                            {gift.provider?.full_name}
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {desc}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Tooltip title={isOwnGift ? "Você não pode utilizar sua própria dádiva" : ""}>
                          <span>
                            <Button
                              variant="outlined"
                              color="secondary"
                              startIcon={recordingUsageId === gift.id ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                              fullWidth
                              onClick={() => handleRecordUsage(gift.id)}
                              disabled={isOwnGift || recordingUsageId === gift.id}
                            >
                              {t('gifts.recordUsage')}
                            </Button>
                          </span>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </AnimatePresence>
        )}
      </Grid>

      <Dialog open={isDialogOpen} onClose={() => !submitting && setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('gifts.create')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
            Ofereça algo para a comunidade (ex: Empréstimo de ferramenta, doação de sementes, carona). Quando alguém utilizar, você ganhará Pontos de Dádiva!
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={t('common.title')}
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('common.description')}
            fullWidth
            multiline
            rows={4}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            required
            placeholder="Descreva o que você está oferecendo e como a pessoa pode ter acesso..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleCreateGift} 
            variant="contained" 
            color="secondary"
            disabled={submitting || !newTitle.trim() || !newDescription.trim()}
          >
            {submitting ? <CircularProgress size={24} /> : t('common.publish')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GiftsArea;
