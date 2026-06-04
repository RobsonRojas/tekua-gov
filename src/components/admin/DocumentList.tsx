import React, { useState } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Trash2 as DeleteIcon, Eye as ViewIcon } from 'lucide-react';
import type { Document } from '../../hooks/useDocuments';
import { DocumentViewerModal } from '../common/DocumentViewerModal';

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string, filePath: string) => Promise<boolean>;
  onView: (filePath: string) => Promise<string | null>;
  loading: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete, onView, loading }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'pt' | 'en';
  
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; doc: Document | null }>({
    open: false,
    doc: null
  });

  const [viewerState, setViewerState] = useState<{
    open: boolean;
    title: string;
    url: string | null;
    filePath?: string;
  }>({ open: false, title: '', url: null });

  const handleView = async (doc: Document) => {
    const docTitle = doc.title[currentLang] || doc.title.pt;
    if (doc.external_url) {
      // External links (e.g. Google Drive public view) are opened in viewer
      setViewerState({ open: true, title: docTitle, url: doc.external_url });
      return;
    }
    if (doc.file_path) {
      const url = await onView(doc.file_path);
      setViewerState({ open: true, title: docTitle, url, filePath: doc.file_path });
    }
  };

  const handleViewerClose = () => {
    setViewerState({ open: false, title: '', url: null });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.doc) {
      await onDelete(deleteDialog.doc.id, deleteDialog.doc.file_path);
      setDeleteDialog({ open: false, doc: null });
    }
  };

  if (documents.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography color="text.secondary">
          {t('docs.noDocuments', 'Nenhum documento encontrado.')}
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          backgroundColor: 'background.paper', 
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('docs.title', 'Título')}</TableCell>
              <TableCell>{t('docs.category', 'Categoria')}</TableCell>
              <TableCell>{t('docs.date', 'Data')}</TableCell>
              <TableCell align="right">{t('docs.actions', 'Ações')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {doc.title[currentLang] || doc.title.pt}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 300 }}>
                    {doc.description?.[currentLang] || doc.description?.pt || ''}
                  </Typography>
                </TableCell>
                <TableCell>
                  {t(`docs.categories.${doc.category}`, doc.category)}
                </TableCell>
                <TableCell>
                  {new Date(doc.created_at).toLocaleDateString(currentLang)}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={t('common.view', 'Visualizar')}>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleView(doc)}
                      disabled={loading}
                    >
                      <ViewIcon size={20} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.delete', 'Excluir')}>
                    <IconButton 
                      color="error" 
                      onClick={() => setDeleteDialog({ open: true, doc })}
                      disabled={loading}
                    >
                      <DeleteIcon size={20} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, doc: null })}>
        <DialogTitle>{t('docs.deleteConfirmTitle', 'Excluir Documento?')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('docs.deleteConfirmText', 'Tem certeza que deseja excluir o documento:')} 
            {' '}
            <strong>{deleteDialog.doc?.title[currentLang] || deleteDialog.doc?.title.pt}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, doc: null })} color="inherit">
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('common.confirm', 'Confirmar')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Secure Document Viewer */}
      <DocumentViewerModal
        open={viewerState.open}
        onClose={handleViewerClose}
        title={viewerState.title}
        url={viewerState.url}
        filePath={viewerState.filePath}
      />
    </>
  );
};

export default DocumentList;
