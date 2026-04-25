import { getPendingActions, removePendingAction, type PendingAction } from './db';
import { supabase } from './supabase';

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
    case 'vote':
      const { error: voteError } = await supabase
        .from('votes')
        .insert(action.data);
      if (voteError) throw voteError;
      break;

    case 'submit_task':
      const { error: taskError } = await supabase
        .from('task_submissions')
        .insert(action.data);
      if (taskError) throw taskError;
      break;

    case 'transfer':
      const { error: transferError } = await supabase.rpc('perform_transfer', action.data);
      if (transferError) throw transferError;
      break;

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
