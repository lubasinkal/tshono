-- A jobseeker applying to one of the employer's jobs. The row is also that
-- employer's permission to read the profile, independent of the public
-- visibility flag: applying to a job shares yourself with that employer.
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  user_id text not null references "user"(id) on delete cascade,
  note text not null default '',
  status text not null default 'new' check (status in ('new', 'shortlisted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, user_id)
);

create index if not exists applications_job_idx on applications (job_id, created_at desc);
create index if not exists applications_user_idx on applications (user_id, created_at desc);
