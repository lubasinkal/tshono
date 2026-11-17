-- Structured fields for labour-market analytics. All nullable except the three
-- that every employer can answer in one click.
alter table jobs
  add column if not exists occupation text,
  add column if not exists employment_type text,
  add column if not exists vacancies int not null default 1,
  add column if not exists work_mode text,
  add column if not exists education_level text,
  add column if not exists salary_min int,
  add column if not exists salary_max int,
  add column if not exists salary_period text,
  add column if not exists contract_months int,
  add column if not exists district text,
  add column if not exists closed_at timestamptz;

create index if not exists jobs_occupation_idx on jobs (occupation);
create index if not exists jobs_district_idx on jobs (district);
create index if not exists jobs_posted_idx on jobs (posted_at desc);
