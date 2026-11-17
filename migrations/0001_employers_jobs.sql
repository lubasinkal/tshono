-- Employer profile attached to a Better Auth organization (employer account).
create table if not exists employer_profiles (
  organization_id text primary key references "organization"(id) on delete cascade,
  website text not null default '',
  about text not null default '',
  sector text not null default 'General',
  location text not null default 'Botswana',
  contact_name text not null default '',
  phone text not null default '',
  verified_at timestamptz,
  plan text not null default 'free',
  polar_customer_id text,
  created_at timestamptz not null default now()
);

-- Employer-posted jobs. Scraped jobs stay in Typesense only for now.
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references "organization"(id) on delete cascade,
  title text not null,
  sector text not null,
  location text not null,
  min_years int not null default 0,
  closing date,
  apply_url text not null,
  blurb text not null default '',
  content text not null default '',
  status text not null default 'live' check (status in ('live', 'closed')),
  posted_at timestamptz not null default now(),
  indexed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_org_idx on jobs (organization_id, created_at desc);
create index if not exists jobs_status_idx on jobs (status, posted_at desc);
