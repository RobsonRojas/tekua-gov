import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  IconButton, 
  Typography, 
  Box, 
  CircularProgress,
  Button
} from '@mui/material';
import { X as CloseIcon, AlertTriangle, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EvidenceViewerModalProps {
  open: boolean;
  onClose: () => void;
  evidenceUrl: string | null;
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({ 
  open, 
  onClose, 
  evidenceUrl 
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const detectFileType = (url: string | null): 'image' | 'pdf' | 'unknown' => {
    if (!url) return 'unknown';
    const lowerUrl = url.toLowerCase();
    
    // Check if it's an image
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
      return 'image';
    }
    
    // Check if it's a pdf
    if (lowerUrl.includes('.pdf')) {
      return 'pdf';
    }

    return 'unknown';
  };

  const fileType = detectFileType(evidenceUrl);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(t('work.evidenceLoadError', 'Erro ao carregar a evidência.'));
  };

  const handleOpenExternal = () => {
    if (evidenceUrl) {
      window.open(evidenceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'c')) {
        e.preventDefault();
      }
    };
    
    const handleGlobalContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    if (open) {
      window.addEventListener('keydown', handleGlobalKeyDown);
      window.addEventListener('contextmenu', handleGlobalContextMenu);
    }
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
    };
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          backgroundImage: 'none',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        px: 3, 
        py: 2, 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <Typography variant="h6" fontWeight={600}>
          {t('work.evidence', 'Evidência de Trabalho')}
        </Typography>
        <IconButton 
          onClick={onClose} 
          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          <CloseIcon size={20} />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent 
        sx={{ 
          p: 0, 
          bgcolor: '#0f172a', 
          position: 'relative', 
          minHeight: '400px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        {loading && evidenceUrl && fileType !== 'unknown' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'absolute' }}>
            <CircularProgress color="primary" />
            <Typography variant="body2" color="text.secondary">
              {t('common.loading', 'Carregando...')}
            </Typography>
          </Box>
        )}

        {error ? (
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <AlertTriangle size={48} color="#ef4444" />
            <Typography variant="body1" color="error.main" align="center">
              {error}
            </Typography>
            <Button variant="outlined" startIcon={<ExternalLink size={18} />} onClick={handleOpenExternal}>
              {t('common.openInNewTab', 'Abrir em Nova Aba')}
            </Button>
          </Box>
        ) : !evidenceUrl ? (
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <AlertTriangle size={48} color="#f59e0b" />
            <Typography variant="body1" color="text.secondary" align="center">
              URL inválida.
            </Typography>
          </Box>
        ) : fileType === 'image' ? (
          <Box sx={{ width: '100%', height: '700px', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, overflow: 'auto' }}>
            <img
              src={evidenceUrl}
              alt="Evidência"
              onLoad={handleLoad}
              onError={handleError}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: loading ? 'none' : 'block',
                pointerEvents: 'none' // Evita arrastar a imagem
              }}
            />
          </Box>
        ) : fileType === 'pdf' ? (
          <iframe
            src={`${evidenceUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            width="100%"
            height="700px"
            style={{ border: 'none', display: loading ? 'none' : 'block' }}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, maxWidth: '500px' }}>
            <AlertTriangle size={48} color="#3b82f6" />
            <Typography variant="h6" align="center" fontWeight={600}>
              Formato não suportado para visualização no modal
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Esta evidência não é uma imagem ou PDF. Por favor, abra em uma nova aba para acessá-la.
            </Typography>
            <Button variant="contained" startIcon={<ExternalLink size={18} />} onClick={handleOpenExternal} sx={{ mt: 2 }}>
              {t('common.openInNewTab', 'Abrir em Nova Aba')}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
