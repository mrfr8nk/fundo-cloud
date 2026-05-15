
-- Roles enum + table (security best practice: roles in separate table)
create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Files
create table public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  r2_key text not null unique,
  mime_type text not null,
  size_bytes bigint not null default 0,
  visibility text not null default 'private', -- 'public' | 'private'
  folder text not null default '/',
  tags text[] not null default '{}',
  favorite boolean not null default false,
  download_count bigint not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.files enable row level security;
create index files_user_idx on public.files(user_id);
create index files_folder_idx on public.files(user_id, folder);

-- API keys
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  key_prefix text not null,        -- shown to user, e.g. fundo_live_abc1
  key_hash text not null unique,   -- sha256 of full key
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.api_keys enable row level security;
create index api_keys_user_idx on public.api_keys(user_id);

-- Usage logs
create table public.usage_logs (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  api_key_id uuid references public.api_keys(id) on delete set null,
  action text not null,            -- upload | download | delete | list
  bytes bigint not null default 0,
  status int not null default 200,
  file_id uuid references public.files(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.usage_logs enable row level security;
create index usage_user_time_idx on public.usage_logs(user_id, created_at desc);

-- Quotas
create table public.quotas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  storage_limit_bytes bigint not null default 5368709120,    -- 5 GB
  bandwidth_limit_bytes bigint not null default 53687091200, -- 50 GB / month
  storage_used_bytes bigint not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.quotas enable row level security;

-- RLS policies
-- profiles
create policy "profiles_self_read" on public.profiles for select using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_self_insert" on public.profiles for insert with check (auth.uid() = id);

-- user_roles
create policy "roles_self_read" on public.user_roles for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "roles_admin_all" on public.user_roles for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- files
create policy "files_owner_read" on public.files for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin') or visibility = 'public');
create policy "files_owner_insert" on public.files for insert with check (auth.uid() = user_id);
create policy "files_owner_update" on public.files for update using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "files_owner_delete" on public.files for delete using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

-- api_keys
create policy "keys_owner_all" on public.api_keys for all using (auth.uid() = user_id or public.has_role(auth.uid(),'admin')) with check (auth.uid() = user_id);

-- usage_logs
create policy "logs_owner_read" on public.usage_logs for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "logs_owner_insert" on public.usage_logs for insert with check (auth.uid() = user_id);

-- quotas
create policy "quotas_owner_read" on public.quotas for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "quotas_admin_update" on public.quotas for update using (public.has_role(auth.uid(),'admin'));
create policy "quotas_self_insert" on public.quotas for insert with check (auth.uid() = user_id);

-- Auto-create profile + default role + quota on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url');
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  insert into public.quotas (user_id) values (new.id);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
