import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function manageAdmin() {
  const args = process.argv.slice(2)
  const action = args.find(a => a.startsWith('--action='))?.split('=')[1]
  const email = args.find(a => a.startsWith('--email='))?.split('=')[1]
  const password = args.find(a => a.startsWith('--password='))?.split('=')[1]
  const fullName = args.find(a => a.startsWith('--fullname='))?.split('=')[1]

  if (!action || !email) {
    console.error('Uso: npx tsx scripts/manage-admin.ts --action=[create|update] --email=email@exemplo.com --password=senha --fullname="Admin Nome"')
    process.exit(1)
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Variáveis de ambiente ausentes: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  // Create admin client with service_role_key
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log(`Gerenciando admin no Supabase Uni em: ${SUPABASE_URL} para o usuário ${email}...`)

  try {
    let userId: string

    if (action === 'create') {
      if (!password) throw new Error('Password is required for creation')
      
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName || 'Administrator' }
      })

      if (authError) throw authError
      userId = authData.user.id
      console.log('Usuário Auth criado com sucesso via Admin SDK.')
    } else if (action === 'update') {
      // Find user by email
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      if (listError) throw listError
      
      const user = listData.users.find(u => u.email === email)
      if (!user) throw new Error('Usuário não encontrado')
      userId = user.id

      if (password) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password })
        if (updateError) throw updateError
        console.log('Senha atualizada com sucesso via Admin SDK.')
      }
    } else {
      throw new Error('Ação inválida. Use "create" ou "update"')
    }

    // Ensure profile has admin role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: userId, 
        full_name: fullName || 'Administrator', 
        role: 'admin',
        updated_at: new Date().toISOString()
      })

    if (profileError) throw profileError
    console.log('Perfil atualizado para role=admin na tabela "profiles".')

    console.log('---')
    console.log(`Sucesso: Usuário ${email} ${action === 'create' ? 'criado' : 'atualizado'} como administrador.`)
    console.log('User ID:', userId)
    
  } catch (err: any) {
    console.error('Erro:', err.message)
    process.exit(1)
  }
}

manageAdmin()
