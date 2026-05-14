create table if not exists public.horairetracker_entries (
  uid text primary key,
  sync_token text not null,
  id bigint not null,
  date text not null,
  type text not null,
  arrive text,
  depart text,
  pause numeric not null default 0,
  contrat numeric not null default 35,
  note text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists horairetracker_entries_sync_token_idx
  on public.horairetracker_entries (sync_token);

create index if not exists horairetracker_entries_date_idx
  on public.horairetracker_entries (date);

alter table public.horairetracker_entries disable row level security;

grant select, insert, update, delete on public.horairetracker_entries to anon;
grant select, insert, update, delete on public.horairetracker_entries to authenticated;
