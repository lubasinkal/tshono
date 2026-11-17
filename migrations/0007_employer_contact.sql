-- Employer contact details beyond the org name.
alter table employer_profiles add column if not exists email text not null default '';
alter table employer_profiles add column if not exists address text not null default '';
