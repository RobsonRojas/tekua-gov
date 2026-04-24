import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';

export interface ActivityReportItem {
  id: string;
  created_at: string;
  title: any; // { pt, en }
  description: any; // { pt, en }
  reward_amount: number;
  status: string;
  type: 'task' | 'contribution';
  worker_id: string | null;
  requester_id: string | null;
  worker?: {
    full_name: string | null;
  } | null;
  requester?: {
    full_name: string | null;
  } | null;
}

export interface ReportFilters {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const useActivityReports = (filters: ReportFilters) => {
  const [data, setData] = useState<ActivityReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('activities')
        .select(`
          id,
          created_at,
          title,
          description,
          reward_amount,
          status,
          type,
          worker_id,
          requester_id,
          worker:profiles!worker_id (full_name),
          requester:profiles!requester_id (full_name)
        `)
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters.minAmount !== undefined) {
        query = query.gte('reward_amount', filters.minAmount);
      }

      if (filters.maxAmount !== undefined) {
        query = query.lte('reward_amount', filters.maxAmount);
      }

      const { data: results, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(results as any[] || []);
    } catch (err: any) {
      console.error('Error fetching activity reports:', err);
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { data, loading, error, refetch: fetchReports };
};
