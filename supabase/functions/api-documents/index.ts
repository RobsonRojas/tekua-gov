import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { action, params } = await req.json()

    let responseData: any = null

    switch (action) {
      case 'fetchDocuments': {
        const { data, error } = await supabaseClient
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        responseData = data
        break
      }

      case 'registerDocument': {
        const { title, description, category, filePath } = params
        if (!title || !category || !filePath) throw new Error('Missing document details')

        const { data, error } = await supabaseClient
          .from('documents')
          .insert([{ 
            title, 
            description, 
            category, 
            file_path: filePath,
            created_by: user.id,
            created_at: new Date().toISOString()
          }])
          .select()

        if (error) throw error
        responseData = data
        break
      }

      case 'deleteDocument': {
        const { id } = params
        if (!id) throw new Error('Missing document ID')

        // 1. Get file path first
        const { data: doc, error: docError } = await supabaseClient
          .from('documents')
          .select('file_path, created_by')
          .eq('id', id)
          .single()
        
        if (docError || !doc) throw new Error('Document not found')

        // 2. Only owner or admin can delete
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (doc.created_by !== user.id && profile?.role !== 'admin') {
          throw new Error('Forbidden')
        }

        // 3. Delete from DB
        const { error: deleteError } = await supabaseClient
          .from('documents')
          .delete()
          .eq('id', id)

        if (deleteError) throw deleteError
        responseData = { success: true, filePath: doc.file_path }
        break
      }

      case 'getAIContext': {
        const { data, error } = await supabaseClient
          .from('documents')
          .select('title, description, category')
        
        if (error) throw error
        responseData = data
        break
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify({ data: responseData, error: null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ data: null, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
