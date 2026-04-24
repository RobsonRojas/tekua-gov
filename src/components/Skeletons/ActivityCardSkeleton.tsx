import React from 'react';
import { Box, Paper, Skeleton, Stack } from '@mui/material';

const ActivityCardSkeleton: React.FC = () => {
  return (
    <Paper sx={{ p: 2, borderRadius: '16px', mb: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '12px' }} />
        </Box>
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="90%" height={20} />
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width="30%" height={20} />
        </Box>
        <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: '12px' }} />
      </Stack>
    </Paper>
  );
};

export default ActivityCardSkeleton;
