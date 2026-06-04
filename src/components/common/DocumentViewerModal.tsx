import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  IconButton, 
  Typography, 
  Box, 
  CircularProgress,
  Button
} from '@mui/material';
import { X as CloseIcon, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DocumentViewerModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string | null;
  filePath?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ 
  open, 
  onClose, 
  title, 
  url, 
  filePath 
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
    }
  }, [open, url]);

  // Intercept Ctrl+S / Cmd+S / Ctrl+P / Cmd+P
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's';
      const isPrint = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p';
      
      if (isSave || isPrint) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open]);

  if (!open) return null;

  const detectFileType = (): 'pdf' | 'image' | 'unknown' => {
    const pathToCheck = (filePath || url || '').toLowerCase();
    
    // Check extension
    if (pathToCheck.includes('.pdf') || pathToCheck.includes('mime=application/pdf')) {
      return 'pdf';
    }
    
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
    if (imageExtensions.some(ext => pathToCheck.includes(ext)) || pathToCheck.includes('mime=image/')) {
      return 'image';
    }
    
    return 'unknown';
  };

  const fileType = detectFileType();

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(t('docs.viewerLoadError', 'Erro ao carregar a imagem.'));
  };

  // Build secure URL for PDF by hiding toolbar and side pane
  const getSecurePdfUrl = (originalUrl: string): string => {
    // Check if URL already has hash parameters
    if (originalUrl.includes('#')) {
      return `${originalUrl}&toolbar=0&navpanes=0&scrollbar=1`;
    }
    return `${originalUrl}#toolbar=0&navpanes=0&scrollbar=1`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="document-viewer-dialog-title"
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          backgroundImage: 'none',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          userSelect: 'none',
          WebkitUserSelect: 'none'
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
        <Typography 
          id="document-viewer-dialog-title" 
          variant="h6" 
          fontWeight={600} 
          noWrap 
          sx={{ maxWidth: 'calc(100% - 48px)' }}
        >
          {title}
        </Typography>
        <IconButton 
          onClick={onClose} 
          aria-label="close"
          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          <CloseIcon size={20} />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 0, bgcolor: '#0f172a', position: 'relative', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {loading && (
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
          </Box>
        ) : !url ? (
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <AlertTriangle size={48} color="#f59e0b" />
            <Typography variant="body1" color="text.secondary" align="center">
              {t('docs.noUrl', 'URL do documento inválida.')}
            </Typography>
          </Box>
        ) : fileType === 'pdf' ? (
          <iframe
            src={getSecurePdfUrl(url)}
            title={title}
            width="100%"
            height="700px"
            style={{ border: 'none', display: loading ? 'none' : 'block' }}
            onLoad={handleIframeLoad}
          />
        ) : fileType === 'image' ? (
          <Box 
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            sx={{
              width: '100%',
              height: '700px',
              display: loading ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              p: 2,
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          >
            <img
              src={url}
              alt={title}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none'
              }}
            />
          </Box>
        ) : (
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, maxWidth: '500px' }}>
            <AlertTriangle size={48} color="#f59e0b" />
            <Typography variant="h6" align="center" fontWeight={600}>
              {t('docs.unsupportedFormat', 'Formato Não Suportado')}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              {t('docs.unsupportedFormatDesc', 'Por questões de segurança, este formato de arquivo não pode ser exibido diretamente para evitar downloads. Por favor, solicite a conversão para PDF ou imagem se necessário.')}
            </Typography>
            <Button variant="outlined" onClick={onClose} sx={{ mt: 2 }}>
              {t('common.back', 'Voltar')}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
