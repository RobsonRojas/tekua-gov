import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../lib/api';
import type { ActivityLog, ActivityActionType } from '../pages/components/ActivityTab';

export interface AdminActivityLog extends ActivityLog {
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export interface ActivityFilters {
  userSearch?: string;
  actionType?: ActivityActionType | 'all';
  startDate?: string;
  endDate?: string;
}

export function useAdminActivity() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<ActivityFilters>({
    actionType: 'all'
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await apiClient.invoke('api-audit', 'fetchAdminLogs', {
        page,
        pageSize,
        filters
      });

      if (apiError) throw new Error(apiError);

      const { logs: apiLogs, count } = data || { logs: [], count: 0 };

      setLogs((apiLogs as any[]).map(log => ({
        id: log.id,
        user_id: log.actor_id,
        action_type: log.action,
        description: log.description,
        created_at: log.created_at,
        profiles: log.profiles
      })));
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching admin activity logs:', err);
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const updateFilters = (newFilters: Partial<ActivityFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0); // Reset to first page when filters change
  };

  return {
    logs,
    loading,
    error,
    totalCount,
    page,
    setPage,
    pageSize,
    filters,
    updateFilters,
    refresh: fetchLogs
  };
}
