create table if not exists public.onchain_leaderboard (
  id text primary key,
  username text not null,
  handle text not null,
  name text not null,
  avatar_url text not null,
  profile_url text not null,
  address text not null,
  short_address text not null,
  personality text not null,
  personality_id text not null,
  degen integer not null,
  diamond integer not null,
  airdrop integer not null,
  rank_score numeric(6, 2) not null,
  degen_band text not null,
  labels jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  language text not null default 'zh',
  updated_at timestamptz not null default now(),
  constraint onchain_leaderboard_username_check check (username ~ '^[A-Za-z0-9_]{1,15}$'),
  constraint onchain_leaderboard_address_check check (address ~ '^0x[0-9A-Fa-f]{40}$'),
  constraint onchain_leaderboard_degen_check check (degen between 0 and 100),
  constraint onchain_leaderboard_diamond_check check (diamond between 0 and 100),
  constraint onchain_leaderboard_airdrop_check check (airdrop between 0 and 100),
  constraint onchain_leaderboard_rank_score_check check (rank_score between 0 and 100),
  constraint onchain_leaderboard_language_check check (language in ('zh', 'en'))
);

create index if not exists onchain_leaderboard_rank_idx
  on public.onchain_leaderboard (rank_score desc, generated_at desc);

create index if not exists onchain_leaderboard_address_idx
  on public.onchain_leaderboard (address);

create unique index if not exists onchain_leaderboard_username_unique_idx
  on public.onchain_leaderboard (lower(username));

create unique index if not exists onchain_leaderboard_address_unique_idx
  on public.onchain_leaderboard (lower(address));

alter table public.onchain_leaderboard enable row level security;

grant select on public.onchain_leaderboard to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'onchain_leaderboard'
      and policyname = 'Public leaderboard read'
  ) then
    create policy "Public leaderboard read"
      on public.onchain_leaderboard
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;
