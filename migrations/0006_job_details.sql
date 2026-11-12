-- Structured role detail shown on the job page, separate from the free-text advert.
alter table jobs add column if not exists responsibilities text not null default '';
alter table jobs add column if not exists requirements text not null default '';
