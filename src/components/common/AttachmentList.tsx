import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Typography, 
  Box,
  Paper,
  Tooltip,
  Stack
} from '@mui/material';
import { 
  Download, 
  File, 
  FileText, 
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Attachment } from './FileUploader';

interface AttachmentListProps {
  attachments: Attachment[];
  title?: string;
}

const AttachmentList: React.FC<AttachmentListProps> = ({ attachments, title }) => {
  const { t } = useTranslation();

  if (!attachments || attachments.length === 0) return null;

  const getFileIcon = (type: string) => {
    if (type?.startsWith('image/')) return <ImageIcon size={20} />;
    if (type === 'application/pdf') return <FileText size={20} />;
    return <File size={20} />;
  };

  const handleDownload = (url: string) => {
    // Open in new tab is usually safer for various file types
    window.open(url, '_blank');
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {title && (
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, ml: 1 }}>
          {title}
        </Typography>
      )}
      <Paper elevation={0} sx={{ borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <List dense>
          {attachments.map((att, index) => (
            <ListItem 
              key={index}
              divider={index < attachments.length - 1}
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <Tooltip title={t('common.download', 'Download')}>
                    <IconButton edge="end" size="small" onClick={() => handleDownload(att.file_url)}>
                      <Download size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.open', 'Abrir')}>
                    <IconButton edge="end" size="small" component="a" href={att.file_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={18} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {getFileIcon(att.file_type)}
              </ListItemIcon>
              <ListItemText 
                primary={att.file_name} 
                secondary={att.file_size ? `${(att.file_size / 1024 / 1024).toFixed(2)} MB` : ''}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default AttachmentList;
