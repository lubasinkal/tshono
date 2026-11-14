-- Optional employer-written instructions for how to apply.
alter table jobs add column if not exists apply_instructions text not null default '';
