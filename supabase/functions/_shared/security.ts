import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

/**
 * Rate Limiter Configuration
 */
export interface RateLimitConfig {
  key: string;           // Unique identifier for the bucket (e.g., 'ai:chat:user-id')
  limit: number;         // Max requests allowed in the window
  windowSeconds: number; // Duration of the window in seconds
}

/**
 * Checks if a request should be rate limited.
 * Uses the security_rate_limits table for cross-instance state.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; reset: Date }> {
  const { key, limit, windowSeconds } = config;
  const now = new Date();
  const windowStart = new Date(now.getTime() - (now.getTime() % (windowSeconds * 1000)));
  
  // 1. Attempt to upsert the request count for the current window
  // This uses an atomic approach: if exists, increment; if not, insert.
  // Note: Since Supabase doesn't have a built-in 'increment' RPC that we can use generically,
  // we do a fetch-then-update or use a stored procedure for better atomicity.
  
  // For simplicity and to avoid creating too many RPCs, we'll do it in a transaction-like way
  // but since we are in Edge Functions, we'll use a single RPC call for atomicity.
  
  const { data, error } = await supabase.rpc('increment_rate_limit', {
    p_key: key,
    p_window_start: windowStart.toISOString(),
    p_limit: limit
  });

  if (error) {
    console.error('Rate limit error:', error);
    // Fail open if database is down? Or fail closed? 
    // Usually, for security, we might want to fail open to not block users, 
    // but log the error.
    return { allowed: true, remaining: limit, reset: new Date(windowStart.getTime() + windowSeconds * 1000) };
  }

  return {
    allowed: data.allowed,
    remaining: data.remaining,
    reset: new Date(windowStart.getTime() + windowSeconds * 1000)
  };
}

/**
 * Security Headers Utility
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' *.supabase.co *.google.com;",
};

/**
 * Standard CORS Headers with Security Headers merged
 */
export function getResponseHeaders(extraHeaders: Record<string, string> = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    ...securityHeaders,
    ...extraHeaders
  };
}
