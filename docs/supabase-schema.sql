-- ================================================================
-- NyayaAI — Complete Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- for text search

-- ── ENUMS ───────────────────────────────────────────────────────
create type user_role as enum ('citizen', 'lawyer', 'admin');
create type case_status as enum ('open', 'closed', 'pending', 'hearing');
create type embedding_status as enum ('pending', 'processing', 'done', 'failed');
create type citation_type as enum ('overruled', 'followed', 'distinguished', 'referred');


-- ── TABLE: profiles ─────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  role          user_role not null default 'citizen',
  language      text not null default 'en',
  avatar_url    text,
  bar_council_id text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, language)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'citizen'),
    'en'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();


-- ── TABLE: cases ────────────────────────────────────────────────
create table public.cases (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  title         text not null,
  description   text,
  court         text,
  case_number   text,
  status        case_status not null default 'open',
  ipc_sections  text[] default '{}',
  summary       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index cases_user_id_idx on public.cases(user_id);
create index cases_status_idx on public.cases(status);

create trigger cases_updated_at before update on public.cases
  for each row execute procedure public.update_updated_at();


-- ── TABLE: documents ────────────────────────────────────────────
create table public.documents (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  case_id          uuid references public.cases(id) on delete set null,
  file_name        text not null,
  file_url         text not null,
  file_size        bigint not null default 0,
  mime_type        text not null,
  ocr_text         text,
  summary          text,
  embedding_status embedding_status not null default 'pending',
  created_at       timestamptz not null default now()
);

create index documents_user_id_idx on public.documents(user_id);
create index documents_case_id_idx on public.documents(case_id);
create index documents_embedding_idx on public.documents(embedding_status);
create index documents_ocr_trgm on public.documents using gin(ocr_text gin_trgm_ops);


-- ── TABLE: chat_sessions ────────────────────────────────────────
create table public.chat_sessions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text,
  language   text not null default 'en',
  messages   jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index chat_sessions_user_id_idx on public.chat_sessions(user_id);
create index chat_sessions_updated_idx on public.chat_sessions(updated_at desc);

create trigger chat_sessions_updated_at before update on public.chat_sessions
  for each row execute procedure public.update_updated_at();


-- ── TABLE: judgments ────────────────────────────────────────────
create table public.judgments (
  id               uuid primary key default uuid_generate_v4(),
  case_name        text not null,
  court            text not null,
  year             integer not null,
  citation         text,
  full_text        text,
  summary          text,
  ipc_sections     text[] default '{}',
  keywords         text[] default '{}',
  embedding_status embedding_status not null default 'pending',
  created_at       timestamptz not null default now()
);

create index judgments_court_year_idx on public.judgments(court, year);
create index judgments_ipc_idx on public.judgments using gin(ipc_sections);
create index judgments_keywords_idx on public.judgments using gin(keywords);
create index judgments_embedding_idx on public.judgments(embedding_status);
create index judgments_text_search on public.judgments using gin(to_tsvector('english', coalesce(case_name,'') || ' ' || coalesce(summary,'')));


-- ── TABLE: legal_sections ────────────────────────────────────────
create table public.legal_sections (
  id               uuid primary key default uuid_generate_v4(),
  act              text not null,  -- 'IPC', 'BNS', 'CrPC', 'Constitution'
  section_number   text not null,
  title            text not null,
  description      text not null,
  punishment       text,
  bailable         boolean,
  cognizable       boolean,
  embedding_status embedding_status not null default 'pending',
  created_at       timestamptz not null default now(),
  unique(act, section_number)
);

create index legal_sections_act_idx on public.legal_sections(act);
create index legal_sections_text_search on public.legal_sections using gin(to_tsvector('english', title || ' ' || description));


-- ── TABLE: contracts ─────────────────────────────────────────────
create table public.contracts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  document_id  uuid references public.documents(id) on delete set null,
  title        text not null,
  party_a      text,
  party_b      text,
  risk_score   integer check (risk_score between 0 and 100),
  risky_clauses jsonb not null default '[]',
  summary      text,
  created_at   timestamptz not null default now()
);

create index contracts_user_id_idx on public.contracts(user_id);


-- ── TABLE: citations ─────────────────────────────────────────────
create table public.citations (
  id                uuid primary key default uuid_generate_v4(),
  from_judgment_id  uuid not null references public.judgments(id) on delete cascade,
  to_judgment_id    uuid not null references public.judgments(id) on delete cascade,
  citation_type     citation_type not null default 'referred',
  created_at        timestamptz not null default now(),
  unique(from_judgment_id, to_judgment_id)
);

create index citations_from_idx on public.citations(from_judgment_id);
create index citations_to_idx on public.citations(to_judgment_id);


-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

alter table public.profiles       enable row level security;
alter table public.cases          enable row level security;
alter table public.documents      enable row level security;
alter table public.chat_sessions  enable row level security;
alter table public.contracts      enable row level security;
alter table public.judgments      enable row level security;
alter table public.legal_sections enable row level security;
alter table public.citations      enable row level security;

-- profiles: users can read/update their own
create policy "profiles_own_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_own_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_own_insert" on public.profiles for insert with check (auth.uid() = id);

-- cases: users manage their own
create policy "cases_own_all" on public.cases for all using (auth.uid() = user_id);

-- documents: users manage their own
create policy "documents_own_all" on public.documents for all using (auth.uid() = user_id);

-- chat_sessions: users manage their own
create policy "chat_sessions_own_all" on public.chat_sessions for all using (auth.uid() = user_id);

-- contracts: users manage their own
create policy "contracts_own_all" on public.contracts for all using (auth.uid() = user_id);

-- judgments: public read, service role write
create policy "judgments_public_read" on public.judgments for select using (true);

-- legal_sections: public read
create policy "legal_sections_public_read" on public.legal_sections for select using (true);

-- citations: public read
create policy "citations_public_read" on public.citations for select using (true);


-- ================================================================
-- STORAGE BUCKET
-- ================================================================

insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

create policy "docs_own_upload" on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "docs_own_read" on storage.objects for select
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "docs_own_delete" on storage.objects for delete
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

-- Done! All 8 tables created with RLS + indexes + storage bucket.
