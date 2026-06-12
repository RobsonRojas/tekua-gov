import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { Camera, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onCancel: () => void;
}

export default function QRScanner({ onScan, onCancel }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    let mounted = true;
    codeReaderRef.current = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        const videoInputDevices = await codeReaderRef.current!.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          if (mounted) setError('Nenhuma câmera encontrada no dispositivo.');
          setLoading(false);
          return;
        }

        // Prefer rear camera
        const selectedDeviceId = videoInputDevices.find((device) => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('traseira'))?.deviceId 
          || videoInputDevices[0].deviceId;

        if (videoRef.current && mounted) {
          codeReaderRef.current!.decodeFromVideoDevice(
            selectedDeviceId,
            videoRef.current,
            (result, err) => {
              if (result) {
                onScan(result.getText());
              }
              if (err && !(err instanceof NotFoundException)) {
                console.error(err);
              }
            }
          );
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setLoading(false);
          if (err.name === 'NotAllowedError') {
            setError('Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.');
          } else {
            setError('Erro ao iniciar a câmera: ' + err.message);
          }
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [onScan]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {error ? (
        <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'error.light', borderRadius: 2, color: 'error.contrastText' }}>
          <AlertCircle size={48} style={{ margin: '0 auto', marginBottom: 16 }} />
          <Typography variant="body1" gutterBottom>{error}</Typography>
          <Button variant="contained" color="inherit" onClick={onCancel} sx={{ mt: 2, color: 'error.main' }}>
            Fechar
          </Button>
        </Box>
      ) : (
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, borderRadius: 2, overflow: 'hidden', bgcolor: 'black' }}>
          {loading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress color="primary" />
            </Box>
          )}
          <video 
            ref={videoRef} 
            style={{ width: '100%', height: 'auto', display: loading ? 'none' : 'block' }}
          />
          <Box sx={{ 
            position: 'absolute', 
            inset: 0, 
            pointerEvents: 'none',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Box sx={{ width: '70%', height: '70%', border: '2px solid #6366f1', borderRadius: 4 }} />
          </Box>
        </Box>
      )}
      {!error && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Camera size={16} /> Aponte a câmera para o QR Code do usuário
        </Typography>
      )}
    </Box>
  );
}
