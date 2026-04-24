import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (dbError) throw dbError;
      setMembers(data || []);
    } catch (err: any) {
      console.error('Error fetching members:', err);
      setError(err.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const updateMember = async (userId: string, updates: any) => {
    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (dbError) throw dbError;
      await fetchMembers();
      return true;
    } catch (err: any) {
      console.error('Error updating member:', err);
      return false;
    }
  };

  return {
    members,
    loading,
    error,
    refreshMembers: fetchMembers,
    updateMember
  };
}
