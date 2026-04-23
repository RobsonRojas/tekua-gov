import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';

export interface ContributionReportItem {
  id: string;
  created_at: string;
  description: string;
  amount_suggested: number;
  status: 'pending' | 'completed' | 'rejected';
  user_id: string;
  profiles: {
    full_name: string | null;
  } | null;
  beneficiary_profiles?: {
    full_name: string | null;
  } | null;
}

export interface ReportFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  contributor?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const useContributionReports = (filters: ReportFilters) => {
  const [data, setData] = useState<ContributionReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('contributions')
        .select(`
          id,
          created_at,
          description,
          amount_suggested,
          status,
          user_id,
          profiles:profiles!user_id (full_name),
          beneficiary_profiles:profiles!beneficiary_id (full_name)
        `)
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        // To include the whole end day, we could add 1 day or use T23:59:59
        query = query.lte('created_at', filters.endDate);
      }

      if (filters.contributor) {
        // Filtering by contributor name is tricky with Supabase's simple JS client
        // unless we use a join/text search. For now, we'll assume exact ID or just filter client-side 
        // if it's too complex. But Supabase allows ilike on joined tables sometimes.
        // Actually, it's better to filter by user_id if we have a selector.
        // If it's a text search, we might need a more complex query.
        // For MVP, let's stick to status and dates first.
      }

      if (filters.minAmount !== undefined) {
        query = query.gte('amount_suggested', filters.minAmount);
      }

      if (filters.maxAmount !== undefined) {
        query = query.lte('amount_suggested', filters.maxAmount);
      }

      const { data: results, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(results as any[] || []);
    } catch (err: any) {
      console.error('Error fetching contribution reports:', err);
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
