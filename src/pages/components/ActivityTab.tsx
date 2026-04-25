import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import { Calendar, LogIn, FileText, CheckSquare, Edit2, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';
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
    if (user) {
      fetchLogs();
    } else {
      setLoading(false);
    }
  }, [user, filter]);

  const fetchLogs = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await apiClient.invoke<any[]>('api-audit', 'fetchLogs', {
        limit: 50,
        filter
      });
        
      if (error) throw new Error(error);

      setLogs((data || []).map((log: any) => ({
        id: log.id,
        user_id: log.actor_id,
        action_type: log.action,
        description: log.description,
        created_at: log.created_at
      })));
    } catch (err: any) {
      console.error('Error fetching activity logs:', err);
      setError(err.message || 'Erro ao carregar o histórico de atividades. Tente atualizar a página.');
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

      {error ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box 
              sx={{ 
                p: 3, 
                borderRadius: '50%', 
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                color: 'error.main'
              }}
            >
              <Activity size={48} />
            </Box>
          </Box>
          <Typography variant="h6" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => fetchLogs()}
            startIcon={<Activity size={18} />}
            sx={{ mt: 2 }}
          >
            {t('admin.refresh') || 'Tentar Novamente'}
          </Button>
        </Box>
      ) : loading ? (
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
            const description = log.description || {};
            const text = description[currentLang] || description['pt'] || description['en'] || 'Activity';
            
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
