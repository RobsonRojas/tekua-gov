import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.11.4"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { checkRateLimit, getResponseHeaders } from "../_shared/security.ts"

const corsHeaders = getResponseHeaders();

let cachedFallbackModels: string[] | null = null;

async function getFallbackModels(apiKey: string): Promise<string[]> {
  if (cachedFallbackModels) return cachedFallbackModels;
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const models = data.models || [];
    
    // Filter for models that support generateContent
    cachedFallbackModels = models
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace('models/', ''));
      
    // Sort so flash models are prioritized
    cachedFallbackModels.sort((a, b) => {
      if (a.includes('flash') && !b.includes('flash')) return -1;
      if (!a.includes('flash') && b.includes('flash')) return 1;
      return b.localeCompare(a); // Sort descending to put newer versions first
    });
    
    return cachedFallbackModels;
  } catch (error) {
    console.error('ai-justica-restaurativa: Error fetching models, using hardcoded fallback', error);
    return ['gemini-3.6-flash', 'gemini-1.5-flash']; // Last resort hardcoded
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'Configuração de IA incompleta (API Key ausente).' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Autenticação necessária.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const token = authHeader.replace('Bearer ', '')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Sessão expirada ou inválida.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const rateLimit = await checkRateLimit(supabaseClient, {
      key: `ai:jr:${user.id}`,
      limit: 20,
      windowSeconds: 60
    });

    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Limite de mensagens atingido. Aguarde um momento.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      })
    }

    const body = await req.json().catch(() => ({}));
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Histórico inválido.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const lastMessageObj = messages[messages.length - 1]
    let lastMessage = lastMessageObj.content || ''
    if (lastMessage.length > 2000) lastMessage = lastMessage.substring(0, 2000)

    const BASE_SYSTEM_PROMPT = `
      Você é o Agente de IA de Justiça Restaurativa da ecovila Tekuá.
      Seu papel é atuar como um facilitador neutro e empático, guiando os usuários pelo "Protocolo de Justiça Restaurativa da Tekuá".
      NÃO julgue quem está certo ou errado. Foque em extrair sentimentos e necessidades usando Comunicação Não Violenta (CNV).
      
      O protocolo tem 4 passos principais de orientação:
      - Passo 1: Auto-Reflexão (O Jogo do Espelhamento). Identificar sentimentos e necessidades. Pergunte onde o comportamento do outro vive no próprio usuário.
      - Passo 2: Diálogo Direto com CNV. Estrutura OSNP (Observação, Sentimento, Necessidade, Pedido).
      - Passo 3: Mediação Individual. Envolver um terceiro neutro.
      - Passo 4: Câmara de Justiça Restaurativa. Círculo coletivo.

      INSTRUÇÕES DE FLUXO:
      1. Comece sempre com empatia, perguntando sobre o incômodo (Passo 1).
      2. Incentive a auto-reflexão.
      3. Se o usuário quiser envolver a outra pessoa, ensine a estrutura OSNP (Passo 2).
      4. Se o diálogo direto já falhou, recomende a Mediação Individual (Passo 3) ou a Câmara (Passo 4).
      
      Mantenha as respostas curtas, em tom acolhedor. NUNCA peça nomes de outras pessoas (mantenha confidencialidade).
    `;

    let formattedHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

    const genAI = new GoogleGenerativeAI(API_KEY)
    
    const defaultModel = 'gemini-1.5-flash';
    const fallbackModels = await getFallbackModels(API_KEY);
    const modelsToTry = [defaultModel, ...fallbackModels.filter(m => m !== defaultModel)];

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const sendEvent = (data: any) => {
          controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"))
        }

        let success = false;
        let lastError: any = null;

        for (const modelName of modelsToTry) {
          try {
            console.log(`ai-justica-restaurativa: Trying model ${modelName}...`);
            const model = genAI.getGenerativeModel({ 
              model: modelName,
              systemInstruction: BASE_SYSTEM_PROMPT
            })

            const chat = model.startChat({
              history: formattedHistory
            })

            const result = await chat.sendMessageStream(lastMessage)
            let fullText = '';
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              fullText += chunkText;
              sendEvent({ type: 'text_chunk', content: chunkText })
            }
            sendEvent({ type: 'text_complete', content: fullText })
            success = true;
            break; // Model succeeded, exit fallback loop
          } catch (e: any) {
            console.error(`ai-justica-restaurativa: Stream processing error with model ${modelName}:`, e)
            lastError = e;
            // Let the loop continue to the next model
          }
        }

        if (!success) {
          console.error('ai-justica-restaurativa: All models failed. Last error:', lastError);
          sendEvent({ type: 'error', message: `Erro ao gerar resposta: ${lastError?.message || 'Desconhecido'}` })
        }
        
        controller.close()
      },
    })

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream; charset=utf-8' },
    })

  } catch (error: any) {
    console.error('ai-justica-restaurativa: Critical handler error:', error)
    return new Response(JSON.stringify({ error: 'Erro inesperado.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
