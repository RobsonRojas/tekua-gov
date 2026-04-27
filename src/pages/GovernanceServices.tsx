import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  Vote, 
  FileText, 
  ChevronRight,
  Home as HomeIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const GovernanceServices: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const services = [
    {
      title: t('voting.title'),
      description: t('voting.noTopics'),
      icon: <Vote size={32} />,
      color: '#6366f1',
      path: '/voting'
    },
    {
      title: t('work.title'),
      description: t('work.mural'),
      icon: <FileText size={32} />,
      color: '#6366f1',
      path: '/tasks-board'
    },
    {
      title: t('docs.docsTitle'),
      description: t('home.cardDocDesc'),
      icon: <FileText size={32} />,
      color: '#f59e0b',
      path: '/documents'
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Breadcrumbs 
          separator={<ChevronRight size={16} />} 
          sx={{ mb: 2, '& .MuiBreadcrumbs-ol': { alignItems: 'center' } }}
        >
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none', gap: 0.5 }}
          >
            <HomeIcon size={16} />
            {t('layout.dashboard')}
          </Link>
          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
            {t('home.cardGovTitle')}
          </Typography>
        </Breadcrumbs>
        
        <Typography variant="h1" color="primary.main" gutterBottom>
          {t('home.cardGovTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
          {t('home.cardGovDesc')}
        </Typography>
      </Box>

      {/* Grid */}
      <Grid container spacing={4}>
        {services.map((service, index) => (
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
                  borderColor: service.color,
                }
              }}
            >
              <Box 
                sx={{ 
                  color: service.color, 
                  backgroundColor: `${service.color}15`, 
                  width: 'fit-content', 
                  p: 2, 
                  borderRadius: '16px',
                  mb: 3
                }}
              >
                {service.icon}
              </Box>
              <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
                {service.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                {service.description}
              </Typography>
              <Button 
                endIcon={<ChevronRight size={18} />} 
                onClick={() => navigate(service.path)}
                sx={{ 
                  color: service.color, 
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

export default GovernanceServices;
