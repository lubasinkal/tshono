-- Jobseeker account data. Deliberately the same shape as the structured job
-- fields (occupation, sector, place, mode, years, salary) so jobs can be matched
-- against it without parsing free text. No CV uploads: nothing here is a file.
create table if not exists jobseeker_profiles (
  user_id text primary key references "user"(id) on delete cascade,
  headline text not null default '',
  occupation text not null default '',
  sector text not null default '',
  location text not null default 'Botswana',
  work_mode text not null default '',
  employment_type text not null default '',
  education_level text not null default '',
  years int not null default 0,
  salary_min int,
  salary_period text not null default '',
  skills text not null default '',
  about text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobseeker_profiles_occupation_idx
  on jobseeker_profiles (occupation, location);
