import { supabase } from './supabase';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export const chatWithGemini = async (
  messages: Message[], 
  systemInstruction?: string
) => {
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!baseUrl) {
    throw new Error('VITE_SUPABASE_URL is not defined');
  }

  const response = await fetch(`${baseUrl}/functions/v1/ai-handler`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({ messages, systemInstruction }),
  });

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

