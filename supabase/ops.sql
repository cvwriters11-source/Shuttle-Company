-- Public client tracking helper. Run in the Supabase SQL editor if /track links show "Trip not found".
create or replace function public.track_trip(p_code text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'id', t.id,
    'pickup', t.pickup,
    'dropoff', t.dropoff,
    'pickup_at', t.pickup_at,
    'passengers', t.passengers,
    'status', t.status,
    'updated_at', t.updated_at,
    'client_name', c.full_name,
    'driver_name', d.full_name,
    'driver_phone', d.phone,
    'events', coalesce((
      select json_agg(json_build_object(
        'id', e.id,
        'status', e.status,
        'note', e.note,
        'created_at', e.created_at
      ) order by e.created_at)
      from public.trip_events e
      where e.trip_id = t.id
    ), '[]'::json)
  )
  from public.trips t
  join public.clients c on c.id = t.client_id
  left join public.profiles d on d.id = t.driver_id
  where t.tracking_code = p_code;
$$;

revoke all on function public.track_trip(text) from public;
grant execute on function public.track_trip(text) to anon, authenticated;
