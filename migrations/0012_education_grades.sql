-- A CV states a result, not just a qualification. Keep it as one free-text
-- value so any scale (letter grade, aggregate points, GPA, classification) can
-- be recorded without forcing a local taxonomy.
alter table jobseeker_education add column if not exists grade text not null default '';
