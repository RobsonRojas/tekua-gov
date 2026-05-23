import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  TextField, 
  Avatar, 
  Chip, 
  Alert, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  IconButton,
  Snackbar
} from '@mui/material';
import { 
  ArrowLeft, 
  Share2, 
  ShieldAlert, 
  MessageCircle, 
  CheckCircle2, 
  Camera,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../context/useAuth';

const SharingItemDetail: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Q&A
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [answerText, setAnswerText] = useState<{ [key: string]: string }>({});
  const [submittingQ, setSubmittingQ] = useState(false);

  // Moderation
  const [modOpen, setModOpen] = useState(false);
  const [justification, setJustification] = useState('');
  const [moderating, setModerating] = useState(false);
  const [modLogs, setModLogs] = useState<any[]>([]);

  // Transactions / Handovers
  const [activeTx, setActiveTx] = useState<any>(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [processingTx, setProcessingTx] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isAdmin = profile?.roles?.includes('admin');
  const isOwner = item?.owner_id === profile?.id;

  useEffect(() => {
    fetchItemDetails();
  }, [itemId]);

  const fetchItemDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch item
      const { data: itemData, error: itemError } = await supabase
        .from('equipment_items')
        .select('*, owner:profiles(*)')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;
      setItem(itemData);

      // 2. Fetch questions
      const { data: qData } = await supabase
        .from('equipment_questions')
        .select('*, asker:profiles(*)')
        .eq('item_id', itemId)
        .order('created_at', { ascending: true });
      
      setQuestions(qData || []);

      // 3. Fetch active transaction (where user is borrower OR owner is user)
      const { data: txData } = await supabase
        .from('sharing_transactions')
        .select('*, borrower:profiles(*)')
        .eq('item_id', itemId)
        .in('status', ['pending', 'delivered'])
        .order('created_at', { ascending: false });

      if (txData && txData.length > 0) {
        // Find if user is borrower or owner is user
        const currentTx = txData.find(tx => tx.borrower_id === profile?.id || itemData.owner_id === profile?.id);
        setActiveTx(currentTx || null);
      } else {
        setActiveTx(null);
      }

      // 4. Fetch moderation logs if admin or owner
      if (isAdmin || itemData.owner_id === profile?.id) {
        const { data: logData } = await supabase
          .from('equipment_moderation_logs')
          .select('*, admin:profiles(*)')
          .eq('item_id', itemId);
        setModLogs(logData || []);
      }
    } catch (err: any) {
      console.error('Error fetching item details:', err);
      setError(err.message || 'Error loading item details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastMsg(t('work.linkCopied') || 'Link copiado!');
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;
    setSubmittingQ(true);
    try {
      const response = await apiClient.invoke('api-sharing', 'askQuestion', {
        itemId,
        question_text: newQuestion
      });
      if (response.error) throw new Error(response.error);
      setNewQuestion('');
      fetchItemDetails();
      setToastMsg('Pergunta enviada com sucesso!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingQ(false);
    }
  };

  const handleAnswerQuestion = async (qId: string) => {
    const ans = answerText[qId];
    if (!ans || !ans.trim()) return;
    try {
      const response = await apiClient.invoke('api-sharing', 'answerQuestion', {
        questionId: qId,
        answer_text: ans
      });
      if (response.error) throw new Error(response.error);
      setAnswerText(prev => ({ ...prev, [qId]: '' }));
      fetchItemDetails();
      setToastMsg('Resposta enviada com sucesso!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleModerate = async () => {
    if (!justification.trim()) return;
    setModerating(true);
    try {
      const response = await apiClient.invoke('api-sharing', 'moderateItem', {
        itemId,
        justification
      });
      if (response.error) throw new Error(response.error);
      setModOpen(false);
      setJustification('');
      fetchItemDetails();
      setToastMsg('Item removido com sucesso!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setModerating(false);
    }
  };

  const handleRequestRental = async () => {
    setProcessingTx(true);
    try {
      const response = await apiClient.invoke('api-sharing', 'startHandover', {
        itemId
      });
      if (response.error) throw new Error(response.error);
      fetchItemDetails();
      setToastMsg('Solicitação iniciada. Aguardando registro da entrega.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingTx(false);
    }
  };

  const handleRegisterEvidence = async () => {
    if (!evidenceUrl.trim()) {
      setError('A URL da evidência é obrigatória');
      return;
    }
    setProcessingTx(true);
    try {
      const response = await apiClient.invoke('api-sharing', 'registerEvidence', {
        transactionId: activeTx.id,
        evidence_url: evidenceUrl
      });
      if (response.error) throw new Error(response.error);
      setEvidenceUrl('');
      fetchItemDetails();
      setToastMsg('Evidência registrada! Item agora marcado como entregue.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingTx(false);
    }
  };

  const handleConfirmReturn = async () => {
    setProcessingTx(true);
    try {
      const response = await apiClient.invoke('api-sharing', 'confirmReturn', {
        transactionId: activeTx.id
      });
      if (response.error) throw new Error(response.error);
      fetchItemDetails();
      setToastMsg('Retorno confirmado! Pagamento em surreias processado.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingTx(false);
    }
  };

  const togglePrivacy = async () => {
    try {
      const response = await apiClient.invoke('api-sharing', 'updateItem', {
        itemId,
        updates: { is_public: !item.is_public }
      });
      if (response.error) throw new Error(response.error);
      fetchItemDetails();
      setToastMsg(item.is_public ? 'Item marcado como privado' : 'Item marcado como público');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowLeft size={16} />} 
        onClick={() => navigate('/sharing')}
        sx={{ mb: 3 }}
      >
        {t('common.back')}
      </Button>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      {item && (
        <Grid container spacing={4}>
          {/* Main info card */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h3" fontWeight={800} gutterBottom>
                    {item.title}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip 
                      label={item.is_public ? t('sharing.public') : t('sharing.private')} 
                      color={item.is_public ? 'primary' : 'default'} 
                      size="small" 
                    />
                    <Chip 
                      label={item.status === 'active' ? t('sharing.active') : t('sharing.removed')} 
                      color={item.status === 'active' ? 'success' : 'error'} 
                      size="small" 
                    />
                  </Stack>
                </Box>
                <IconButton onClick={handleShare} color="primary">
                  <Share2 size={20} />
                </IconButton>
              </Box>

              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4, color: 'text.secondary', lineHeight: 1.7 }}>
                {item.description || 'Nenhuma descrição fornecida.'}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 6 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      {t('sharing.pricePerHour')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DollarSign size={20} color="#10b981" />
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {item.hourly_rate_surreias} $S
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      {t('sharing.owner')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={item.owner?.avatar_url} sx={{ width: 32, height: 32 }}>
                        {item.owner?.full_name?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography variant="body1" fontWeight={600}>
                        {item.owner?.full_name || 'Membro do Tekua'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Q&A Section */}
            <Paper elevation={0} sx={{ p: 4, mt: 4, borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <MessageCircle size={28} color="#6366f1" />
                <Typography variant="h4" fontWeight={700}>
                  {t('sharing.questions')}
                </Typography>
              </Box>

              {/* Ask Question (Non-owners) */}
              {!isOwner && (
                <Box sx={{ mb: 4 }}>
                  {profile ? (
                    <>
                      <TextField
                        fullWidth
                        placeholder={t('sharing.askQuestion')}
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        sx={{ mb: 2 }}
                        slotProps={{ htmlInput: { 'data-testid': 'ask-question-input' } }}
                      />
                      <Button 
                        variant="contained" 
                        onClick={handleAskQuestion}
                        disabled={submittingQ || !newQuestion.trim()}
                      >
                        {t('common.send')}
                      </Button>
                    </>
                  ) : (
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        borderRadius: '16px', 
                        borderStyle: 'dashed', 
                        borderColor: 'primary.main',
                        bgcolor: 'rgba(99, 102, 241, 0.02)',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('sharing.loginToAsk')}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => navigate('/login', { state: { from: `/sharing/${itemId}` } })}
                      >
                        {t('common.login', 'Entrar')}
                      </Button>
                    </Paper>
                  )}
                </Box>
              )}

              {/* Questions List */}
              <Stack spacing={3}>
                {questions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma pergunta cadastrada para este item.
                  </Typography>
                ) : (
                  questions.map((q) => (
                    <Box key={q.id} sx={{ p: 2, borderRadius: '12px', bgcolor: 'background.default' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar src={q.asker?.avatar_url} sx={{ width: 24, height: 24 }} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          {q.asker?.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(q.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2, pl: 5 }}>
                        {q.question_text}
                      </Typography>

                      {/* Answer */}
                      {q.answer_text ? (
                        <Box sx={{ pl: 5, borderLeft: '2px solid rgba(99, 102, 241, 0.3)', mt: 1 }}>
                          <Typography variant="caption" color="primary.main" fontWeight={600}>
                            Resposta do Proprietário:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {q.answer_text}
                          </Typography>
                        </Box>
                      ) : (
                        isOwner && (
                          <Box sx={{ pl: 5, mt: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder={t('sharing.answer') + '...'}
                              value={answerText[q.id] || ''}
                              onChange={(e) => setAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))}
                              sx={{ mb: 1 }}
                            />
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => handleAnswerQuestion(q.id)}
                            >
                              {t('sharing.answer')}
                            </Button>
                          </Box>
                        )
                      )}
                    </Box>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Sidebar controls */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Rent & Handover Actions */}
            {item.status === 'active' && (
              <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {t('sharing.rent')}
                </Typography>
                
                {!profile ? (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('sharing.loginToRent')}
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      size="large"
                      onClick={() => navigate('/login', { state: { from: `/sharing/${itemId}` } })}
                      sx={{ py: 1.5, borderRadius: '12px' }}
                    >
                      {t('sharing.loginToRentBtn')}
                    </Button>
                  </Stack>
                ) : !activeTx ? (
                  !isOwner && (
                    <Button 
                      variant="contained" 
                      fullWidth 
                      size="large"
                      onClick={handleRequestRental}
                      disabled={processingTx}
                      sx={{ py: 1.5, borderRadius: '12px' }}
                    >
                      {processingTx ? <CircularProgress size={24} /> : t('sharing.rent')}
                    </Button>
                  )
                ) : (
                  <Stack spacing={3} sx={{ mt: 2 }}>
                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Calendar size={24} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                          {activeTx.status === 'pending' ? t('sharing.statusPending') : t('sharing.statusDelivered')}
                        </Typography>
                        <Typography variant="caption">
                          Iniciado em {new Date(activeTx.started_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Borrower workflow: submit evidence */}
                    {activeTx.borrower_id === profile?.id && activeTx.status === 'pending' && (
                      <Stack spacing={2}>
                        <Typography variant="body2" fontWeight={600}>
                          {t('sharing.deliveryEvidence')}
                        </Typography>
                        <TextField
                          fullWidth
                          label="URL da Foto/Evidência"
                          value={evidenceUrl}
                          onChange={(e) => setEvidenceUrl(e.target.value)}
                          placeholder="https://example.com/foto.jpg"
                        />
                        <Button 
                          variant="contained" 
                          startIcon={<Camera size={16} />}
                          onClick={handleRegisterEvidence}
                          disabled={processingTx || !evidenceUrl.trim()}
                        >
                          {t('sharing.deliveryEvidence')}
                        </Button>
                      </Stack>
                    )}

                    {/* Owner workflow: confirm receipt */}
                    {isOwner && activeTx.status === 'delivered' && (
                      <Stack spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          O locatário enviou a evidência e está usando o item. Quando o item for devolvido, confirme o recebimento para encerrar o aluguel e receber os surreais.
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="success"
                          startIcon={<CheckCircle2 size={16} />}
                          onClick={handleConfirmReturn}
                          disabled={processingTx}
                        >
                          {t('sharing.confirmReceipt')}
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                )}
              </Paper>
            )}

            {/* Owner Actions */}
            {isOwner && (
              <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Ações do Proprietário
                </Typography>
                <Stack spacing={2}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={togglePrivacy}
                  >
                    {item.is_public ? t('sharing.makePrivate') : t('sharing.makePublic')}
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* Admin Controls */}
            {isAdmin && item.status === 'active' && (
              <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.1)', borderStyle: 'dashed', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'error.main', mb: 2 }}>
                  <ShieldAlert size={20} />
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    Moderação Admin
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  color="error" 
                  fullWidth
                  onClick={() => setModOpen(true)}
                >
                  {t('sharing.remove')}
                </Button>
              </Paper>
            )}

            {/* Moderation History */}
            {modLogs.length > 0 && (
              <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Histórico de Moderação
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {modLogs.map((log) => (
                    <Box key={log.id} sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Ação: {log.action === 'remove' ? 'Remoção' : log.action}
                      </Typography>
                      <Typography variant="body2" sx={{ my: 1 }}>
                        Justificativa: {log.justification}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Moderador: {log.admin?.full_name} | {new Date(log.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {/* Moderation Dialog */}
      <Dialog open={modOpen} onClose={() => setModOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {t('sharing.remove')}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Insira a justificativa para a remoção deste equipamento. O proprietário será notificado.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('sharing.justification')}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            required
            placeholder="Ex: Item viola os termos de uso do Tekua..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setModOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleModerate} 
            color="error" 
            variant="contained"
            disabled={moderating || !justification.trim()}
          >
            {moderating ? <CircularProgress size={20} /> : t('sharing.remove')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toastMsg}
        autoHideDuration={4000}
        onClose={() => setToastMsg(null)}
      >
        <Alert onClose={() => setToastMsg(null)} severity="success" sx={{ width: '100%' }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SharingItemDetail;
