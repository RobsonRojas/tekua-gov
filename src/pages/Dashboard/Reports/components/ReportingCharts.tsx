import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { ContributionReportItem } from '../hooks/useContributionReports';

interface ReportingChartsProps {
  data: ContributionReportItem[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ReportingCharts: React.FC<ReportingChartsProps> = ({ data }) => {
  const { t } = useTranslation();
  const [metric, setMetric] = React.useState<'total' | 'count'>('total');

  const statusData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name: t(`work.${name}`) || name, 
      value 
    }));
  }, [data, t]);

  const contributorData = React.useMemo(() => {
    const stats: Record<string, { total: number, count: number }> = {};
    data.forEach(item => {
      const name = item.profiles?.full_name || 'N/A';
      if (!stats[name]) stats[name] = { total: 0, count: 0 };
      stats[name].total += Number(item.amount_suggested);
      stats[name].count += 1;
    });
    return Object.entries(stats)
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, 5);
  }, [data, metric]);

  if (data.length === 0) return null;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, borderRadius: 2, height: 450, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {t('admin.statusDistribution') || 'Distribuição por Status'}
          </Typography>
          <Box sx={{ flexGrow: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, borderRadius: 2, height: 450, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {t('admin.topContributors') || 'Top 5 Contribuidores'}
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={metric}
              exclusive
              onChange={(_, val) => val && setMetric(val)}
              aria-label="chart metric"
            >
              <ToggleButton value="total" aria-label="total amount">
                ₮
              </ToggleButton>
              <ToggleButton value="count" aria-label="total count">
                #
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ flexGrow: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contributorData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  formatter={(value) => metric === 'total' ? `₮ ${Number(value).toLocaleString()}` : value} 
                />
                <Bar dataKey={metric} fill={metric === 'total' ? '#82ca9d' : '#8884d8'} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ReportingCharts;
