-- ============================================================
-- TYGA Platform — Initial schema migration
-- Tables are created in dependency order so every FK resolves.
-- ============================================================

-- ---------- Auth & Identity ----------

create table accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('parent', 'coach', 'admin')),
  full_name text,
  email text unique,
  phone text,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table levels (
  id serial primary key,
  name text not null,
  sort_order int not null,
  default_age_min int,
  default_age_max int,
  goal text,
  focus_summary text,
  upgrade_criteria text
);

create table venues (
  id serial primary key,
  name text not null,
  address text,
  type text check (type in ('practice_ground', 'course', 'range', 'school'))
);

create table members (
  id serial primary key,
  account_id uuid not null references accounts(id) on delete cascade,
  full_name text not null,
  dob date not null,
  gender text check (gender in ('male', 'female', 'any')),
  current_level_id int references levels(id),
  medical_notes text,
  emergency_contact text,
  created_at timestamptz not null default now()
);

-- NEW v4 — one questionnaire per member, not one per family
create table member_questionnaires (
  id serial primary key,
  member_id int not null unique references members(id) on delete cascade,
  availability jsonb,
  self_reported_skill_level text,
  interests jsonb,
  gear_owned jsonb,
  submitted_at timestamptz
);

create table coaches (
  id serial primary key,
  account_id uuid unique references accounts(id) on delete set null,
  coach_type text check (coach_type in ('head_coach', 'assistant_coach', 'volunteer')),
  linked_member_id int unique references members(id) on delete set null,
  max_student_ratio int
);

create table sensitive_data_access_log (
  id serial primary key,
  user_id uuid not null references accounts(id),
  member_id int not null references members(id),
  field_accessed text check (field_accessed in ('medical_notes', 'dob', 'emergency_contact')),
  accessed_at timestamptz not null default now(),
  reason text
);

-- ---------- People & Progression ----------

create table level_progressions (
  id serial primary key,
  member_id int not null references members(id),
  from_level_id int not null references levels(id),
  to_level_id int not null references levels(id),
  assessed_by int not null references coaches(id),
  date date not null default current_date,
  badge_complete boolean not null default false,
  notes text
);

-- ---------- Curriculum ----------

create table curriculum_modules (
  id serial primary key,
  level_id int not null references levels(id),
  category text check (category in ('technical', 'physical', 'mental_character', 'format')),
  name text not null,
  description text,
  is_milestone boolean not null default false
);

-- ---------- Structure & Scheduling ----------

create table programmes (
  id serial primary key,
  name text not null,
  type text check (type in ('development', 'weekly_community', 'holiday_camp', 'clinic', 'corporate', 'league')),
  level_id int references levels(id),
  min_age int,
  max_age int,
  gender_restriction text check (gender_restriction in ('male', 'female', 'any')),
  venue_id int not null references venues(id),
  recurrence_rule text,
  term_start date,
  term_end date,
  capacity int,
  price decimal(10,2),
  max_ratio int
);

create table programme_coaches (
  id serial primary key,
  programme_id int not null references programmes(id) on delete cascade,
  coach_id int not null references coaches(id) on delete cascade,
  role_in_programme text check (role_in_programme in ('lead', 'assistant', 'volunteer')),
  unique (programme_id, coach_id)
);

create table programme_sessions (
  id serial primary key,
  programme_id int not null references programmes(id) on delete cascade,
  session_date date not null,
  start_time time,
  end_time time,
  venue_id int references venues(id),
  status text check (status in ('scheduled', 'cancelled', 'completed')) default 'scheduled',
  coach_notes text
);

create table session_coaches (
  id serial primary key,
  session_id int not null references programme_sessions(id) on delete cascade,
  coach_id int not null references coaches(id) on delete cascade,
  role_in_session text check (role_in_session in ('lead', 'assistant', 'volunteer')),
  unique (session_id, coach_id)
);

create table session_curriculum_modules (
  id serial primary key,
  session_id int not null references programme_sessions(id) on delete cascade,
  curriculum_module_id int not null references curriculum_modules(id) on delete cascade
);

create table member_milestones (
  id serial primary key,
  member_id int not null references members(id),
  curriculum_module_id int not null references curriculum_modules(id),
  completed_at date,
  verified_by int references coaches(id),
  notes text
);

create table appointments (
  id serial primary key,
  member_id int not null references members(id),
  coach_id int references coaches(id),
  venue_id int not null references venues(id),
  type text check (type in ('assessment', 'parent_consultation')),
  requested_at timestamptz default now(),
  scheduled_at timestamptz,
  status text check (status in ('requested', 'scheduled', 'completed', 'cancelled', 'no_show')) default 'requested',
  assessed_level_id int references levels(id),
  notes text
);

create table enrollments (
  id serial primary key,
  member_id int not null references members(id),
  programme_id int not null references programmes(id),
  status text check (status in ('pending', 'active', 'paused', 'withdrawn', 'completed')) default 'pending',
  joined_at date default current_date,
  subsidised boolean default false
);

create table attendance (
  id serial primary key,
  session_id int not null references programme_sessions(id) on delete cascade,
  member_id int not null references members(id),
  status text check (status in ('present', 'absent', 'late', 'excused')),
  marked_by int not null references coaches(id),
  marked_at timestamptz not null default now(),
  unique (session_id, member_id)
);

-- ---------- One-off Bookings & Events (secondary) ----------

create table bookings (
  id serial primary key,
  member_id int not null references members(id),
  coach_id int not null references coaches(id),
  venue_id int not null references venues(id),
  session_date date not null,
  start_time time,
  duration_minutes int,
  rate decimal(10,2),
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending'
);

create table events (
  id serial primary key,
  name text not null,
  type text check (type in ('tournament', 'clinic', 'assessment', 'corporate', 'fun_tournament', 'parent_workshop')),
  min_age int,
  max_age int,
  venue_id int not null references venues(id),
  event_date date,
  entry_fee decimal(10,2) default 0,
  capacity int
);

create table event_registrations (
  id serial primary key,
  member_id int not null references members(id),
  event_id int not null references events(id),
  status text check (status in ('registered', 'waitlisted', 'withdrawn')) default 'registered',
  paid boolean default false
);

-- ---------- Money ----------

create table sponsorships (
  id serial primary key,
  donor_name text not null,
  amount decimal(10,2),
  date date,
  notes text
);

create table sponsorship_allocations (
  id serial primary key,
  sponsorship_id int not null references sponsorships(id),
  programme_id int references programmes(id),
  enrollment_id int references enrollments(id),
  amount decimal(10,2)
);

create table gear_types (
  id serial primary key,
  name text not null,
  category text check (category in ('clubs', 'bag', 'gloves', 'shoes', 'balls', 'other')),
  description text,
  standard_rental_fee decimal(10,2),
  active boolean default true
);

create table gear_units (
  id serial primary key,
  gear_type_id int not null references gear_types(id),
  tag_number text unique not null,
  size text,
  condition text check (condition in ('new', 'good', 'fair', 'needs_repair', 'retired')) default 'new',
  status text check (status in ('available', 'rented', 'maintenance', 'retired')) default 'available',
  acquired_date date
);

-- FIXED v4 — booking_id required, enrollment_id removed (gear is bundled into programme price)
create table gear_rentals (
  id serial primary key,
  member_id int not null references members(id),
  booking_id int not null references bookings(id),
  fee decimal(10,2),
  status text check (status in ('requested', 'issued', 'returned', 'overdue')) default 'requested',
  issued_at timestamptz,
  due_at date,
  returned_at timestamptz,
  issued_by int references coaches(id),
  notes text
);

create table gear_rental_units (
  id serial primary key,
  gear_rental_id int not null references gear_rentals(id) on delete cascade,
  gear_unit_id int not null references gear_units(id),
  condition_out text,
  condition_in text
);

create table invoices (
  id serial primary key,
  account_id uuid not null references accounts(id),
  issued_at date default current_date,
  due_at date,
  total_amount decimal(10,2) not null default 0,
  status text check (status in ('pending', 'paid', 'partially_paid', 'overdue', 'cancelled')) default 'pending'
);

create table invoice_line_items (
  id serial primary key,
  invoice_id int not null references invoices(id) on delete cascade,
  item_type text check (item_type in ('programme_fee', 'gear_rental', 'private_lesson', 'event_fee', 'other')),
  reference_id int,
  description text,
  amount decimal(10,2) not null
);

create table payments (
  id serial primary key,
  invoice_id int not null references invoices(id),
  amount decimal(10,2) not null,
  method text,
  gateway_reference text unique,
  paystack_transaction_id bigint,
  channel text,
  status text check (status in ('pending', 'paid', 'failed', 'refunded')) default 'pending',
  paid_at timestamptz
);

-- ---------- Notifications & Audit ----------
create table notifications (
  id serial primary key,
  account_id uuid not null references accounts(id) on delete cascade,
  related_type text,
  related_id int,
  channel text check (channel in ('email', 'sms', 'push', 'in_app')),
  title text,
  body text,
  status text check (status in ('pending', 'sent', 'failed', 'read')) default 'pending',
  created_at timestamptz default now(),
  sent_at timestamptz,
  read_at timestamptz
);
create table notification_preferences (
  id serial primary key,
  account_id uuid not null references accounts(id),
  notification_type text,
  channel text check (channel in ('email', 'sms', 'push', 'in_app')),
  enabled boolean default true,
  unique (account_id, notification_type, channel)
);

create index on members (account_id);
create index on enrollments (member_id);
create index on enrollments (programme_id);
create index on programme_sessions (programme_id);
create index on attendance (session_id);
create index on attendance (member_id);
create index on invoices (account_id);
create index on payments (invoice_id);