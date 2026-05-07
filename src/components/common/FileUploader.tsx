import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton,
  Paper,
  Stack
} from '@mui/material';
import { 
  Upload, 
  File, 
  FileText, 
  Image as ImageIcon, 
  X, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { uploadFile, getFileUrl } from '../../utils/storage';

export interface Attachment {
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

interface FileUploaderProps {
  onUploadComplete: (attachments: Attachment[]) => void;
  maxFiles?: number;
  bucket?: 'task-evidence' | 'official-docs';
  existingAttachments?: Attachment[];
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  attachment?: Attachment;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onUploadComplete, 
  maxFiles = 5,
  bucket = 'task-evidence',
  existingAttachments = []
}) => {
  const { t } = useTranslation();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>(existingAttachments);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const newUploadingFiles: UploadingFile[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    for (const uploadingFile of newUploadingFiles) {
      try {
        setUploadingFiles(prev => prev.map(f => 
          f.file === uploadingFile.file ? { ...f, status: 'uploading', progress: 10 } : f
        ));

        const fileName = `${Date.now()}_${uploadingFile.file.name.replace(/\s+/g, '_')}`;
        const path = await uploadFile(uploadingFile.file, {
          bucket,
          path: fileName
        });

        const url = await getFileUrl(bucket, path, true);

        const newAttachment: Attachment = {
          file_url: url,
          file_name: uploadingFile.file.name,
          file_type: uploadingFile.file.type,
          file_size: uploadingFile.file.size
        };

        setAttachments(prev => {
          const updated = [...prev, newAttachment];
          onUploadComplete(updated);
          return updated;
        });

        setUploadingFiles(prev => prev.map(f => 
          f.file === uploadingFile.file ? { ...f, status: 'completed', progress: 100, attachment: newAttachment } : f
        ));
      } catch (error: any) {
        console.error('Upload failed:', error);
        setUploadingFiles(prev => prev.map(f => 
          f.file === uploadingFile.file ? { ...f, status: 'error', error: error.message } : f
        ));
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onUploadComplete(updated);
      return updated;
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={20} />;
    if (type === 'application/pdf') return <FileText size={20} />;
    return <File size={20} />;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Box 
          sx={{ 
            border: '2px dashed rgba(255, 255, 255, 0.1)', 
            borderRadius: '16px', 
            p: 4, 
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)', borderColor: 'primary.main' }
          }}
          onClick={() => document.getElementById('file-upload-input')?.click()}
        >
          <input
            type="file"
            id="file-upload-input"
            hidden
            multiple
            onChange={handleFileChange}
            disabled={attachments.length >= maxFiles}
          />
          <Upload size={32} color="#6366f1" style={{ marginBottom: '8px' }} />
          <Typography variant="body1" fontWeight={600}>
            {attachments.length >= maxFiles 
              ? t('work.maxFilesReached', 'Limite de arquivos atingido') 
              : t('work.clickToUpload', 'Clique para anexar arquivos')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('work.uploadHint', 'Imagens, PDFs ou documentos até 10MB')}
          </Typography>
        </Box>

        {(attachments.length > 0 || uploadingFiles.length > 0) && (
          <Paper sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.01)' }}>
            <List dense>
              {attachments.map((att, i) => (
                <ListItem 
                  key={i}
                  secondaryAction={
                    <IconButton edge="end" size="small" onClick={() => removeAttachment(i)}>
                      <X size={16} />
                    </IconButton>
                  }
                >
                  <ListItemIcon sx={{ color: 'primary.main' }}>
                    {getFileIcon(att.file_type)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={att.file_name} 
                    secondary={`${(att.file_size / 1024 / 1024).toFixed(2)} MB`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  />
                  <CheckCircle size={16} color="#10b981" style={{ marginRight: '8px' }} />
                </ListItem>
              ))}

              {uploadingFiles.filter(f => f.status !== 'completed').map((f, i) => (
                <ListItem key={`uploading-${i}`}>
                  <ListItemIcon>
                    {f.status === 'error' ? <AlertCircle size={20} color="#ef4444" /> : <Upload size={20} />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={f.file.name} 
                    secondary={
                      <Box sx={{ width: '100%', mt: 0.5 }}>
                        <LinearProgress 
                          variant={f.status === 'error' ? 'determinate' : 'determinate'} 
                          value={f.progress} 
                          color={f.status === 'error' ? 'error' : 'primary'}
                        />
                        {f.status === 'error' && (
                          <Typography variant="caption" color="error">{f.error}</Typography>
                        )}
                      </Box>
                    }
                  />
                  {f.status !== 'error' && (
                    <IconButton size="small" disabled>
                      <X size={16} />
                    </IconButton>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};

export default FileUploader;
