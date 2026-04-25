import { useState, useEffect } from 'react';
import { cacheData, getCachedData } from '../lib/db';

export function useQueryWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<{ data: T | null; error: any }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineData, setIsOfflineData] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      
      // 1. Try to get from cache first for immediate UI
      const cached = await getCachedData(cacheKey);
      if (cached && mounted) {
        setData(cached);
        setIsOfflineData(true);
      }

      // 2. Fetch from network
      try {
        const { data: remoteData, error: remoteError } = await fetcher();
        
        if (remoteError) throw remoteError;

        if (mounted) {
          setData(remoteData);
          setError(null);
          setIsOfflineData(false);
          setLoading(false);
          
          // 3. Update cache with fresh data
          if (remoteData) {
            await cacheData(cacheKey, remoteData);
          }
        }
      } catch (err: any) {
        if (mounted) {
          setError(err);
          setLoading(false);
          // If network fails but we have cache, we keep the cache data
          if (!data && cached) {
            setData(cached);
            setIsOfflineData(true);
          }
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [...dependencies, refreshTrigger]);

  return { 
    data, 
    error, 
    loading, 
    isOfflineData, 
    refetch: () => setRefreshTrigger(prev => prev + 1) 
  };
}
