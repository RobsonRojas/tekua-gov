import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';

export interface ProfileWithBalance {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  roles: string[] | null;
  functions: string[] | null;
  surreal_balance: number;
}

export interface EconomyStats {
  totalCirculating: number;
  treasuryBalance: number;
  totalTransactions: number;
  topContributors: Array<{
    position: number;
    id: string;
    full_name: string;
    avatar_url: string | null;
    completed_tasks: number;
    surreal_balance: number;
  }>;
  topHolders: Array<{
    position: number;
    id: string;
    full_name: string;
    avatar_url: string | null;
    surreal_balance: number;
  }>;
}

export function useMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await apiClient.invoke('api-members', 'fetchUsers');

      if (apiError) throw new Error(apiError);
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
      const { error } = await apiClient.invoke('api-members', 'adminUpdateProfile', {
        targetUserId: userId,
        updates
      });
      if (error) throw new Error(error);

      await fetchMembers();
      return true;
    } catch (err: any) {
      console.error('Error updating member:', err);
      return false;
    }
  };

  const inviteMember = async (email: string, fullName: string, roles: string[], functions: string[] = [], avatarUrl?: string | null) => {
    try {
      const { error } = await apiClient.invoke('api-members', 'inviteMember', {
        email,
        full_name: fullName,
        roles,
        functions,
        avatar_url: avatarUrl
      });

      if (error) throw new Error(error);
      
      await fetchMembers();
      return { success: true };
    } catch (err: any) {
      console.error('Error inviting member:', err);
      return { success: false, error: err.message };
    }
  };

  const fetchMembersWithBalances = async (): Promise<ProfileWithBalance[]> => {
    try {
      const { data, error: apiError } = await apiClient.invoke('api-members', 'fetchUsersWithBalances');
      if (apiError) throw new Error(apiError);
      return data as ProfileWithBalance[];
    } catch (err: any) {
      console.error('Error fetching members with balances:', err);
      throw err;
    }
  };

  const fetchEconomyStats = async (): Promise<EconomyStats> => {
    try {
      const { data, error: apiError } = await apiClient.invoke('api-members', 'fetchEconomyStats');
      if (apiError) throw new Error(apiError);
      return data as EconomyStats;
    } catch (err: any) {
      console.error('Error fetching economy stats:', err);
      throw err;
    }
  };

  return {
    members,
    loading,
    error,
    refreshMembers: fetchMembers,
    updateMember,
    inviteMember,
    fetchMembersWithBalances,
    fetchEconomyStats
  };
}
