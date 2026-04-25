import { getPendingActions, removePendingAction, type PendingAction } from './db';
import { apiClient } from './api';

let isSyncing = false;

export const processSyncQueue = async () => {
  if (isSyncing || !navigator.onLine) return;
  
  const actions = await getPendingActions();
  if (actions.length === 0) return;

  isSyncing = true;
  console.log(`[Sync] Starting sync for ${actions.length} pending actions`);

  for (const action of actions) {
    try {
      await executeAction(action);
      await removePendingAction(action.id);
      console.log(`[Sync] Successfully processed ${action.type} (${action.id})`);
    } catch (error) {
      console.error(`[Sync] Failed to process ${action.type} (${action.id}):`, error);
      // We leave it in the queue to retry later
    }
  }

  isSyncing = false;
};

const executeAction = async (action: PendingAction) => {
  switch (action.type) {
    case 'vote': {
      const { error } = await apiClient.invoke('api-governance', 'castVote', action.data);
      if (error) throw new Error(error);
      break;
    }

    case 'submit_task': {
      const { error } = await apiClient.invoke('api-work', 'submitActivity', {
        title: action.data.p_title,
        description: action.data.p_description?.pt || action.data.p_description,
        rewardAmount: action.data.p_reward_amount,
        evidenceUrl: action.data.p_evidence_url,
        requesterId: action.data.p_requester_id
      });
      if (error) throw new Error(error);
      break;
    }

    case 'transfer': {
      const { error } = await apiClient.invoke('api-wallet', 'transfer', action.data);
      if (error) throw new Error(error);
      break;
    }

    default:
      console.warn(`[Sync] Unknown action type: ${action.type}`);
  }
};

// Start listener for online status
export const initSyncListener = () => {
  window.addEventListener('online', processSyncQueue);
  // Also check on load
  processSyncQueue();
  // Periodic check every 5 minutes just in case
  setInterval(processSyncQueue, 5 * 60 * 1000);
};
