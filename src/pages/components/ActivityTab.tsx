import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Calendar, LogIn, FileText, CheckSquare, Edit2, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/useAuth';

export type ActivityActionType = 'auth' | 'vote' | 'task' | 'document' | 'profile_update';

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: ActivityActionType;
  description: Record<string, string>;
  created_at: string;
}

const ActivityTab: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, [user, filter]);

  const fetchLogs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (filter !== 'all') {
        query = query.eq('action_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data as ActivityLog[]);
    } catch (err: any) {
      console.error('Error fetching activity logs:', err);
      setError(err.message || 'Error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: ActivityActionType) => {
    switch (type) {
      case 'auth': return <LogIn size={20} />;
      case 'vote': return <FileText size={20} />;
      case 'task': return <CheckSquare size={20} />;
      case 'document': return <FileText size={20} />;
      case 'profile_update': return <Edit2 size={20} />;
      default: return <Activity size={20} />;
    }
  };

  const getColorForType = (type: ActivityActionType) => {
    switch (type) {
      case 'auth': return '#3b82f6'; // blue
      case 'vote': return '#8b5cf6'; // purple
      case 'task': return '#10b981'; // green
      case 'profile_update': return '#f59e0b'; // amber
      default: return '#64748b'; // slate
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          {t('profile.activity')}
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="filter-label">{t('common.filter') || 'Filtrar'}</InputLabel>
          <Select
            labelId="filter-label"
            value={filter}
            label={t('common.filter') || 'Filtrar'}
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">{t('common.all') || 'Todos'}</MenuItem>
            <MenuItem value="auth">{t('activity.type.auth') || 'Autenticação'}</MenuItem>
            <MenuItem value="vote">{t('activity.type.vote') || 'Votações'}</MenuItem>
            <MenuItem value="task">{t('activity.type.task') || 'Tarefas'}</MenuItem>
            <MenuItem value="profile_update">{t('activity.type.profile') || 'Perfil'}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : logs.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box 
              sx={{ 
                p: 3, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                color: 'text.secondary'
              }}
            >
              <Calendar size={48} />
            </Box>
          </Box>
          <Typography variant="h6" gutterBottom>
            {t('activity.noActivity') || 'Nenhuma atividade registrada.'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ position: 'relative', ml: 2, borderLeft: '2px solid', borderColor: 'divider', pl: 4, py: 1 }}>
          {logs.map((log) => {
            const currentLang = i18n.language || 'pt';
            const text = log.description[currentLang] || log.description['pt'] || log.description['en'] || 'Activity';
            
            return (
              <Box key={log.id} sx={{ position: 'relative', mb: 4, '&:last-child': { mb: 0 } }}>
                {/* Dot */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    left: -49, // 32px padding + 2px border / 2 + size 
                    top: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: getColorForType(log.action_type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 0 0 4px #0f172a' // match background to cut out the line
                  }}
                >
                  {getIconForType(log.action_type)}
                </Box>
                
                {/* Content */}
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {text}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(log.created_at).toLocaleString(currentLang)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default ActivityTab;
