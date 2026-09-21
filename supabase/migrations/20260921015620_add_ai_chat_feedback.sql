create table if not exists public.ai_chat_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  rating smallint check (rating in (-1, 1)) not null,
  prompt text not null,
  response text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.ai_chat_feedback enable row level security;

-- Políticas de RLS
-- Permitir que usuários autenticados insiram feedback associado a eles mesmos
create policy "Users can insert their own feedback"
on public.ai_chat_feedback for insert
to authenticated
with check (auth.uid() = user_id);

-- Permitir que usuários leiam seu próprio feedback
create policy "Users can read their own feedback"
on public.ai_chat_feedback for select
to authenticated
using (auth.uid() = user_id);
