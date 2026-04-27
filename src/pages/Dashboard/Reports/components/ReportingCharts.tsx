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
import type { ActivityReportItem } from '../hooks/useActivityReports';

interface ReportingChartsProps {
  data: ActivityReportItem[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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

  const typeData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name: t(`work.${name}`) || name, 
      value 
    }));
  }, [data, t]);

  const memberData = React.useMemo(() => {
    const stats: Record<string, { total: number, count: number }> = {};
    data.forEach(item => {
      const name = item.worker?.full_name || item.requester?.full_name || 'N/A';
      if (!stats[name]) stats[name] = { total: 0, count: 0 };
      stats[name].total += Number(item.reward_amount);
      stats[name].count += 1;
    });
    return Object.entries(stats)
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, 5);
  }, [data, metric]);

  if (data.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              {t('admin.statusDistribution')}
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
                    outerRadius={80}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={48} wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              {t('admin.typeDistribution')}
            </Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {typeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={48} wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                {t('admin.topContributors')}
              </Typography>
              <ToggleButtonGroup
                size="small"
                value={metric}
                exclusive
                onChange={(_, val) => val && setMetric(val)}
                aria-label="chart metric"
              >
                <ToggleButton value="total" sx={{ px: 2 }}>$S</ToggleButton>
                <ToggleButton value="count" sx={{ px: 2 }}>#</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={memberData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    formatter={(value) => metric === 'total' ? `$S ${Number(value).toLocaleString()}` : value} 
                  />
                  <Bar dataKey={metric} fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportingCharts;
