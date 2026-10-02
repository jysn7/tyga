-- ============================================================
-- Update app settings from a JSON patch
-- ============================================================

create or replace function admin_update_app_settings(p_patch jsonb)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  update app_settings
  set
    -- Academy
    booking_lead_hours              = coalesce((p_patch->>'booking_lead_hours')::int, booking_lead_hours),
    booking_lookahead_days          = coalesce((p_patch->>'booking_lookahead_days')::int, booking_lookahead_days),
    default_slot_minutes            = coalesce((p_patch->>'default_slot_minutes')::int, default_slot_minutes),
    cancellation_cutoff_hours       = coalesce((p_patch->>'cancellation_cutoff_hours')::int, cancellation_cutoff_hours),
    default_max_ratio               = coalesce((p_patch->>'default_max_ratio')::int, default_max_ratio),
    timezone                        = coalesce(p_patch->>'timezone', timezone),

    -- Site
    site_name                       = coalesce(p_patch->>'site_name', site_name),
    site_tagline                    = coalesce(p_patch->>'site_tagline', site_tagline),
    logo_url                        = coalesce(p_patch->>'logo_url', logo_url),
    favicon_url                     = coalesce(p_patch->>'favicon_url', favicon_url),
    primary_color                   = coalesce(p_patch->>'primary_color', primary_color),
    support_email                   = coalesce(p_patch->>'support_email', support_email),
    support_phone                   = coalesce(p_patch->>'support_phone', support_phone),
    whatsapp_number                 = coalesce(p_patch->>'whatsapp_number', whatsapp_number),
    terms_url                       = coalesce(p_patch->>'terms_url', terms_url),
    privacy_url                     = coalesce(p_patch->>'privacy_url', privacy_url),
    cancellation_policy_text        = coalesce(p_patch->>'cancellation_policy_text', cancellation_policy_text),
    default_consent_version         = coalesce(p_patch->>'default_consent_version', default_consent_version),

    -- Notifications
    from_email                      = coalesce(p_patch->>'from_email', from_email),
    from_name                       = coalesce(p_patch->>'from_name', from_name),
    reply_to_email                  = coalesce(p_patch->>'reply_to_email', reply_to_email),
    send_booking_confirmation       = coalesce((p_patch->>'send_booking_confirmation')::boolean, send_booking_confirmation),
    send_appointment_confirmed      = coalesce((p_patch->>'send_appointment_confirmed')::boolean, send_appointment_confirmed),
    send_appointment_cancelled      = coalesce((p_patch->>'send_appointment_cancelled')::boolean, send_appointment_cancelled),
    send_appointment_reminder_hours = coalesce((p_patch->>'send_appointment_reminder_hours')::int, send_appointment_reminder_hours),
    send_invoice_on_issue           = coalesce((p_patch->>'send_invoice_on_issue')::boolean, send_invoice_on_issue),
    send_payment_receipt            = coalesce((p_patch->>'send_payment_receipt')::boolean, send_payment_receipt),
    send_enrollment_confirmation    = coalesce((p_patch->>'send_enrollment_confirmation')::boolean, send_enrollment_confirmation),
    send_session_cancelled          = coalesce((p_patch->>'send_session_cancelled')::boolean, send_session_cancelled),
    send_level_progression          = coalesce((p_patch->>'send_level_progression')::boolean, send_level_progression),

    -- Payments
    currency                        = coalesce(p_patch->>'currency', currency),
    vat_enabled                     = coalesce((p_patch->>'vat_enabled')::boolean, vat_enabled),
    vat_rate                        = coalesce((p_patch->>'vat_rate')::numeric, vat_rate),
    vat_number                      = coalesce(p_patch->>'vat_number', vat_number),
    invoice_prefix                  = coalesce(p_patch->>'invoice_prefix', invoice_prefix),
    invoice_due_days                = coalesce((p_patch->>'invoice_due_days')::int, invoice_due_days),
    bank_details                    = coalesce(p_patch->>'bank_details', bank_details),

    updated_at                      = now(),
    updated_by                      = auth.uid()
  where id = 1;
end;
$$;

grant execute on function admin_update_app_settings(jsonb) to authenticated;