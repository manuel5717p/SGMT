-- Execute this function in your Supabase SQL Editor to enable flexible search
-- It searches in both Workshop Name and Service Names

create or replace function search_workshops(search_term text)
returns setof workshops_with_rating
language sql
as $$
  select distinct w.*
  from workshops_with_rating w
  left join services s on w.id = s.workshop_id
  where
    -- Match workshop name (partial, case-insensitive)
    w.name ilike '%' || search_term || '%'
    or
    -- Match any service name provided by the workshop
    s.name ilike '%' || search_term || '%';
$$;
