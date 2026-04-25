import { supabase } from './supabase';

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
}

export type ApiDomain = 
  | 'api-audit' 
  | 'api-wallet' 
  | 'api-governance' 
  | 'api-members' 
  | 'api-work' 
  | 'api-documents' 
  | 'api-notifications';

class ApiClient {
  /**
   * Invokes a Supabase Edge Function with a standard pattern.
   * @param domain The function name (domain)
   * @param action The specific action to perform within that domain
   * @param params Parameters for the action
   */
  async invoke<T = any>(
    domain: ApiDomain,
    action: string,
    params: Record<string, any> = {}
  ): Promise<ApiResponse<T>> {
    console.log(`ApiClient: invoking [${domain}:${action}] via native fetch`, { params });
    try {
      // Get session for auth token with timeout to prevent hanging in Brave
      console.log('ApiClient: fetching session with timeout...');
      
      let session = null;
      try {
        // Race session fetch against a 500ms timeout
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500))
        ]) as any;
        
        session = sessionResult.data?.session;
        console.log('ApiClient: session result:', !!session);
      } catch (timeoutErr) {
        console.warn('ApiClient: Session fetch timed out or failed, using anon key fallback');
      }
      
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;

      if (!baseUrl) {
        throw new Error('VITE_SUPABASE_URL is not defined');
      }

      const response = await fetch(`${baseUrl}/functions/v1/${domain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY // Required for Supabase Edge Functions
        },
        body: JSON.stringify({ action, params })
      });

      console.log(`ApiClient: [${domain}:${action}] fetch status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Fetch Error [${domain}:${action}]:`, errorText);
        return { data: null, error: `HTTP ${response.status}: ${errorText}` };
      }

      const result = await response.json();
      console.log(`ApiClient: [${domain}:${action}] result:`, result);

      // The function response should follow { data, error } pattern
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        return { data: null, error: result.error };
      }

      return { 
        data: result && typeof result === 'object' && 'data' in result ? result.data : result, 
        error: null 
      };
    } catch (err: any) {
      console.error(`API Exception [${domain}:${action}]:`, err);
      return { data: null, error: err.message || 'Network or internal error' };
    }
  }
}

export const apiClient = new ApiClient();
