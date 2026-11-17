-- CV detail and employer discoverability. Employers may only read a profile
-- when visible_to_employers is true; the future candidate queries filter on it.
alter table jobseeker_profiles
  add column if not exists visible_to_employers boolean not null default false,
  add column if not exists relocate boolean not null default false,
  add column if not exists available_from date,
  add column if not exists languages text not null default '',
  add column if not exists certifications text not null default '';

-- CV sections are owned rows, replaced as a set whenever the profile is saved.
create table if not exists jobseeker_experience (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references "user"(id) on delete cascade,
  title text not null,
  company text not null,
  start_date date not null,
  end_date date,
  current boolean not null default false,
  description text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists jobseeker_experience_user_idx
  on jobseeker_experience (user_id, start_date desc);

create table if not exists jobseeker_education (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references "user"(id) on delete cascade,
  institution text not null,
  qualification text not null,
  field text not null default '',
  year int,
  created_at timestamptz not null default now()
);

create index if not exists jobseeker_education_user_idx
  on jobseeker_education (user_id, year desc);
