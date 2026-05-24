import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button, 
  TextField,
  CircularProgress,
  Alert,
  Stack,
  InputAdornment,
  Divider,
  IconButton,
  Grid
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, User, Trophy, LogIn } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../lib/api';
import LanguageSelector from '../components/LanguageSelector';
import { motion } from 'framer-motion';

const TaskInviteLanding: React.FC = () => {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<any>(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const [taskError, setTaskError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const lang = i18n.language === 'pt' ? 'pt' : 'en';

  useEffect(() => {
    const fetchTask = async () => {
      if (!inviteToken) return;
      setLoadingTask(true);
      try {
        const { data, error } = await apiClient.invoke('api-public', 'getTaskByInviteToken', { inviteToken });
        if (error) throw new Error(error);
        setTask(data);
      } catch (err: any) {
        setTaskError(err.message || 'Convite inválido ou tarefa não disponível.');
      } finally {
        setLoadingTask(false);
      }
    };
    fetchTask();
  }, [inviteToken]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteToken) return;
    
    setRegistering(true);
    setRegisterError(null);
    
    try {
      const { error } = await apiClient.invoke('api-public', 'registerWithInviteToken', { 
        inviteToken,
        fullName,
        email,
        password
      });

      if (error) throw new Error(error);
      
      setRegisterSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setRegisterError(err.message || 'Erro ao registrar.');
    } finally {
      setRegistering(false);
    }
  };

  if (loadingTask) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (taskError || !task) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>
            {taskError || 'Tarefa não encontrada.'}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/login')}>
            Ir para Login
          </Button>
        </Paper>
      </Container>
    );
  }

  const title = task.title?.[lang] || task.title?.pt || 'Sem título';
  const description = task.description?.[lang] || task.description?.pt || 'Sem descrição';

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
        <LanguageSelector />
      </Box>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Grid container spacing={4}>
          {/* Task Info Side */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ pr: { md: 4 }, mb: { xs: 4, md: 0 } }}>
              <Typography variant="overline" color="primary.main" fontWeight={700} sx={{ letterSpacing: 1.5 }}>
                VOCÊ FOI CONVIDADO
              </Typography>
              <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mt: 1 }}>
                {title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, mt: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                  <Trophy size={28} color="#f59e0b" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Recompensa</Typography>
                  <Typography variant="h5" fontWeight={800} color="#f59e0b">
                    {task.reward_amount} $S
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {description}
              </Typography>
            </Box>
          </Grid>

          {/* Registration Form Side */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                borderRadius: '24px', 
                bgcolor: 'background.paper',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              {registerSuccess ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                    Cadastro realizado e tarefa atribuída com sucesso!
                  </Alert>
                  <Typography variant="body1" color="text.secondary">
                    Redirecionando para o login...
                  </Typography>
                  <CircularProgress size={24} sx={{ mt: 3 }} />
                </Box>
              ) : (
                <>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Criar conta para aceitar
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Preencha seus dados para entrar na Tekuá e assumir esta tarefa.
                  </Typography>

                  {registerError && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                      {registerError}
                    </Alert>
                  )}

                  <form onSubmit={handleRegister}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Nome Completo"
                        variant="outlined"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={registering}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <User size={20} color="#94a3b8" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        variant="outlined"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={registering}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Mail size={20} color="#94a3b8" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Senha"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={registering}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock size={20} color="#94a3b8" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        type="submit"
                        disabled={registering}
                        startIcon={registering ? <CircularProgress size={20} color="inherit" /> : <LogIn size={20} />}
                        sx={{ height: 56, borderRadius: '16px', mt: 2 }}
                      >
                        {registering ? 'Registrando...' : 'Aceitar Desafio e Criar Conta'}
                      </Button>
                    </Stack>
                  </form>

                  <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.05)' }}>
                    <Typography variant="body2" color="text.secondary">
                      Já tem uma conta?
                    </Typography>
                  </Divider>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Button variant="outlined" fullWidth onClick={() => navigate('/login')} sx={{ borderRadius: '16px', height: 48 }}>
                      Fazer Login
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default TaskInviteLanding;
