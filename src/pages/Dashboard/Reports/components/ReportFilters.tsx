import React from 'react';
import { 
  Box, 
  TextField, 
  MenuItem, 
  Grid, 
  Button, 
  Paper,
  Typography,
  InputAdornment
} from '@mui/material';
import { 
  FilterAlt as FilterIcon, 
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { ReportFilters as IReportFilters } from '../hooks/useContributionReports';

interface ReportFiltersProps {
  filters: IReportFilters;
  onFilterChange: (newFilters: IReportFilters) => void;
  onClear: () => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ filters, onFilterChange, onClear }) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={600}>
          {t('admin.filters') || 'Filtros'}
        </Typography>
      </Box>
      
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            label={t('work.status') || 'Status'}
            name="status"
            value={filters.status || 'all'}
            onChange={handleChange}
            size="small"
          >
            <MenuItem value="all">{t('common.all') || 'Todos'}</MenuItem>
            <MenuItem value="pending">{t('work.pending') || 'Pendente'}</MenuItem>
            <MenuItem value="completed">{t('work.completed') || 'Concluído'}</MenuItem>
            <MenuItem value="rejected">{t('work.rejected') || 'Rejeitado'}</MenuItem>
          </TextField>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <TextField
            fullWidth
            type="date"
            label={t('admin.startDate') || 'Data Inicial'}
            name="startDate"
            value={filters.startDate || ''}
            onChange={handleChange}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <TextField
            fullWidth
            type="date"
            label={t('admin.endDate') || 'Data Final'}
            name="endDate"
            value={filters.endDate || ''}
            onChange={handleChange}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            fullWidth
            type="number"
            label={t('admin.minAmount') || 'Valor Mín'}
            name="minAmount"
            value={filters.minAmount || ''}
            onChange={handleChange}
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start">₮</InputAdornment>,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={onClear}
              fullWidth
              startIcon={<ClearIcon />}
            >
              {t('admin.clear') || 'Limpar'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReportFilters;
