import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Tabs, 
  Tab, 
  TextField, 
  InputAdornment, 
  Card, 
  CardContent, 
  Avatar, 
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import { 
  Wrench, 
  Plus, 
  Search, 
  Calendar,
  PackageCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/useAuth';
import { CreateSharingItemModal } from '../../components/sharing/CreateSharingItemModal';

const SharingMarketplace: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchMarketplaceData();
  }, [tabValue, searchQuery]);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tabValue === 0) {
        // Marketplace Tab: Active, Public items
        let query = supabase
          .from('equipment_items')
          .select('*, owner:profiles(*)')
          .eq('status', 'active')
          .eq('is_public', true);

        if (searchQuery.trim()) {
          query = query.ilike('title', `%${searchQuery}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        setItems(data || []);
      } else if (tabValue === 1) {
        // My Items Tab: Owner = User
        let query = supabase
          .from('equipment_items')
          .select('*, owner:profiles(*)')
          .eq('owner_id', profile?.id);

        if (searchQuery.trim()) {
          query = query.ilike('title', `%${searchQuery}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        setItems(data || []);
      } else if (tabValue === 2) {
        // My Rentals Tab: transactions where user is borrower
        const { data, error } = await supabase
          .from('sharing_transactions')
          .select('*, item:equipment_items(*, owner:profiles(*))')
          .eq('borrower_id', profile?.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setRentals(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching sharing economy data:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchQuery('');
  };

  const handleOpenCreateModal = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Wrench size={40} style={{ color: '#6366f1' }} />
          <Box>
            <Typography variant="h1" color="primary.main">
              {t('sharing.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('sharing.subtitle')}
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={handleOpenCreateModal}
          sx={{ borderRadius: '12px', px: 3, py: 1.5 }}
        >
          {t('sharing.newItem')}
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 4, 
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          '& .MuiTabs-indicator': { bgcolor: 'primary.main' } 
        }}
      >
        <Tab label="Marketplace" sx={{ fontWeight: 600 }} />
        <Tab label={t('work.myInvolvement') || 'Meus Equipamentos'} sx={{ fontWeight: 600 }} />
        <Tab label={t('wallet.history') || 'Meus Aluguéis'} sx={{ fontWeight: 600 }} />
      </Tabs>

      {/* Search Input for non-transaction tabs */}
      {tabValue !== 2 && (
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar ferramentas (martelo, furadeira...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </InputAdornment>
            ),
          }}
        />
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Marketplace & My Items Grid */}
          {tabValue !== 2 && (
            <Grid container spacing={3}>
              {items.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                  >
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      Nenhum equipamento encontrado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tente buscar por outro termo ou cadastre um novo equipamento.
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                items.map((item) => (
                  <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      elevation={0}
                      onClick={() => navigate(`/sharing/${item.id}`)}
                      sx={{
                        height: '100%',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        bgcolor: 'background.paper',
                        transition: 'transform 0.2s ease-in-out, border-color 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h3" fontWeight={700} noWrap sx={{ maxWidth: '75%' }}>
                            {item.title}
                          </Typography>
                          <Chip 
                            label={`${item.hourly_rate_surreias} $S/h`} 
                            color="success" 
                            size="small" 
                            sx={{ fontWeight: 700 }}
                          />
                        </Box>

                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 3, 
                            lineHeight: 1.6, 
                            flexGrow: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {item.description || 'Nenhuma descrição fornecida.'}
                        </Typography>

                        <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={item.owner?.avatar_url} sx={{ width: 28, height: 28 }}>
                              {item.owner?.full_name?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: '120px' }}>
                              {item.owner?.full_name || 'Membro'}
                            </Typography>
                          </Box>
                          
                          {/* Tags / status */}
                          <Stack direction="row" spacing={0.5}>
                            {!item.is_public && (
                              <Chip label={t('sharing.private')} size="small" variant="outlined" />
                            )}
                            {item.status === 'removed' && (
                              <Chip label={t('sharing.removed')} size="small" color="error" />
                            )}
                            {item.owner_id === profile?.id && (
                              <Button 
                                size="small" 
                                variant="outlined" 
                                onClick={(e) => handleOpenEditModal(item, e)}
                                sx={{ minWidth: 'auto', p: '2px 8px' }}
                              >
                                Editar
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {/* My Rentals (Transactions) Tab */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              {rentals.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                  >
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      Nenhum aluguel registrado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Você ainda não alugou ou emprestou nenhuma ferramenta do marketplace.
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                rentals.map((tx) => (
                  <Grid key={tx.id} size={{ xs: 12, md: 6 }}>
                    <Paper
                      elevation={0}
                      onClick={() => navigate(`/sharing/${tx.item?.id}`)}
                      sx={{
                        p: 3,
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, border-color 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h3" fontWeight={700}>
                          {tx.item?.title}
                        </Typography>
                        <Chip 
                          label={
                            tx.status === 'pending' ? t('sharing.statusPending') :
                            tx.status === 'delivered' ? t('sharing.statusDelivered') :
                            tx.status === 'completed' ? t('sharing.statusCompleted') :
                            t('sharing.statusCancelled')
                          }
                          color={
                            tx.status === 'completed' ? 'success' :
                            tx.status === 'delivered' ? 'primary' :
                            tx.status === 'pending' ? 'warning' : 'default'
                          }
                          size="small"
                        />
                      </Box>

                      <Stack spacing={1.5} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                          <Calendar size={16} />
                          <Typography variant="caption">
                            Iniciado em {new Date(tx.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                        {tx.completed_at && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <PackageCheck size={16} />
                            <Typography variant="caption">
                              Finalizado em {new Date(tx.completed_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={tx.item?.owner?.avatar_url} sx={{ width: 24, height: 24 }} />
                          <Typography variant="caption" fontWeight={600}>
                            Dono: {tx.item?.owner?.full_name}
                          </Typography>
                        </Box>
                      </Stack>

                      {tx.total_surreias && (
                        <Typography variant="body1" fontWeight={700} color="success.main">
                          Total pago: {tx.total_surreias} $S
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      <CreateSharingItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedItem}
        onSave={fetchMarketplaceData}
      />
    </Container>
  );
};

export default SharingMarketplace;
