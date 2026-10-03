create table public.jr_chat_messages (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    role text not null check (role in ('user', 'model')),
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.jr_chat_messages enable row level security;

-- Política para seleção: usuários podem ver apenas suas próprias mensagens
create policy "Users can view their own chat messages"
    on public.jr_chat_messages for select
    using (auth.uid() = user_id);

-- Política para inserção: usuários podem inserir suas próprias mensagens
create policy "Users can insert their own chat messages"
    on public.jr_chat_messages for insert
    with check (auth.uid() = user_id);
