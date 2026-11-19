import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

/**
 * Available balance (total - reserved) of a member who would be the beneficiary of a demand or
 * registered work. Returns `null` while unknown or when there is no member beneficiary.
 */
export function useBeneficiaryBalance(profileId: string | null | undefined) {
  const [available, setAvailable] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setAvailable(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    apiClient
      .invoke('api-wallet', 'getAvailableBalance', { profileId })
      .then(({ data, error }: any) => {
        if (cancelled) return;
        setAvailable(error ? null : Number(data?.available_balance ?? 0));
      })
      .catch(() => {
        if (!cancelled) setAvailable(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  return { available, loading };
}

/** Parses `INSUFFICIENT_AVAILABLE_BALANCE: available=X, required=Y` coming from the API. */
export function parseReservationError(message?: string): { available: number; required: number } | null {
  const m = message?.match(/INSUFFICIENT_AVAILABLE_BALANCE:.*available=([\d.]+).*required=([\d.]+)/);
  return m ? { available: Number(m[1]), required: Number(m[2]) } : null;
}
