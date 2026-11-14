-- Make Postgres the primary store for every job, scraped or employer-posted.
-- Typesense becomes a derived index that can be rebuilt with scripts/reindex.ts.

alter table jobs add column if not exists source text not null default 'employer';
alter table jobs add column if not exists external_id text;
alter table jobs add column if not exists company text;
alter table jobs add column if not exists dedupe_key text;
alter table jobs alter column organization_id drop not null;

create unique index if not exists jobs_source_external_uidx
  on jobs (source, external_id) where external_id is not null;
create index if not exists jobs_dedupe_idx on jobs (dedupe_key);
