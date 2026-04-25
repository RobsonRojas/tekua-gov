import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../../lib/api';

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
      const { data: results, error: apiError } = await apiClient.invoke('api-work', 'fetchActivities', {
        ...filters,
        limit: 1000 // Reports usually want more data
      });

      if (apiError) throw new Error(apiError);

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
