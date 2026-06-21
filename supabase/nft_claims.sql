create table if not exists public.nft_claims (
  id text primary key,
  report_hash text not null unique,
  report_id text,
  address text not null unique,
  receiver text not null,
  username text,
  handle text,
  language text not null default 'zh',
  personality text not null,
  personality_id text not null,
  rarity_tier integer not null,
  rarity_label text not null,
  rarity_supply_cap integer not null,
  rarity_serial integer,
  degen integer not null,
  diamond integer not null,
  airdrop integer not null,
  mystic_traits jsonb not null default '{}'::jsonb,
  badges jsonb not null default '[]'::jsonb,
  verdict text,
  loss_cause text,
  metadata_url text,
  image_url text,
  token_id integer,
  tx_hash text,
  status text not null default 'pending',
  error text,
  created_at timestamptz not null default now(),
  minted_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint nft_claims_address_check check (address ~ '^0x[0-9A-Fa-f]{40}$'),
  constraint nft_claims_receiver_check check (receiver ~ '^0x[0-9A-Fa-f]{40}$'),
  constraint nft_claims_rarity_tier_check check (rarity_tier between 0 and 6),
  constraint nft_claims_scores_check check (
    degen between 0 and 100
    and diamond between 0 and 100
    and airdrop between 0 and 100
  ),
  constraint nft_claims_status_check check (status in ('pending', 'minting', 'minted', 'failed'))
);

alter table public.nft_claims
  add column if not exists badges jsonb not null default '[]'::jsonb,
  add column if not exists verdict text,
  add column if not exists loss_cause text;

create index if not exists nft_claims_receiver_idx
  on public.nft_claims (receiver, created_at desc);

create unique index if not exists nft_claims_address_unique_idx
  on public.nft_claims (lower(address));

create unique index if not exists nft_claims_receiver_unique_idx
  on public.nft_claims (lower(receiver));

create unique index if not exists nft_claims_username_unique_idx
  on public.nft_claims (lower(username))
  where username is not null and username <> '';

create index if not exists nft_claims_status_idx
  on public.nft_claims (status, created_at desc);

create index if not exists nft_claims_created_idx
  on public.nft_claims (created_at desc, status);

create unique index if not exists nft_claims_rarity_serial_idx
  on public.nft_claims (rarity_tier, rarity_serial)
  where rarity_serial is not null;

alter table public.nft_claims enable row level security;

grant select on public.nft_claims to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'nft_claims'
      and policyname = 'Public NFT claim read'
  ) then
    create policy "Public NFT claim read"
      on public.nft_claims
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;
