-- ============================================================
-- TYGA Platform — App settings
-- Single-row table. Groups: Academy, Site, Notifications, Payments.
-- ============================================================

create table if not exists app_settings (
  id          integer primary key default 1 check (id = 1),

  -- ---------- Academy ----------
  booking_lead_hours              integer not null default 24,
  booking_lookahead_days          integer not null default 56,
  default_slot_minutes            integer not null default 60,
  cancellation_cutoff_hours       integer not null default 24,
  default_max_ratio               integer not null default 6,
  timezone                        text not null default 'Africa/Johannesburg',

  -- ---------- Site ----------
  site_name                       text not null default 'TYGA',
  site_tagline                    text,
  logo_url                        text,
  favicon_url                     text,
  primary_color                   text not null default '#000000',
  support_email                   text,
  support_phone                   text,
  whatsapp_number                 text,
  terms_url                       text,
  privacy_url                     text,
  cancellation_policy_text        text,
  default_consent_version         text not null default 'v1',

  -- ---------- Notifications ----------
  from_email                      text,
  from_name                       text,
  reply_to_email                  text,
  send_booking_confirmation       boolean not null default true,
  send_appointment_confirmed      boolean not null default true,
  send_appointment_cancelled      boolean not null default true,
  send_appointment_reminder_hours integer not null default 24,
  send_invoice_on_issue           boolean not null default true,
  send_payment_receipt            boolean not null default true,
  send_enrollment_confirmation    boolean not null default true,
  send_session_cancelled          boolean not null default true,
  send_level_progression          boolean not null default true,

  -- ---------- Payments ----------
  currency                        text not null default 'ZAR',
  vat_enabled                     boolean not null default false,
  vat_rate                        numeric(5,2) not null default 15,
  vat_number                      text,
  invoice_prefix                  text not null default 'INV-',
  invoice_due_days                integer not null default 7,
  bank_details                    text,

  updated_at                      timestamptz not null default now(),
  updated_by                      uuid references accounts(id)
);

insert into app_settings (id) values (1) on conflict do nothing;

-- ---------- Row Level Security ----------

alter table app_settings enable row level security;

drop policy if exists "authenticated read settings" on app_settings;
create policy "authenticated read settings"
  on app_settings
  for select
  using (auth.uid() is not null);

drop policy if exists "admins update settings" on app_settings;
create policy "admins update settings"
  on app_settings
  for update
  using (
    exists (
      select 1 from accounts a
      where a.id = auth.uid() and a.role = 'admin'
    )
  );