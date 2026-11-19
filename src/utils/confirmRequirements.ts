export type ConfirmRequirementKey = 'notExecutor' | 'notConfirmedYet';

export interface ConfirmRequirement {
  key: ConfirmRequirementKey;
  met: boolean;
}

interface ConfirmRequirementsInput {
  /** User executed (worker/executor of) the task. */
  isWorker: boolean;
  /** Executors may still confirm (requester or admin forcing by requester approval). */
  isSelfConfirmExempt: boolean;
  /** User already registered a confirmation. */
  userHasConfirmed: boolean;
}

/** Requirements the user must satisfy to confirm a task. The button is disabled if any is unmet. */
export const getConfirmRequirements = ({
  isWorker,
  isSelfConfirmExempt,
  userHasConfirmed,
}: ConfirmRequirementsInput): ConfirmRequirement[] => [
  { key: 'notExecutor', met: !(isWorker && !isSelfConfirmExempt) },
  { key: 'notConfirmedYet', met: !userHasConfirmed },
];
