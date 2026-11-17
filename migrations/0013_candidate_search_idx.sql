-- Candidate search reads only visible profiles, newest first. A partial index
-- keeps that ordered scan flat as the profile table grows.
create index if not exists jobseeker_profiles_visible_idx
  on jobseeker_profiles (updated_at desc)
  where visible_to_employers;
