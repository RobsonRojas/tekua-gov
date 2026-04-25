import { apiClient } from '../lib/api';
import type { ActivityActionType } from '../pages/components/ActivityTab';

export const logActivity = async (
  userId: string,
  actionType: ActivityActionType,
  description: Record<string, string>,
  metadata: any = {}
) => {
  try {
    const { error } = await apiClient.invoke('api-audit', 'logActivity', {
      userId,
      action: actionType,
      description,
      metadata
    });

    if (error) {
      console.error('Failed to log activity via API:', error);
    }
  } catch (err) {
    console.error('Exception logging activity:', err);
  }
};
