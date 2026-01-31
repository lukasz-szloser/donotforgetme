-- Packing Helper Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Packing Lists Table
create table if not exists packing_lists (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  shared boolean default false
);

-- Packing Items Table (with support for nested/recursive items)
create table if not exists packing_items (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  checked boolean default false,
  parent_id uuid references packing_items(id) on delete cascade,
  list_id uuid references packing_lists(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index if not exists packing_lists_user_id_idx on packing_lists(user_id);
create index if not exists packing_items_list_id_idx on packing_items(list_id);
create index if not exists packing_items_parent_id_idx on packing_items(parent_id);
create index if not exists packing_items_user_id_idx on packing_items(user_id);

-- Enable Row Level Security
alter table packing_lists enable row level security;
alter table packing_items enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own lists" on packing_lists;
drop policy if exists "Users can create their own lists" on packing_lists;
drop policy if exists "Users can update their own lists" on packing_lists;
drop policy if exists "Users can delete their own lists" on packing_lists;

drop policy if exists "Users can view items from their lists" on packing_items;
drop policy if exists "Users can create items in their lists" on packing_items;
drop policy if exists "Users can update their items" on packing_items;
drop policy if exists "Users can delete their items" on packing_items;

-- Policies for packing_lists
create policy "Users can view their own lists"
  on packing_lists for select
  using (auth.uid() = user_id);

create policy "Users can create their own lists"
  on packing_lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own lists"
  on packing_lists for update
  using (auth.uid() = user_id);

create policy "Users can delete their own lists"
  on packing_lists for delete
  using (auth.uid() = user_id);

-- Policies for packing_items
create policy "Users can view items from their lists"
  on packing_items for select
  using (auth.uid() = user_id);

create policy "Users can create items in their lists"
  on packing_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their items"
  on packing_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their items"
  on packing_items for delete
  using (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers to automatically update updated_at
drop trigger if exists update_packing_lists_updated_at on packing_lists;
create trigger update_packing_lists_updated_at
  before update on packing_lists
  for each row
  execute procedure update_updated_at_column();

drop trigger if exists update_packing_items_updated_at on packing_items;
create trigger update_packing_items_updated_at
  before update on packing_items
  for each row
  execute procedure update_updated_at_column();

-- Enable Realtime for collaborative features
alter publication supabase_realtime add table packing_lists;
alter publication supabase_realtime add table packing_items;
