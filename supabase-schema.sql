-- Amazin Store — run once in Supabase Dashboard → SQL Editor

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read product-images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Anon upload product-images"
on storage.objects for insert
with check (bucket_id = 'product-images');

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  buyer_name text not null,
  buyer_email text,
  last_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender_role text not null check (sender_role in ('buyer', 'admin')),
  sender_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_thread_id_idx on public.chat_messages(thread_id);
create index if not exists chat_threads_updated_at_idx on public.chat_threads(updated_at desc);

alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

create policy "Anyone read threads" on public.chat_threads for select using (true);
create policy "Anyone insert threads" on public.chat_threads for insert with check (true);
create policy "Anyone update threads" on public.chat_threads for update using (true);

create policy "Anyone read messages" on public.chat_messages for select using (true);
create policy "Anyone insert messages" on public.chat_messages for insert with check (true);