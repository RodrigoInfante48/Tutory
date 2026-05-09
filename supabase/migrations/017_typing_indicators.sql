create table if not exists public.typing_indicators (
  user_id          uuid not null references public.users(id) on delete cascade,
  conversation_with uuid not null references public.users(id) on delete cascade,
  updated_at       timestamptz not null default now(),
  primary key (user_id, conversation_with)
);

alter table public.typing_indicators enable row level security;

create policy "Own typing indicators"
  on public.typing_indicators
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Read indicators addressed to me"
  on public.typing_indicators
  for select
  using (auth.uid() = conversation_with);

-- Allow realtime replication
alter publication supabase_realtime add table public.typing_indicators;
