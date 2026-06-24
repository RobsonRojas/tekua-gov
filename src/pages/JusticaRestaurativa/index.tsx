
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const JusticaRestaurativa = () => {
  const navigate = useNavigate();
  return (
    <Container>
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Módulo de Justiça Restaurativa
        </Typography>
        <Typography variant="body1" paragraph>
          Escolha como deseja prosseguir para a resolução de conflitos.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button variant="contained" onClick={() => navigate('/justica-restaurativa/agente')}>
            Agente IA
          </Button>
          <Button variant="outlined" onClick={() => navigate('/justica-restaurativa/wizard')}>
            Wizard (Passo a Passo)
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default JusticaRestaurativa;
