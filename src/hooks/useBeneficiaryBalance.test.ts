import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../lib/api';
import { useBeneficiaryBalance, parseReservationError } from './useBeneficiaryBalance';

describe('useBeneficiaryBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not query when there is no member beneficiary', () => {
    const { result } = renderHook(() => useBeneficiaryBalance(null));
    expect(result.current.available).toBeNull();
    expect(apiClient.invoke).not.toHaveBeenCalled();
  });

  it('loads the available balance of the beneficiary', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: { available_balance: 40 }, error: null } as any);
    const { result } = renderHook(() => useBeneficiaryBalance('member-1'));
    await waitFor(() => expect(result.current.available).toBe(40));
    expect(apiClient.invoke).toHaveBeenCalledWith('api-wallet', 'getAvailableBalance', { profileId: 'member-1' });
  });
});

describe('parseReservationError', () => {
  it('extracts available and required amounts', () => {
    expect(parseReservationError('INSUFFICIENT_AVAILABLE_BALANCE: available=40.00, required=60.00')).toEqual({
      available: 40,
      required: 60
    });
  });

  it('returns null for other errors', () => {
    expect(parseReservationError('Forbidden')).toBeNull();
    expect(parseReservationError(undefined)).toBeNull();
  });
});
