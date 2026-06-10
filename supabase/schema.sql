create table if not exists public.invitations (
  id bigint generated always as identity primary key,
  code text not null unique,
  recipient_name text not null,
  status text not null default 'Pending',
  created_at timestamp with time zone not null default now(),
  completed_at timestamp with time zone,
  constraint invitations_code_format check (code ~ '^[a-z0-9]{6,24}$'),
  constraint invitations_recipient_name_length check (
    char_length(btrim(recipient_name)) between 1 and 80
  ),
  constraint invitations_status_check check (status in ('Pending', 'Completed'))
);

create table if not exists public.responses (
  id bigint generated always as identity primary key,
  invite_id bigint,
  invite_code text,
  recipient_name text,
  date date not null,
  "time" time without time zone not null,
  activity text not null,
  food text not null,
  submitted_at timestamp with time zone not null default now()
);

alter table public.responses
  add column if not exists invite_id bigint,
  add column if not exists invite_code text,
  add column if not exists recipient_name text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'responses_invite_id_fkey'
      and conrelid = 'public.responses'::regclass
  ) then
    alter table public.responses
      add constraint responses_invite_id_fkey
      foreign key (invite_id)
      references public.invitations (id)
      on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'responses_invite_id_key'
      and conrelid = 'public.responses'::regclass
  ) then
    alter table public.responses
      add constraint responses_invite_id_key unique (invite_id);
  end if;
end $$;

alter table public.invitations enable row level security;
alter table public.responses enable row level security;

create index if not exists invitations_created_at_idx
  on public.invitations (created_at desc);

create index if not exists invitations_status_idx
  on public.invitations (status);

create index if not exists responses_invite_code_idx
  on public.responses (invite_code);

create index if not exists responses_submitted_at_idx
  on public.responses (submitted_at desc);

create or replace function public.complete_invitation(
  p_invite_code text,
  p_date date,
  p_time time without time zone,
  p_activity text,
  p_food text
)
returns table (
  id bigint,
  invite_code text,
  recipient_name text,
  date date,
  "time" time without time zone,
  activity text,
  food text,
  submitted_at timestamp with time zone
)
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_invitation public.invitations%rowtype;
  saved_response public.responses%rowtype;
begin
  select *
    into selected_invitation
    from public.invitations
    where code = lower(btrim(p_invite_code))
    for update;

  if not found then
    raise exception 'INVITATION_NOT_FOUND' using errcode = 'P0002';
  end if;

  if selected_invitation.status <> 'Pending' then
    raise exception 'INVITATION_ALREADY_COMPLETED' using errcode = 'P0001';
  end if;

  insert into public.responses (
    invite_id,
    invite_code,
    recipient_name,
    date,
    "time",
    activity,
    food,
    submitted_at
  )
  values (
    selected_invitation.id,
    selected_invitation.code,
    selected_invitation.recipient_name,
    p_date,
    p_time,
    p_activity,
    p_food,
    now()
  )
  returning * into saved_response;

  update public.invitations
    set status = 'Completed',
        completed_at = saved_response.submitted_at
    where id = selected_invitation.id;

  return query
    select
      saved_response.id,
      saved_response.invite_code,
      saved_response.recipient_name,
      saved_response.date,
      saved_response."time",
      saved_response.activity,
      saved_response.food,
      saved_response.submitted_at;
exception
  when unique_violation then
    raise exception 'INVITATION_ALREADY_COMPLETED' using errcode = 'P0001';
end;
$$;

revoke all on function public.complete_invitation(
  text,
  date,
  time without time zone,
  text,
  text
) from anon, authenticated;

grant execute on function public.complete_invitation(
  text,
  date,
  time without time zone,
  text,
  text
) to service_role;
