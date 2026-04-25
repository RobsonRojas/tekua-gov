import { supabase } from '../lib/supabase';
import type { ActivityActionType } from '../pages/components/ActivityTab';

export const logActivity = async (
  userId: string,
  actionType: ActivityActionType,
  description: Record<string, string>,
  ipAddress?: string
) => {
  try {
    const { error } = await supabase.from('audit_logs').insert([
      {
        user_id: userId,
        action_type: actionType,
        description: description,
        ip_address: ipAddress || null,
      },
    ]);

    if (error) {
      console.error('Failed to log activity:', error);
    }
  } catch (err) {
    console.error('Exception logging activity:', err);
  }
};
