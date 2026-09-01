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
  projectId?: string;
}

interface WorkFiltersProps {
  onFilterChange: (filters: WorkFilterValues) => void;
}

const WorkFilters: React.FC<WorkFiltersProps> = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [filters, setFilters] = useState<WorkFilterValues>({
    requesterId: '',
    workerId: '',
    type: 'all',
    projectId: ''
  });

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name').order('full_name');
      if (!error && data) {
        setMembers(data);
      }
    };
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select('id, name').order('name');
      if (!error && data) {
        setProjects(data);
      }
    };
    fetchMembers();
    fetchProjects();
  }, []);

  const handleChange = (field: keyof WorkFilterValues, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const reset = { requesterId: '', workerId: '', type: 'all', projectId: '' };
    setFilters(reset);
    onFilterChange(reset);
  };

  const projectLabel = t('work.project', 'Projeto');
  const executorLabel = t('work.executor', 'Executor');

  const hasActiveFilters = Boolean(
    filters.requesterId || 
    filters.workerId || 
    (filters.type && filters.type !== 'all') || 
    filters.projectId
  );

  return (
    <Box sx={{ mb: 3 }}>
      {/* Top Always-Visible Bar */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          justifyContent: 'space-between', 
          gap: 2, 
          mb: 1.5 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', flexGrow: 1 }}>
          {/* Always Visible Project Filter */}
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, maxWidth: { sm: 260 } }}>
            <InputLabel id="project-filter-label">{projectLabel}</InputLabel>
            <Select
              labelId="project-filter-label"
              value={filters.projectId || ''}
              label={projectLabel}
              onChange={(e: SelectChangeEvent) => handleChange('projectId', e.target.value)}
              sx={{ borderRadius: '12px', bgcolor: 'background.paper' }}
            >
              <MenuItem value="">{t('common.all') || 'Todos os Projetos'}</MenuItem>
              {projects.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Always Visible Executor Filter */}
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, maxWidth: { sm: 260 } }}>
            <InputLabel id="executor-filter-label">{executorLabel}</InputLabel>
            <Select
              labelId="executor-filter-label"
              value={filters.workerId || ''}
              label={executorLabel}
              onChange={(e: SelectChangeEvent) => handleChange('workerId', e.target.value)}
              sx={{ borderRadius: '12px', bgcolor: 'background.paper' }}
            >
              <MenuItem value="">{t('common.all') || 'Todos os Executores'}</MenuItem>
              {members.map(m => (
                <MenuItem key={m.id} value={m.id}>{m.full_name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Toggle Secondary Filters Button */}
          <Button 
            variant={expanded ? 'contained' : 'outlined'}
            startIcon={<FilterIcon />} 
            onClick={() => setExpanded(!expanded)}
            size="medium"
            sx={{ borderRadius: '12px', py: 0.9 }}
          >
            {expanded ? t('common.hideFilters') || 'Ocultar Filtros' : t('common.showFilters') || 'Mostrar Filtros'}
          </Button>
        </Box>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button 
            startIcon={<ClearIcon />} 
            onClick={clearFilters}
            size="small"
            color="error"
            sx={{ borderRadius: '10px', alignSelf: { xs: 'flex-end', sm: 'center' } }}
          >
            {t('common.clear') || 'Limpar'}
          </Button>
        )}
      </Box>

      {/* Collapsible Secondary Filters */}
      <Collapse in={expanded}>
        <Box 
          sx={{ 
            p: 2.5, 
            bgcolor: 'background.paper', 
            borderRadius: '16px', 
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('work.requester') || 'Demandante'}</InputLabel>
                <Select
                  value={filters.requesterId || ''}
                  label={t('work.requester') || 'Demandante'}
                  onChange={(e: SelectChangeEvent) => handleChange('requesterId', e.target.value)}
                  sx={{ borderRadius: '10px' }}
                >
                  <MenuItem value="">{t('common.all') || 'Todos'}</MenuItem>
                  {members.map(m => (
                    <MenuItem key={m.id} value={m.id}>{m.full_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('activity.type.task') || 'Tipo'}</InputLabel>
                <Select
                  value={filters.type || 'all'}
                  label={t('activity.type.task') || 'Tipo'}
                  onChange={(e: SelectChangeEvent) => handleChange('type', e.target.value)}
                  sx={{ borderRadius: '10px' }}
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
