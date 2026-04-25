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
    try {
      const { data, error } = await supabase.functions.invoke(domain, {
        body: { action, params }
      });

      if (error) {
        console.error(`API Error [${domain}:${action}]:`, error);
        return { 
          data: null, 
          error: typeof error === 'string' ? error : (error.message || 'Unknown API error')
        };
      }

      // The function response should also follow { data, error } pattern
      if (data && 'error' in data && data.error) {
        return { data: null, error: data.error };
      }

      return { 
        data: data && 'data' in data ? data.data : data, 
        error: null 
      };
    } catch (err: any) {
      console.error(`API Exception [${domain}:${action}]:`, err);
      return { data: null, error: err.message || 'Network or internal error' };
    }
  }
}

export const apiClient = new ApiClient();
