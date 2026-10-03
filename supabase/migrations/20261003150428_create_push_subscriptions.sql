create table push_subscriptions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    endpoint text not null,
    p256dh text not null,
    auth text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    unique (endpoint)
);

alter table push_subscriptions enable row level security;

create policy "Users can view own push subscriptions"
    on push_subscriptions for select
    using (auth.uid() = user_id);

create policy "Users can insert own push subscriptions"
    on push_subscriptions for insert
    with check (auth.uid() = user_id);

create policy "Users can update own push subscriptions"
    on push_subscriptions for update
    using (auth.uid() = user_id);

create policy "Users can delete own push subscriptions"
    on push_subscriptions for delete
    using (auth.uid() = user_id);

-- trigger to update updated_at
create trigger handle_push_subscriptions_updated_at before update on push_subscriptions
  for each row execute procedure moddatetime (updated_at);
