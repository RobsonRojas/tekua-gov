import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Paper, 
  Avatar, 
  CircularProgress,
  Fade,
  Divider
} from '@mui/material';
import { Send, Bot, User, Scale } from 'lucide-react';
import { chatWithJRAgent, type Message } from '../../lib/gemini';
import ReactMarkdown from 'react-markdown';

const AgenteChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ 
      role: 'model', 
      content: 'Olá! Sou o facilitador da Justiça Restaurativa. Estou aqui para ajudar você com qualquer incômodo ou conflito. Como você está se sentindo?' 
    }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const stream = await chatWithJRAgent(newMessages);
      
      let assistantResponse = '';
      setMessages([...newMessages, { role: 'model', content: '' }]);

      for await (const event of stream) {
        if (event.type === 'text_chunk' || event.type === 'text_complete') {
          assistantResponse += event.content || '';
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'model', content: assistantResponse }
          ]);
        }
      }
    } catch (err: any) {
      console.error('JR Agent Error:', err);
      const errorMessage = err.message || 'Desculpe, ocorreu um erro.';
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'model', content: `❌ **Erro:** ${errorMessage}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        height: 'calc(100vh - 200px)'
      }}
    >
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
          <Scale size={24} />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>Facilitador de Justiça Restaurativa</Typography>
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
                <ReactMarkdown>{msg.content}</ReactMarkdown>
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Descreva o que aconteceu ou o que está sentindo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '100px',
                bgcolor: 'rgba(255, 255, 255, 0.02)'
              }
            }}
          />
          <IconButton 
            onClick={handleSend}
            disabled={!input.trim() || loading}
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
  );
};

export default AgenteChat;
