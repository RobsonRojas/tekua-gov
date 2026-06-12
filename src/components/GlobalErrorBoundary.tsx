
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { RefreshCcw, Home } from 'lucide-react';

export default function GlobalErrorBoundary() {
  const error = useRouteError();
  console.error('Caught by GlobalErrorBoundary:', error);

  let errorMessage = 'Um erro inesperado ocorreu.';
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" color="error" gutterBottom sx={{ fontWeight: 'bold' }}>
          Ops, algo deu errado!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Nossa aplicação encontrou um problema inesperado ao renderizar esta página.
        </Typography>

        <Box sx={{ my: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'left', overflowX: 'auto' }}>
          <Typography variant="body2" color="error" sx={{ fontFamily: 'monospace' }}>
            {errorMessage}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshCcw size={20} />}
            onClick={handleReload}
          >
            Recarregar Página
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Home size={20} />}
            onClick={handleGoHome}
          >
            Ir para o Início
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
