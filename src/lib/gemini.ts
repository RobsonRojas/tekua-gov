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
    headers: {
      accept: 'text/event-stream',
    },
  });

  if (error) {
    throw new Error(error.message || 'Error calling AI Agent');
  }

  // Handle the event stream from tool calling loop
  return {
    async *[Symbol.asyncIterator]() {
      const reader = data.getReader();
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
            if (!line.trim()) continue;
            try {
              const event = JSON.parse(line);
              if (event.type === 'tool') {
                yield { type: 'tool', name: event.name };
              } else if (event.type === 'text') {
                yield { type: 'text', content: event.content };
              } else if (event.type === 'error') {
                throw new Error(event.message);
              }
            } catch (e) {
              console.error('Error parsing event line:', e, line);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  };
};

