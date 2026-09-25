-- Tabela para persistir o histórico de chat do Oráculo por usuário
create table if not exists public.ai_chat_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade not null,
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índice para busca rápida por user_id (já é PK, mas explícito para clareza)
comment on table public.ai_chat_sessions is 'Stores the Oracle chat history per user as a JSONB array of messages.';

-- Habilitar RLS
alter table public.ai_chat_sessions enable row level security;

-- Permitir que usuários leiam seu próprio registro
create policy "Users can read their own chat session"
on public.ai_chat_sessions for select
to authenticated
using (auth.uid() = user_id);

-- Permitir que usuários criem seu próprio registro
create policy "Users can insert their own chat session"
on public.ai_chat_sessions for insert
to authenticated
with check (auth.uid() = user_id);

-- Permitir que usuários atualizem seu próprio registro
create policy "Users can update their own chat session"
on public.ai_chat_sessions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
