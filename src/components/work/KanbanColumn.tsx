import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, Stack } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityCard from '../ActivityCard';
import ActivityCardSkeleton from '../Skeletons/ActivityCardSkeleton';
import { useTranslation } from 'react-i18next';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  color: string;
  bgColor: string;
  borderColor: string;
  activities: any[];
  onRefresh: () => void;
  highlightedId?: string | null;
  onDropCard: (activityId: string, sourceStatus: string, targetColumnId: string) => void;
  loading?: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  count,
  color,
  bgColor,
  borderColor,
  activities,
  onRefresh,
  highlightedId,
  onDropCard,
  loading = false
}) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const payload = JSON.parse(dataStr);
        if (payload.activityId && payload.sourceStatus) {
          onDropCard(payload.activityId, payload.sourceStatus, id);
        }
      }
    } catch (err) {
      console.error('Failed to parse drag drop payload', err);
    }
  };

  return (
    <Paper
      id={`kanban-col-${id}`}
      elevation={0}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        flex: { xs: '0 0 85vw', sm: '0 0 280px', md: '0 0 280px', lg: '0 0 300px' },
        minWidth: { xs: '270px', sm: '280px', md: '280px', lg: '300px' },
        maxWidth: { xs: '85vw', sm: '320px', md: 'none' },
        width: { xs: '85vw', sm: '280px', md: '300px' },
        flexShrink: 0,
        scrollSnapAlign: 'start',
        scrollSnapStop: 'normal',
        height: '100%',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        bgcolor: isDragOver ? 'rgba(16, 185, 129, 0.08)' : bgColor,
        border: `2px solid ${isDragOver ? '#10b981' : borderColor}`,
        transition: 'all 0.2s ease-in-out',
        boxShadow: isDragOver ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'none',
        overflow: 'hidden'
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          p: 2.5,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          bgcolor: 'rgba(0, 0, 0, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: color,
              boxShadow: `0 0 10px ${color}`
            }}
          />
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            {title}
          </Typography>
        </Box>
        <Chip
          label={count}
          size="small"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            fontWeight: 800,
            fontSize: '0.8rem',
            color: 'text.primary',
            borderRadius: '10px'
          }}
        />
      </Box>

      {/* Cards List Container */}
      <Box
        sx={{
          p: 2,
          flexGrow: 1,
          overflowY: 'auto',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minHeight: '200px',
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(255,255,255,0.18)',
            borderRadius: '4px'
          }
        }}
      >
        {loading ? (
          <Stack spacing={2}>
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
          </Stack>
        ) : activities.length > 0 ? (
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
              >
                <ActivityCard
                  activity={activity}
                  onRefresh={onRefresh}
                  highlighted={highlightedId === activity.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 180,
              border: '2px dashed rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              p: 3,
              textAlign: 'center',
              opacity: 0.5
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {isDragOver ? (t('work.dropCardHere') || 'Solte o item aqui') : (t('work.noItemsColumn') || 'Nenhum item')}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default KanbanColumn;
