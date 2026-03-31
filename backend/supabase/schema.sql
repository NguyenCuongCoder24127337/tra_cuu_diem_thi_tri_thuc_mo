create extension if not exists "pgcrypto";

drop table if exists public.result cascade;

create table if not exists public.result (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  class_name text not null,
  dob date,
  username text not null unique,
  account text not null unique,
  password_hash text not null,
  must_change_password boolean not null default true,
  toan numeric(4,2) not null default 0,
  li numeric(4,2) not null default 0,
  hoa numeric(4,2) not null default 0,
  tieng_anh numeric(4,2) not null default 0,
  van numeric(4,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_result_full_name_class on public.result(full_name, class_name);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_result_updated_at on public.result;
create trigger trg_result_updated_at
before update on public.result
for each row
execute procedure public.touch_updated_at();
