import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // -------------------------------------------------------------
    // WEBHOOK ENDPOINT
    // -------------------------------------------------------------
    if (path.endsWith('/webhook')) {
      const signature = req.headers.get('Cora-Signature') || '';
      // TODO: Validate webhook signature using CORA_WEBHOOK_SECRET
      const expectedSecret = Deno.env.get('CORA_WEBHOOK_SECRET');
      
      const payload = await req.json();
      
      // Process webhook event
      if (payload && payload.type && payload.data && payload.data.id) {
        const coraTransactionId = payload.data.id;
        let newStatus = 'pending';
        
        switch (payload.type) {
          case 'payment.paid':
            newStatus = 'paid';
            break;
          case 'payment.failed':
            newStatus = 'failed';
            break;
          case 'payment.expired':
            newStatus = 'expired';
            break;
        }

        const { error } = await supabase
          .from('cora_payments')
          .update({ status: newStatus, payload: payload })
          .eq('cora_transaction_id', coraTransactionId);

        if (error) {
          console.error("Error updating payment from webhook", error);
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        });
      }
      return new Response(JSON.stringify({ error: 'Invalid webhook payload' }), { status: 400 });
    }

    // -------------------------------------------------------------
    // CREATE PAYMENT ENDPOINT
    // -------------------------------------------------------------
    if (path.endsWith('/create')) {
      // 1. Authenticate the User (Optional for guest checkouts)
      const authHeader = req.headers.get('Authorization');
      let userId = null;

      if (authHeader) {
        const supabaseClient = createClient(
          supabaseUrl,
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );
        
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (user && !authError) {
          userId = user.id;
        }
      }

      // 2. Parse payload
      const { amount, method, customer } = await req.json();
      if (!amount || !method || !['pix', 'boleto', 'credit_card'].includes(method)) {
        return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
      }

      // 3. Call Cora API
      const coraApiUrl = Deno.env.get('CORA_API_URL') || 'https://api.cora.com.br/v1';
      const coraToken = Deno.env.get('CORA_API_KEY'); // simplified auth for now

      const coraPayload = {
        amount: amount,
        method: method,
        customer: customer || (userId ? { id: userId } : null)
      };

      // Mocking the call to Cora for now, assuming standard fetch
      /*
      const coraResponse = await fetch(`${coraApiUrl}/payments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${coraToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(coraPayload)
      });
      const coraData = await coraResponse.json();
      */
     
      // Mock Cora response
      const coraData = {
        id: `cora_${Math.random().toString(36).substr(2, 9)}`,
        status: 'created',
        payment_info: method === 'pix' ? { qrcode: '...' } : method === 'boleto' ? { barcode: '...' } : { authorization: '...' }
      };

      // 4. Save to Database
      const { data: insertData, error: dbError } = await supabase
        .from('cora_payments')
        .insert({
          user_id: userId,
          amount: amount,
          payment_method: method,
          cora_transaction_id: coraData.id,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        return new Response(JSON.stringify({ error: dbError.message }), { status: 500 });
      }

      // 5. Return success
      return new Response(JSON.stringify({ 
        success: true, 
        payment: insertData,
        cora_info: coraData.payment_info
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
