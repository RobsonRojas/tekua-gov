import React from 'react';
import { 
  Paper, 
  TextField, 
  MenuItem, 
  Stack, 
  InputAdornment,
  Typography
} from '@mui/material';
import { Search, Filter, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ActivityFilters as IFilters } from '../../hooks/useAdminActivity';
import type { ActivityActionType } from '../../pages/components/ActivityTab';

interface ActivityFiltersProps {
  filters: IFilters;
  onFilterChange: (newFilters: Partial<IFilters>) => void;
}

const ActivityFilters: React.FC<ActivityFiltersProps> = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();

  const actionTypes: (ActivityActionType | 'all')[] = ['all', 'auth', 'vote', 'task', 'document', 'profile_update'];

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: '16px', bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Filter size={18} /> {t('audit.filters')}
      </Typography>
      
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('audit.userSearch')}
          value={filters.userSearch || ''}
          onChange={(e) => onFilterChange({ userSearch: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          fullWidth
          size="small"
          label={t('docs.category')}
          value={filters.actionType}
          onChange={(e) => onFilterChange({ actionType: e.target.value as any })}
        >
          {actionTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type === 'all' ? t('common.all') : t(`activity.type.${type === 'profile_update' ? 'profile' : type}`)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          fullWidth
          size="small"
          label={t('common.startDate') || 'Início'}
          InputLabelProps={{ shrink: true }}
          value={filters.startDate || ''}
          onChange={(e) => onFilterChange({ startDate: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Calendar size={18} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          type="date"
          fullWidth
          size="small"
          label={t('common.endDate') || 'Fim'}
          InputLabelProps={{ shrink: true }}
          value={filters.endDate || ''}
          onChange={(e) => onFilterChange({ endDate: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Calendar size={18} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Paper>
  );
};

export default ActivityFilters;
