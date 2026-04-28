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
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
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
        You are the Tekua AI Agent, an assistant for the Tekua Association. 
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
        content: t('ai.welcome') || 'Olá! Eu sou o Agente Tekua. Como posso ajudar você hoje?' 
      }]);
    } catch (err) {
      console.error('Error fetching AI context:', err);
      setDocsLoaded(true); // Still allow chat but maybe limited
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const stream = await chatWithGemini(newMessages, systemInstruction);
      
      let assistantResponse = '';
      const toolsUsed: string[] = [];
      
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
      console.error('Gemini Error:', err);
      const errorMessage = err.message || t('ai.error') || 'Sorry, I encountered an error processing your request.';
      
      setMessages(prev => [
        ...prev.slice(0, -1),
        { 
          role: 'model', 
          content: `❌ **Erro:** ${errorMessage}`,
          tools: []
        }
      ]);
    } finally {
      setLoading(false);
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
        <Typography color="primary.main" fontWeight={600}>{t('ai.title') || 'Agente IA'}</Typography>
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
            <Typography variant="subtitle1" fontWeight={700}>Tekuá AI</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Experimental Assistant</Typography>
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
                </Paper>
              </Box>
            </Fade>
          ))}
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
              onClick={handleSend}
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
