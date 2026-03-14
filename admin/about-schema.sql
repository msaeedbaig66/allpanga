create extension if not exists pgcrypto;

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  title text,
  subtitle text,
  body text,
  button_text text,
  button_link text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists page_sections_page_key_section_key_uidx
  on public.page_sections (page_key, section_key);

create index if not exists page_sections_page_key_idx
  on public.page_sections (page_key);

create index if not exists page_sections_section_key_idx
  on public.page_sections (section_key);

create table if not exists public.page_media (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  image_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists page_media_page_key_idx
  on public.page_media (page_key);

create index if not exists page_media_section_key_idx
  on public.page_media (section_key);
