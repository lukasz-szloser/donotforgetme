-- 1. PROFILES (Publiczne dane użytkowników do wyświetlania awatarów)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Trigger: Automatycznie twórz profil po rejestracji w Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. PACKING LISTS (Listy)
create table packing_lists (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default false, -- Dla linków "tylko do odczytu"
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. COLLABORATORS (Kto ma dostęp do edycji poza właścicielem)
create table list_collaborators (
  list_id uuid references packing_lists(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text default 'editor', -- 'editor', 'viewer'
  primary key (list_id, user_id)
);

-- 4. PACKING ITEMS (Elementy rekurencyjne)
create table packing_items (
  id uuid default gen_random_uuid() primary key,
  list_id uuid references packing_lists(id) on delete cascade not null,
  parent_id uuid references packing_items(id) on delete cascade, -- Rekurencja
  title text not null,
  checked boolean default false,
  position integer default 0, -- Do sortowania Drag & Drop
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. AUTOMATYCZNE UPDATE_AT (Z Twojego pliku - to jest super!)
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_packing_lists_updated_at
  before update on packing_lists for each row execute procedure update_updated_at_column();

create trigger update_packing_items_updated_at
  before update on packing_items for each row execute procedure update_updated_at_column();

-- 6. ENABLE RLS (Bezpieczeństwo)
alter table profiles enable row level security;
alter table packing_lists enable row level security;
alter table list_collaborators enable row level security;
alter table packing_items enable row level security;

-- POLICY: Profiles (Każdy może widzieć podstawowe dane, edycja tylko swoje)
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- POLICY: Lists (Widzi Właściciel LUB Współpracownik)
create policy "Users can view own or shared lists" on packing_lists for select
using (
  auth.uid() = owner_id 
  OR 
  exists (select 1 from list_collaborators where list_id = packing_lists.id and user_id = auth.uid())
);

create policy "Users can create lists" on packing_lists for insert with check (auth.uid() = owner_id);

create policy "Owners can update lists" on packing_lists for update using (auth.uid() = owner_id);

-- POLICY: Items (Dostęp jeśli masz dostęp do Listy)
create policy "Access items if have access to list" on packing_items for all
using (
  exists (
    select 1 from packing_lists 
    where id = packing_items.list_id 
    and (
      owner_id = auth.uid() 
      or 
      exists (select 1 from list_collaborators where list_id = packing_lists.id and user_id = auth.uid())
    )
  )
);

-- 7. REALTIME
alter publication supabase_realtime add table packing_lists;
alter publication supabase_realtime add table packing_items;
alter publication supabase_realtime add table list_collaborators;