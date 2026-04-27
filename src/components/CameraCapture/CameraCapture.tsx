import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  IconButton,
  CircularProgress,
  Alert,
  Typography
} from '@mui/material';
import { 
  CameraAlt as CameraIcon, 
  Close as CloseIcon,
  FlipCameraIos as FlipCameraIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getWatermarkData, addWatermarkToImage } from '../../utils/imageWatermark';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  open: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, open }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      setError(null);
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError(t('camera.error') || 'Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [open, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;

    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failed');

      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Blob creation failed');

        try {
          const watermarkData = await getWatermarkData();
          const watermarkedBlob = await addWatermarkToImage(blob, watermarkData);
          
          const file = new File([watermarkedBlob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        } catch (watermarkErr) {
          console.error('Watermark error, sending original:', watermarkErr);
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        }
      }, 'image/jpeg', 0.9);
    } catch (err) {
      console.error('Capture error:', err);
      setError(t('camera.captureError') || 'Erro ao capturar imagem.');
      setLoading(false);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: 'hidden' }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CameraIcon color="primary" />
          <Typography variant="h6" component="span">
            {t('camera.title') || 'Capturar Evidência'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, overflow: 'hidden', bgcolor: 'black', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {error ? (
          <Box sx={{ p: 3, width: '100%' }}>
            <Alert severity="error" variant="filled">{error}</Alert>
          </Box>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '70vh' }}
          />
        )}
        {loading && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1 }}>
            <CircularProgress color="primary" />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between', px: 3 }}>
        <Button 
          variant="outlined" 
          onClick={toggleCamera}
          startIcon={<FlipCameraIcon />}
          disabled={loading || !!error}
        >
          {t('camera.flip') || 'Inverter'}
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCapture}
          startIcon={loading ? null : <CameraIcon />}
          disabled={loading || !!error}
          size="large"
          sx={{ borderRadius: 8, px: 4, minWidth: 150 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : (t('camera.capture') || 'Capturar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CameraCapture;
