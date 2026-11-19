import { describe, it, expect } from 'vitest';
import { getConfirmRequirements } from './confirmRequirements';

const unmet = (i: Parameters<typeof getConfirmRequirements>[0]) =>
  getConfirmRequirements(i).filter(r => !r.met).map(r => r.key);

describe('getConfirmRequirements', () => {
  it('flags an executor who cannot self-confirm', () => {
    expect(unmet({ isWorker: true, isSelfConfirmExempt: false, userHasConfirmed: false })).toEqual(['notExecutor']);
  });
  it('flags a user who already confirmed', () => {
    expect(unmet({ isWorker: false, isSelfConfirmExempt: false, userHasConfirmed: true })).toEqual(['notConfirmedYet']);
  });
  it('lets an exempt executor (requester/admin) confirm', () => {
    expect(unmet({ isWorker: true, isSelfConfirmExempt: true, userHasConfirmed: false })).toEqual([]);
  });
  it('has nothing unmet for a regular member', () => {
    expect(unmet({ isWorker: false, isSelfConfirmExempt: false, userHasConfirmed: false })).toEqual([]);
  });
});
