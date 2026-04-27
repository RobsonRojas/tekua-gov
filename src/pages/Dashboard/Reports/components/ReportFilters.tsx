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
import type { ReportFilters as IReportFilters } from '../hooks/useActivityReports';

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
          {t('admin.filters')}
        </Typography>
      </Box>
      
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            fullWidth
            label={t('work.status')}
            name="status"
            value={filters.status || 'all'}
            onChange={handleChange}
            size="small"
          >
            <MenuItem value="all">{t('common.all')}</MenuItem>
            <MenuItem value="open">{t('work.open')}</MenuItem>
            <MenuItem value="in_progress">{t('work.in_progress')}</MenuItem>
            <MenuItem value="pending_validation">{t('work.pending')}</MenuItem>
            <MenuItem value="completed">{t('work.completed')}</MenuItem>
            <MenuItem value="rejected">{t('work.rejected')}</MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            fullWidth
            label={t('work.type')}
            name="type"
            value={filters.type || 'all'}
            onChange={handleChange}
            size="small"
          >
            <MenuItem value="all">{t('common.all')}</MenuItem>
            <MenuItem value="task">{t('work.task')}</MenuItem>
            <MenuItem value="contribution">{t('work.contribution')}</MenuItem>
          </TextField>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            fullWidth
            type="date"
            label={t('admin.startDate')}
            name="startDate"
            value={filters.startDate || ''}
            onChange={handleChange}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            fullWidth
            type="date"
            label={t('admin.endDate')}
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
            label={t('admin.minAmount')}
            name="minAmount"
            value={filters.minAmount || ''}
            onChange={handleChange}
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start">$S</InputAdornment>,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={onClear}
            fullWidth
            startIcon={<ClearIcon />}
            size="large"
          >
            {t('admin.clear')}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReportFilters;
