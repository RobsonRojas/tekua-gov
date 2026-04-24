import { supabase } from './supabase';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export const chatWithGemini = async (
  messages: Message[], 
  systemInstruction?: string
) => {
  const { data, error } = await supabase.functions.invoke('ai-handler', {
    body: { messages, systemInstruction },
  });

  if (error) {
    throw new Error(error.message || 'Error calling AI Agent');
  }

  // If it's not a stream (e.g. error from function), handle it
  if (!(data instanceof ReadableStream)) {
    // If the function returned a JSON error
    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error(data.error);
    }
    
    // Fallback for non-streaming response if ever needed
    return {
      async *[Symbol.asyncIterator]() {
        yield { text: () => String(data) };
      }
    };
  }

  // Create an async generator to mimic the Gemini SDK stream
  return {
    async *[Symbol.asyncIterator]() {
      const reader = data.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const text = typeof value === 'string' ? value : new TextDecoder().decode(value);
          yield { text: () => text };
        }
      } finally {
        reader.releaseLock();
      }
    }
  };
};

