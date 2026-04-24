import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  MenuItem, 
  Typography, 
  Paper, 
  LinearProgress,
  Stack
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Upload as UploadIcon } from 'lucide-react';
import type { DocumentMetadata } from '../../hooks/useDocuments';

interface DocumentUploadFormProps {
  onUpload: (file: File, metadata: DocumentMetadata) => Promise<boolean>;
  loading: boolean;
  progress: number;
}

const CATEGORIES = ['estatuto', 'atas', 'relatorios', 'financeiro', 'outros'];

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ onUpload, loading, progress }) => {
  const { t } = useTranslation();
  
  const [file, setFile] = useState<File | null>(null);
  const [titlePt, setTitlePt] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descPt, setDescPt] = useState('');
  const [descEn, setDescEn] = useState('');
  const [category, setCategory] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !titlePt || !titleEn || !category) return;

    const metadata: DocumentMetadata = {
      title: { pt: titlePt, en: titleEn },
      description: { pt: descPt, en: descEn },
      category
    };

    const success = await onUpload(file, metadata);
    if (success) {
      setFile(null);
      setTitlePt('');
      setTitleEn('');
      setDescPt('');
      setDescEn('');
      setCategory('');
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        {t('docs.uploadNew', 'Enviar Novo Documento')}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              required
              fullWidth
              label={t('docs.titlePt', 'Título (PT)')}
              value={titlePt}
              onChange={(e) => setTitlePt(e.target.value)}
              disabled={loading}
            />
            <TextField
              required
              fullWidth
              label={t('docs.titleEn', 'Título (EN)')}
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              disabled={loading}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label={t('docs.descPt', 'Descrição (PT)')}
              value={descPt}
              onChange={(e) => setDescPt(e.target.value)}
              disabled={loading}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label={t('docs.descEn', 'Descrição (EN)')}
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              disabled={loading}
            />
          </Stack>

          <TextField
            select
            required
            fullWidth
            label={t('docs.category', 'Categoria')}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {t(`docs.categories.${cat}`, cat)}
              </MenuItem>
            ))}
          </TextField>

          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon size={20} />}
              disabled={loading}
              fullWidth
            >
              {file ? file.name : t('docs.selectFile', 'Selecionar Arquivo (PDF, DOCX)')}
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          {loading && progress > 0 && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                {progress}%
              </Typography>
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!file || !titlePt || !titleEn || !category || loading}
          >
            {loading ? t('common.loading', 'Carregando...') : t('docs.upload', 'Enviar Documento')}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default DocumentUploadForm;
