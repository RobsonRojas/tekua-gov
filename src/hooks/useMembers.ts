import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';

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

  const inviteMember = async (email: string, fullName: string, role: string, isBoardMember: boolean = false, boardRole: string | null = null) => {
    try {
      const { error } = await apiClient.invoke('api-members', 'inviteMember', {
        email,
        full_name: fullName,
        role,
        is_board_member: isBoardMember,
        board_role: boardRole
      });

      if (error) throw new Error(error);
      
      await fetchMembers();
      return { success: true };
    } catch (err: any) {
      console.error('Error inviting member:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    members,
    loading,
    error,
    refreshMembers: fetchMembers,
    updateMember,
    inviteMember
  };
}
