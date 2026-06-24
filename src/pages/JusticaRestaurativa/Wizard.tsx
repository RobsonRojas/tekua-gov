import { Typography, Container, Breadcrumbs, Link as MuiLink } from '@mui/material';
import WizardFlow from '../../components/JusticaRestaurativa/WizardFlow';
import { ChevronRight, Home as HomeIcon, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wizard = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs 
        separator={<ChevronRight size={16} />} 
        sx={{ mb: 4, '& .MuiBreadcrumbs-ol': { alignItems: 'center' } }}
      >
        <MuiLink component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none', gap: 0.5 }}>
          <HomeIcon size={16} />
          Dashboard
        </MuiLink>
        <MuiLink component={Link} to="/justica-restaurativa" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none', gap: 0.5 }}>
          <Scale size={16} />
          Justiça Restaurativa
        </MuiLink>
        <Typography color="primary.main" fontWeight={600}>Wizard Guiado</Typography>
      </Breadcrumbs>
      
      <WizardFlow />
    </Container>
  );
};

export default Wizard;
