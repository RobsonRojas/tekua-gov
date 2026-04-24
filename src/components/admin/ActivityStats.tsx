import React, { useMemo } from 'react';
import { 
  Paper, 
  Typography, 
  Box,
  useTheme
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';
import type { AdminActivityLog } from '../../hooks/useAdminActivity';

interface ActivityStatsProps {
  logs: AdminActivityLog[];
}

const ActivityStats: React.FC<ActivityStatsProps> = ({ logs }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    const activityByDay = logs.reduce((acc, log) => {
      const day = log.created_at.split('T')[0];
      if (acc[day] !== undefined) {
        acc[day]++;
      }
      return acc;
    }, last30Days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {} as Record<string, number>));

    return last30Days.map(day => ({
      name: new Date(day).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
      value: activityByDay[day]
    }));
  }, [logs]);

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: '16px', bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUp size={18} /> {t('audit.activityTrends')}
      </Typography>
      
      <Box sx={{ height: 300, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme.palette.background.paper, 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
              itemStyle={{ color: theme.palette.primary.main }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={theme.palette.primary.main} 
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ActivityStats;
