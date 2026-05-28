import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Divider,
  ListItemButton
} from '@mui/material';
import { Megaphone, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import NoticeDetailModal from './NoticeDetailModal';

export interface Announcement {
  id: string;
  title: { pt: string; en: string };
  content: { pt: string; en: string };
  created_at: string;
  author_id: string;
  author?: { full_name: string };
}

const NoticeWall: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Announcement | null>(null);
  
  const lang = i18n.language as 'pt' | 'en';

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          author:profiles!author_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      // Postgrest returns author as an array if it's a join sometimes, but it's a to-one relationship here.
      // We map to ensure author is properly typed.
      const formatted = (data || []).map(item => ({
        ...item,
        author: Array.isArray(item.author) ? item.author[0] : item.author
      }));

      setNotices(formatted as Announcement[]);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevation={0} sx={{ 
      borderRadius: '24px', 
      border: '1px solid rgba(255, 255, 255, 0.05)',
      bgcolor: 'background.paper',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5
      }}>
        <Megaphone size={24} color="#3b82f6" />
        <Typography variant="h6" fontWeight="bold">
          {t('dashboard.noticeWall', 'Mural de Avisos')}
        </Typography>
      </Box>

      <CardContent sx={{ p: 0, flexGrow: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notices.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {t('dashboard.noNotices', 'Nenhum aviso no momento.')}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notices.map((notice, index) => (
              <React.Fragment key={notice.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => setSelectedNotice(notice)}
                    sx={{ 
                      py: 2, 
                      px: 3,
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }
                    }}
                  >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 0.5 }}>
                        {notice.title[lang] || notice.title.pt}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notice.created_at).toLocaleDateString(lang, { 
                          day: '2-digit', month: 'short' 
                        })}
                      </Typography>
                    }
                  />
                  <ListItemIcon sx={{ minWidth: 'auto' }}>
                    <ChevronRight size={18} color="#94a3b8" />
                  </ListItemIcon>
                  </ListItemButton>
                </ListItem>
                {index < notices.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>

      <NoticeDetailModal 
        open={!!selectedNotice} 
        onClose={() => setSelectedNotice(null)} 
        notice={selectedNotice} 
      />
    </Card>
  );
};

export default NoticeWall;
