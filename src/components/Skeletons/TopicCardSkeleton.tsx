import React from 'react';
import { Box, Paper, Skeleton, Stack } from '@mui/material';

const TopicCardSkeleton: React.FC = () => {
  return (
    <Paper sx={{ p: 3, borderRadius: '24px', mb: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="text" width="70%" height={32} />
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '12px' }} />
        </Box>
        <Skeleton variant="text" width="100%" height={24} />
        <Skeleton variant="text" width="40%" height={24} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={100} height={20} />
          </Box>
          <Skeleton variant="text" width={80} height={20} />
        </Box>
      </Stack>
    </Paper>
  );
};

export default TopicCardSkeleton;
