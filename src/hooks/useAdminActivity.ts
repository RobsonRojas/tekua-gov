import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
      let query = supabase
        .from('activity_logs')
        .select('*, profiles(full_name, email)', { count: 'exact' });

      // Apply filters
      if (filters.actionType && filters.actionType !== 'all') {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        // Add 23:59:59 to include the whole end day
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query = query.lte('created_at', end.toISOString());
      }

      // User search (complex because it's a join)
      if (filters.userSearch) {
        // We filter by full_name or email in the profiles join
        // Note: PostgREST doesn't support easy OR across joins in a single query filter string 
        // without complex syntax, so we use a simpler approach or raw filter if needed.
        // For now, we'll use a direct filter on the profiles table if possible.
        query = query.or(`full_name.ilike.%${filters.userSearch}%,email.ilike.%${filters.userSearch}%`, { foreignTable: 'profiles' });
      }

      const { data, error: dbError, count } = await query
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (dbError) throw dbError;

      setLogs((data as any) || []);
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
