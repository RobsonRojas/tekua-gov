import React, { useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDocuments } from '../../hooks/useDocuments';
import DocumentUploadForm from './DocumentUploadForm';
import DocumentList from './DocumentList';

const DocumentManager: React.FC = () => {
  const { t } = useTranslation();
  const { 
    documents, 
    loading, 
    error, 
    uploadProgress, 
    fetchDocuments, 
    uploadDocument, 
    deleteDocument, 
    getDownloadUrl 
  } = useDocuments();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" color="primary.main" gutterBottom>
          {t('docs.managerTitle', 'Gerenciador de Documentos Oficiais')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('docs.managerDesc', 'Faça upload e gerencie os documentos oficiais da associação que estarão disponíveis para os membros.')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <DocumentUploadForm 
        onUpload={uploadDocument} 
        loading={loading} 
        progress={uploadProgress} 
      />

      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        {t('docs.listTitle', 'Documentos Cadastrados')}
      </Typography>
      
      <DocumentList 
        documents={documents} 
        onDelete={deleteDocument} 
        onView={getDownloadUrl} 
        loading={loading} 
      />
    </Box>
  );
};

export default DocumentManager;
