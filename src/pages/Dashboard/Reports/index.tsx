import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download as DownloadIcon } from '@mui/icons-material';
import ReportFilters from './components/ReportFilters';
import ContributionTable from './components/ContributionTable';
import ReportingCharts from './components/ReportingCharts';
import { useActivityReports } from './hooks/useActivityReports';
import type { ReportFilters as IReportFilters } from './hooks/useActivityReports';
import { downloadCSV } from './utils/csvExport';

const ReportsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filters from searchParams
  const filters: IReportFilters = useMemo(() => ({
    status: searchParams.get('status') || 'all',
    type: searchParams.get('type') || 'all',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    minAmount: searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined,
    maxAmount: searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined,
  }), [searchParams]);

  const { data, loading, error } = useActivityReports(filters);

  const handleFilterChange = (newFilters: IReportFilters) => {
    const params: Record<string, string> = {};
    if (newFilters.status && newFilters.status !== 'all') params.status = newFilters.status;
    if (newFilters.type && newFilters.type !== 'all') params.type = newFilters.type;
    if (newFilters.startDate) params.startDate = newFilters.startDate;
    if (newFilters.endDate) params.endDate = newFilters.endDate;
    if (newFilters.minAmount) params.minAmount = String(newFilters.minAmount);
    if (newFilters.maxAmount) params.maxAmount = String(newFilters.maxAmount);
    
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight={700} color="primary">
            {t('admin.reports')}
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            disabled={loading || data.length === 0}
            onClick={() => downloadCSV(data)}
          >
            {t('admin.exportCSV')}
          </Button>
        </Box>

        <ReportFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onClear={handleClearFilters} 
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <ReportingCharts data={data} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ContributionTable data={data} />
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ReportsDashboard;
