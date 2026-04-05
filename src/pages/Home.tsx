import React from 'react';
import { Typography, Grid, Paper, Box, Button } from '@mui/material';
import { 
  Users, 
  ShieldCheck, 
  FileText, 
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const { t } = useTranslation();

  const homeCards = [
    { 
      title: t('home.cardMembrosTitle'), 
      description: t('home.cardMembrosDesc'), 
      icon: <Users size={32} />, 
      color: '#6366f1' 
    },
    { 
      title: t('home.cardGovTitle'), 
      description: t('home.cardGovDesc'), 
      icon: <ShieldCheck size={32} />, 
      color: '#10b981' 
    },
    { 
      title: t('home.cardDocTitle'), 
      description: t('home.cardDocDesc'), 
      icon: <FileText size={32} />, 
      color: '#f59e0b' 
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h1" gutterBottom align="center" color="primary.main">
          {t('home.title')}
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', mb: 8 }}>
          {t('home.subtitle')}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {homeCards.map((card, index) => (
          <Grid key={index} size={{ xs: 12, md: 4 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                height: '100%', 
                backgroundColor: 'background.paper',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'transform 0.2s ease-in-out, border-color 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  borderColor: card.color,
                }
              }}
            >
              <Box 
                sx={{ 
                  color: card.color, 
                  backgroundColor: `${card.color}15`, 
                  width: 'fit-content', 
                  p: 2, 
                  borderRadius: '16px',
                  mb: 3
                }}
              >
                {card.icon}
              </Box>
              <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
                {card.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                {card.description}
              </Typography>
              <Button 
                endIcon={<ChevronRight size={18} />} 
                sx={{ 
                  color: card.color, 
                  fontWeight: 600,
                  p: 0,
                  '&:hover': { background: 'transparent', opacity: 0.8 } 
                }}
              >
                {t('home.access')}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
