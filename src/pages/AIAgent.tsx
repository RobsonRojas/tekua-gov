import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  IconButton, 
  Paper, 
  Avatar, 
  CircularProgress,
  Alert,
  Fade,
  Divider,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { 
  Send, 
  Bot, 
  User, 
  Info,
  ChevronRight,
  Home as HomeIcon,
  Sparkles,
  StopCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { supabase } from '../lib/supabase';
import { chatWithGemini } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  content: string;
  tools?: string[];
}

const AIAgent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'pt' ? 'pt' : 'en';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState('');
  const [docsLoaded, setDocsLoaded] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<number, number>>({});
  
  const suggestedPrompts = [
    t('ai.suggest.whatIsTekua') || 'O que é a Associação Tekuá?',
    t('ai.suggest.howToEarn') || 'Como posso ganhar Surreais ($S)?',
    t('ai.suggest.votingRules') || 'Quais as regras para votações?',
  ];
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContext();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const fetchContext = async () => {
    try {
      const { data, error } = await apiClient.invoke('api-documents', 'getAIContext');
      
      if (error) throw new Error(error);

      const contextText = data.map((doc: any) => {
        const title = doc.title[lang] || doc.title.pt || doc.title.en;
        const desc = doc.description?.[lang] || doc.description?.pt || doc.description?.en || '';
        return `[Category: ${doc.category}] Title: ${title}. Description: ${desc}`;
      }).join('\n');

      const instruction = `
        You are the Tekua Oracle, an AI assistant for the Tekua Association. 
        Your role is to help members with questions about governance, documents, rules, and the digital currency (Surreal).
        Be helpful, professional, and friendly.
        If a question is outside the scope of Tekua, politely inform that you only answer questions related to the association.
        Always base your answers on the provided context of official documents.
        
        CONTEXT OF OFFICIAL DOCUMENTS:
        ${contextText}
        
        RULES:
        - Digital Currency: Surreal ($S).
        - Validations: Tasks and contributions need community or requester approval.
        - Governance: Decisions are made via voting.
      `;
      
      setSystemInstruction(instruction);
      setDocsLoaded(true);
      
      // Welcome message
      setMessages([{ 
        role: 'model', 
        content: t('ai.welcome') || 'Olá! Eu sou o Oráculo. Como posso ajudar você hoje?' 
      }]);
    } catch (err) {
      console.error('Error fetching AI context:', err);
      setDocsLoaded(true); // Still allow chat but maybe limited
    }
  };

  const handleSend = async (customInput?: string) => {
    const userMessage = customInput ?? input.trim();
    if (!userMessage || loading) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    let assistantResponse = '';
    const toolsUsed: string[] = [];

    try {
      const stream = await chatWithGemini(newMessages, systemInstruction, controller.signal);
      
      setMessages([...newMessages, { role: 'model', content: '', tools: [] }]);

      for await (const event of stream) {
        if (event.type === 'tool') {
          toolsUsed.push(event.name);
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'model', content: assistantResponse, tools: [...toolsUsed] }
          ]);
        } else if (event.type === 'text') {
          assistantResponse = event.content;
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'model', content: assistantResponse, tools: [...toolsUsed] }
          ]);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { 
            role: 'model', 
            content: assistantResponse + '\n\n*(Geração interrompida pelo usuário)*',
            tools: [...toolsUsed]
          }
        ]);
        setLoading(false);
        setAbortController(null);
        return;
      }
      console.error('Gemini Error:', err);
      
      let finalContent = '';
      if (err.message === 'auth.sessionExpired') {
        finalContent = `❌ **Sessão expirada / Session expired**\n\nPor favor, [faça login novamente](/login) para continuar usando o Oráculo.\n\nPlease [log in again](/login) to continue using the Oracle.`;
      } else {
        const errorMessage = err.message || t('ai.error') || 'Sorry, I encountered an error processing your request.';
        finalContent = `❌ **Erro:** ${errorMessage}`;
      }
      
      setMessages(prev => [
        ...prev.slice(0, -1),
        { 
          role: 'model', 
          content: finalContent,
          tools: []
        }
      ]);
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const handleFeedback = async (msgIndex: number, rating: number, prompt: string, response: string) => {
    setFeedbacks(prev => ({ ...prev, [msgIndex]: rating }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('ai_chat_feedback').insert({
        user_id: user.id,
        rating,
        prompt,
        response
      });
    } catch (err) {
      console.error('Failed to save feedback:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Breadcrumbs 
        separator={<ChevronRight size={16} />} 
        sx={{ mb: 3, '& .MuiBreadcrumbs-ol': { alignItems: 'center' } }}
      >
        <MuiLink component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none', gap: 0.5 }}>
          <HomeIcon size={16} />
          {t('layout.dashboard')}
        </MuiLink>
        <Typography color="primary.main" fontWeight={600}>{t('ai.title') || 'Oráculo'}</Typography>
      </Breadcrumbs>

      <Paper 
        elevation={0} 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <Bot size={24} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Oráculo</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Experimental Oracle</Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Sparkles size={20} />
          </Box>
        </Box>

        <Box 
          ref={scrollRef}
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 100%)'
          }}
        >
          {messages.map((msg, index) => (
            <Fade in key={index}>
              <Box 
                sx={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  display: 'flex',
                  gap: 1.5,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: msg.role === 'user' ? 'secondary.main' : 'primary.main',
                    mt: 1
                  }}
                >
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </Avatar>
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: msg.role === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                    bgcolor: msg.role === 'user' ? 'secondary.main' : 'rgba(255, 255, 255, 0.03)',
                    color: msg.role === 'user' ? 'white' : 'text.primary',
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                    '& p': { m: 0 }
                  }}
                >
                  {msg.role === 'model' && msg.content === '' && msg.tools && msg.tools.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('ai.thinking') || 'Consultando plataforma...'} ({msg.tools[msg.tools.length-1]})
                      </Typography>
                    </Box>
                  )}
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {msg.tools && msg.tools.length > 0 && msg.content !== '' && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {msg.tools.map((tool, i) => (
                        <Typography key={i} variant="caption" sx={{ color: 'primary.light', bgcolor: 'rgba(99, 102, 241, 0.1)', px: 1, py: 0.2, borderRadius: '4px' }}>
                          🔧 {tool}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  {msg.role === 'model' && msg.content !== '' && !loading && (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                           const promptMsg = messages[index-1]?.content || '';
                           handleFeedback(index, 1, promptMsg, msg.content);
                        }}
                        color={feedbacks[index] === 1 ? 'primary' : 'default'}
                      >
                        <ThumbsUp size={14} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                           const promptMsg = messages[index-1]?.content || '';
                           handleFeedback(index, -1, promptMsg, msg.content);
                        }}
                        color={feedbacks[index] === -1 ? 'error' : 'default'}
                      >
                        <ThumbsDown size={14} />
                      </IconButton>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Fade>
          ))}
          
          {messages.length === 1 && !loading && (
            <Fade in>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {suggestedPrompts.map((prompt, idx) => (
                  <Paper
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: '100px',
                      cursor: 'pointer',
                      bgcolor: 'rgba(99, 102, 241, 0.05)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="body2" color="primary.main">{prompt}</Typography>
                  </Paper>
                ))}
              </Box>
            </Fade>
          )}

          {loading && messages[messages.length-1]?.role !== 'model' && (
            <Box sx={{ alignSelf: 'flex-start', display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <Bot size={18} />
              </Avatar>
              <CircularProgress size={20} />
            </Box>
          )}
        </Box>

        <Divider sx={{ opacity: 0.1 }} />

        <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.01)' }}>
          <Alert 
            icon={<Info size={18} />} 
            severity="info" 
            sx={{ mb: 2, borderRadius: '12px', fontSize: '0.75rem', py: 0 }}
          >
            {t('ai.disclaimer')}
          </Alert>
          
          {loading && abortController && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <IconButton 
                onClick={stopGeneration}
                sx={{ 
                  bgcolor: 'rgba(239, 68, 68, 0.1)', 
                  color: 'error.main', 
                  borderRadius: '100px',
                  px: 2,
                  py: 1,
                  gap: 1,
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                }}
              >
                <StopCircle size={18} />
                <Typography variant="body2">Parar Geração</Typography>
              </IconButton>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder={t('ai.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={!docsLoaded || loading}
              variant="outlined"
              size="small"
              inputProps={{ 'data-testid': 'ai-chat-input' }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '100px',
                  bgcolor: 'rgba(255, 255, 255, 0.02)'
                }
              }}
            />
            <IconButton 
              color="primary" 
              onClick={() => handleSend()}
              disabled={!input.trim() || !docsLoaded || loading}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }
              }}
            >
              <Send size={20} />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AIAgent;
