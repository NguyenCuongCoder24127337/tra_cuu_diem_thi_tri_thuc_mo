alter table if exists public.result
  add column if not exists full_name text,
  add column if not exists class_name text,
  add column if not exists dob date,
  add column if not exists username text,
  add column if not exists account text,
  add column if not exists password_hash text,
  add column if not exists must_change_password boolean default true,
  add column if not exists toan numeric(4,2) default 0,
  add column if not exists li numeric(4,2) default 0,
  add column if not exists hoa numeric(4,2) default 0,
  add column if not exists tieng_anh numeric(4,2) default 0,
  add column if not exists van numeric(4,2) default 0;

update public.result
set account = username
where account is null and username is not null;

create unique index if not exists uq_result_account on public.result(account);
