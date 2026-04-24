import React from 'react';
import { Typography, Grid, Paper, Box, Button } from '@mui/material';
import { 
  Users, 
  FileText, 
  ChevronRight,
  LayoutPanelLeft as MuralIcon,
  PlusCircle as RegisterIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import WalletCard from '../components/WalletCard';
import PushNotificationBanner from '../components/PushNotificationBanner';

import { useAuth } from '../context/useAuth';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const homeCards = [
    { 
      title: t('home.cardMembrosTitle'), 
      description: t('home.cardMembrosDesc'), 
      icon: <Users size={32} />, 
      color: '#6366f1',
      path: '/admin/members',
      disabled: !isAdmin
    },
    { 
      title: t('work.mural'), 
      description: t('home.cardGovDesc'), 
      icon: <MuralIcon size={32} />, 
      color: '#10b981',
      path: '/work-wall'
    },
    { 
      title: t('work.register'), 
      description: t('work.description'), 
      icon: <RegisterIcon size={32} />, 
      color: '#a855f7',
      path: '/register-work'
    },
    { 
      title: t('home.cardDocTitle'), 
      description: t('home.cardDocDesc'), 
      icon: <FileText size={32} />, 
      color: '#f59e0b',
      path: '#'
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

      <PushNotificationBanner />

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12 }}>
          <WalletCard />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {homeCards.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
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
                onClick={() => navigate(card.path)}
                disabled={card.disabled}
                sx={{ 
                  color: card.disabled ? 'text.disabled' : card.color, 
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
