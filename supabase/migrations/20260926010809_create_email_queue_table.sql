create extension if not exists "uuid-ossp";

create table email_queue (
    id uuid primary key default uuid_generate_v4(),
    email text not null,
    status text not null default 'pending',
    error_message text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (opcional mas recomendado)
alter table email_queue enable row level security;

-- Apenas admins ou functions de server devem gerenciar essa tabela, 
-- não vamos adicionar políticas públicas
