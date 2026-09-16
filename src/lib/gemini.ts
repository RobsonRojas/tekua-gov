import { supabase } from './supabase';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

const isTokenExpired = (token: string): boolean => {
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    const exp = decoded.exp;
    // 30 seconds buffer
    return (Date.now() / 1000) > (exp - 30);
  } catch (e) {
    return true;
  }
};

const getValidToken = async (forceRefresh?: boolean): Promise<string> => {
  if (!forceRefresh) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token && !isTokenExpired(session.access_token)) {
      return session.access_token;
    }
  }
  
  const { data: { session }, error } = await supabase.auth.refreshSession();
  if (error || !session?.access_token || isTokenExpired(session.access_token)) {
    throw new AuthError('auth.sessionExpired'); // Used as a key for i18n
  }
  return session.access_token;
};

export const chatWithGemini = async (
  messages: Message[], 
  systemInstruction?: string
) => {
  let token = await getValidToken();
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!baseUrl) {
    throw new Error('VITE_SUPABASE_URL is not defined');
  }

  let response = await fetch(`${baseUrl}/functions/v1/ai-handler`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({ messages, systemInstruction }),
  });

  if (response.status === 401) {
    token = await getValidToken(true);
    response = await fetch(`${baseUrl}/functions/v1/ai-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ messages, systemInstruction }),
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  // Handle the event stream from tool calling loop
  return {
    async *[Symbol.asyncIterator]() {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            try {
              const event = JSON.parse(trimmedLine);
              if (event.type === 'tool') {
                yield { type: 'tool', name: event.name };
              } else if (event.type === 'text') {
                yield { type: 'text', content: event.content };
              } else if (event.type === 'error') {
                throw new Error(event.message);
              }
            } catch (e: any) {
              // If it's an error from the stream, propagate it
              if (e.message && e.message.includes('JSON')) {
                 console.error('gemini.ts: JSON parse error in stream line:', trimmedLine);
              } else {
                 throw e;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  };
};

export const chatWithJRAgent = async (
  messages: Message[]
) => {
  let token = await getValidToken();
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!baseUrl) {
    throw new Error('VITE_SUPABASE_URL is not defined');
  }

  let response = await fetch(`${baseUrl}/functions/v1/ai-justica-restaurativa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({ messages }),
  });

  if (response.status === 401) {
    token = await getValidToken(true);
    response = await fetch(`${baseUrl}/functions/v1/ai-justica-restaurativa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ messages }),
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  return {
    async *[Symbol.asyncIterator]() {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            try {
              const event = JSON.parse(trimmedLine);
              if (event.type === 'text_chunk') {
                yield { type: 'text_chunk', content: event.content };
              } else if (event.type === 'text_complete') {
                yield { type: 'text_complete', content: event.content };
              } else if (event.type === 'error') {
                throw new Error(event.message);
              }
            } catch (e: any) {
              if (e.message && e.message.includes('JSON')) {
                 console.error('gemini.ts: JSON parse error in JR stream line:', trimmedLine);
              } else {
                 throw e;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  };
};

