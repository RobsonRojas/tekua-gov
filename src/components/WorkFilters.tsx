import React, { useState, useEffect } from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  Button,
  Collapse
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { 
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

export interface WorkFilterValues {
  requesterId?: string;
  workerId?: string;
  type?: string;
}

interface WorkFiltersProps {
  onFilterChange: (filters: WorkFilterValues) => void;
}

const WorkFilters: React.FC<WorkFiltersProps> = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [filters, setFilters] = useState<WorkFilterValues>({
    requesterId: '',
    workerId: '',
    type: 'all'
  });

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name').order('full_name');
      if (!error && data) {
        setMembers(data);
      }
    };
    fetchMembers();
  }, []);

  const handleChange = (field: keyof WorkFilterValues, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const reset = { requesterId: '', workerId: '', type: 'all' };
    setFilters(reset);
    onFilterChange(reset);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Button 
          startIcon={<FilterIcon />} 
          onClick={() => setExpanded(!expanded)}
          size="small"
        >
          {expanded ? t('common.hideFilters') || 'Ocultar Filtros' : t('common.showFilters') || 'Mostrar Filtros'}
        </Button>
        {(filters.requesterId || filters.workerId || (filters.type && filters.type !== 'all')) && (
          <Button 
            startIcon={<ClearIcon />} 
            onClick={clearFilters}
            size="small"
            color="error"
          >
            {t('common.clear') || 'Limpar'}
          </Button>
        )}
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('work.requester') || 'Demandante'}</InputLabel>
                <Select
                  value={filters.requesterId || ''}
                  label={t('work.requester') || 'Demandante'}
                  onChange={(e: SelectChangeEvent) => handleChange('requesterId', e.target.value)}
                >
                  <MenuItem value="">{t('common.all') || 'Todos'}</MenuItem>
                  {members.map(m => (
                    <MenuItem key={m.id} value={m.id}>{m.full_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('profile.member') || 'Membro Executor'}</InputLabel>
                <Select
                  value={filters.workerId || ''}
                  label={t('profile.member') || 'Membro Executor'}
                  onChange={(e: SelectChangeEvent) => handleChange('workerId', e.target.value)}
                >
                  <MenuItem value="">{t('common.all') || 'Todos'}</MenuItem>
                  {members.map(m => (
                    <MenuItem key={m.id} value={m.id}>{m.full_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('activity.type.task') || 'Tipo'}</InputLabel>
                <Select
                  value={filters.type || 'all'}
                  label={t('activity.type.task') || 'Tipo'}
                  onChange={(e: SelectChangeEvent) => handleChange('type', e.target.value)}
                >
                  <MenuItem value="all">{t('common.all') || 'Todos'}</MenuItem>
                  <MenuItem value="task">{t('activity.type.task') || 'Tarefa'}</MenuItem>
                  <MenuItem value="contribution">{t('activity.type.contribution') || 'Contribuição'}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
};

export default WorkFilters;
