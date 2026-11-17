-- Paid employer plans: plan_until drives the job cap and the plan label.
alter table employer_profiles add column if not exists plan_until timestamptz;
