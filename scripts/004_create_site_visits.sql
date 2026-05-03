create table if not exists public.site_visits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  page_path text not null,
  session_id text not null,
  user_agent text
);

create index if not exists site_visits_created_at_idx
  on public.site_visits (created_at desc);

create index if not exists site_visits_page_path_idx
  on public.site_visits (page_path);

create index if not exists site_visits_session_id_idx
  on public.site_visits (session_id);
