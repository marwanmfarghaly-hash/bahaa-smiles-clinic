CREATE TYPE public.app_role AS ENUM ('doctor');
CREATE TYPE public.appointment_status AS ENUM ('confirmed', 'completed', 'cancelled');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.clinic_settings AS
SELECT true::boolean AS singleton,
       'Dental Clinic'::text AS clinic_name_en,
       'عيادة دنتال كلينك'::text AS clinic_name_ar,
       'Dr. Omar Bahaa El-Din'::text AS doctor_name_en,
       'د. عمر بهاء الدين'::text AS doctor_name_ar,
       'Consultant & Master of Dental Implantology'::text AS doctor_title_en,
       'استشاري وماجستير زراعة الأسنان'::text AS doctor_title_ar,
       '261 H, El-Daght Street'::text AS address_en,
       '٢٦١ ه‍ شارع الضغط'::text AS address_ar,
       '01286661471'::text AS phone,
       'Africa/Cairo'::text AS time_zone,
       time '16:00' AS opens_at,
       time '22:00' AS closes_at,
       5::smallint AS weekly_day_off,
       2::integer AS patients_per_hour,
       now() AS updated_at;
GRANT SELECT ON public.clinic_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_settings TO authenticated;
GRANT ALL ON public.clinic_settings TO service_role;
ALTER TABLE public.clinic_settings ADD PRIMARY KEY (singleton);
ALTER TABLE public.clinic_settings ADD CONSTRAINT clinic_settings_singleton CHECK (singleton);
ALTER TABLE public.clinic_settings ADD CONSTRAINT clinic_hours_whole_hours CHECK (opens_at = date_trunc('hour', opens_at)::time AND closes_at = date_trunc('hour', closes_at)::time AND opens_at < closes_at);
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.clinic_services AS
SELECT * FROM (VALUES
  ('a31e0000-0000-4000-8000-000000000001'::uuid, 'consultation'::text, 'كشف واستشارة تخصصية'::text, 'Dental Examination & Consultation'::text, 'فحص دقيق وخطة علاج واضحة تبدأ بفهم احتياجاتك.'::text, 'A careful assessment and clear care plan shaped around your needs.'::text, 1::integer, true::boolean),
  ('a31e0000-0000-4000-8000-000000000002'::uuid, 'digital-xray'::text, 'أشعة الأسنان الرقمية'::text, 'Digital Dental X-Ray'::text, 'تصوير رقمي يساعد على تشخيص أدق ورؤية أوضح.'::text, 'Digital imaging for a clearer, more accurate diagnosis.'::text, 2::integer, true::boolean),
  ('a31e0000-0000-4000-8000-000000000003'::uuid, 'cosmetic-fillings'::text, 'حشوات تجميلية'::text, 'Cosmetic Fillings'::text, 'ترميمات بلون الأسنان لاستعادة الشكل والوظيفة.'::text, 'Tooth-coloured restorations that restore form and function.'::text, 3::integer, true::boolean),
  ('a31e0000-0000-4000-8000-000000000004'::uuid, 'root-canal'::text, 'علاج الجذور والعصب'::text, 'Endodontic & Root Canal Treatment'::text, 'علاج جذور دقيق للمساعدة في الحفاظ على السن الطبيعي.'::text, 'Precise root-canal care designed to help preserve natural teeth.'::text, 4::integer, true::boolean),
  ('a31e0000-0000-4000-8000-000000000005'::uuid, 'prosthodontics'::text, 'تركيبات ثابتة ومتحركة'::text, 'Fixed & Removable Prosthodontics'::text, 'حلول تعويضية ملائمة لاستعادة الراحة والثقة.'::text, 'Restorative options tailored to bring back comfort and confidence.'::text, 5::integer, true::boolean),
  ('a31e0000-0000-4000-8000-000000000006'::uuid, 'scaling-polishing'::text, 'تنظيف وتلميع الأسنان'::text, 'Scaling & Teeth Polishing'::text, 'إزالة الجير والترسبات وتنظيف لطيف للأسنان.'::text, 'Gentle cleaning to remove tartar and surface deposits.'::text, 6::integer, true::boolean),
  ('a31e0000-0000-4000-8000-000000000007'::uuid, 'laser-whitening'::text, 'تبييض الأسنان بالليزر'::text, 'Laser Teeth Whitening'::text, 'جلسة تبييض احترافية بإشراف طبي.'::text, 'Professional whitening performed under clinical supervision.'::text, 7::integer, true::boolean),
  ('a31e0000-0000-4000-8000-000000000008'::uuid, 'implants'::text, 'زراعة الأسنان المتقدمة'::text, 'Advanced Dental Implants'::text, 'خيارات زراعة مدروسة بخبرة تخصصية وتقنيات حديثة.'::text, 'Thoughtful implant care backed by specialist experience and modern techniques.'::text, 8::integer, true::boolean)
) AS seed(id, slug, title_ar, title_en, description_ar, description_en, sort_order, is_active);
GRANT SELECT ON public.clinic_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_services TO authenticated;
GRANT ALL ON public.clinic_services TO service_role;
ALTER TABLE public.clinic_services ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.clinic_services ADD PRIMARY KEY (id);
ALTER TABLE public.clinic_services ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.clinic_services ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  normalized_phone text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.clinic_services(id),
  starts_at timestamptz NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'confirmed',
  patient_note text,
  clinical_notes text,
  treatment_plan text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE INDEX appointments_starts_at_idx ON public.appointments (starts_at);
CREATE INDEX appointments_patient_id_starts_at_idx ON public.appointments (patient_id, starts_at DESC);

CREATE TABLE public.closed_dates (
  closed_on date PRIMARY KEY,
  note text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.closed_dates TO authenticated;
GRANT ALL ON public.closed_dates TO service_role;
ALTER TABLE public.closed_dates ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.doctor_notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  notifications_enabled boolean NOT NULL DEFAULT true,
  reminders_enabled boolean NOT NULL DEFAULT true,
  reminder_days smallint NOT NULL DEFAULT 1 CHECK (reminder_days IN (1, 2, 3)),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctor_notification_preferences TO authenticated;
GRANT ALL ON public.doctor_notification_preferences TO service_role;
ALTER TABLE public.doctor_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth_secret text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reminder_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  reminder_days smallint NOT NULL CHECK (reminder_days IN (1, 2, 3)),
  reminder_date date NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (appointment_id, reminder_days, reminder_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_deliveries TO authenticated;
GRANT ALL ON public.reminder_deliveries TO service_role;
ALTER TABLE public.reminder_deliveries ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_has_role(_role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  );
$$;
GRANT EXECUTE ON FUNCTION public.current_user_has_role(public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_clinic_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NULLIF(NEW.raw_user_meta_data ->> 'display_name', ''))
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'doctor') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'doctor')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_clinic_appointment_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_local timestamp;
  v_weekly_day_off smallint;
  v_opens_at time;
  v_closes_at time;
  v_capacity integer;
  v_active_count integer;
  v_local_date date;
  v_hour integer;
BEGIN
  IF NEW.status IN ('cancelled', 'completed') THEN
    RETURN NEW;
  END IF;

  v_local := NEW.starts_at AT TIME ZONE 'Africa/Cairo';
  v_local_date := v_local::date;
  v_hour := EXTRACT(HOUR FROM v_local)::integer;

  SELECT weekly_day_off, opens_at, closes_at, patients_per_hour
  INTO v_weekly_day_off, v_opens_at, v_closes_at, v_capacity
  FROM public.clinic_settings WHERE singleton = true;

  IF NEW.starts_at <= now()
     OR EXTRACT(DOW FROM v_local)::smallint = v_weekly_day_off
     OR v_local::time < v_opens_at
     OR v_local::time >= v_closes_at
     OR EXTRACT(MINUTE FROM v_local) <> 0
     OR EXTRACT(SECOND FROM v_local) <> 0 THEN
    RAISE EXCEPTION 'This appointment time is unavailable';
  END IF;

  IF EXISTS (SELECT 1 FROM public.closed_dates WHERE closed_on = v_local_date) THEN
    RAISE EXCEPTION 'This clinic date is closed';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('clinic-slot:' || v_local_date::text || ':' || v_hour::text, 0));

  SELECT count(*)::integer INTO v_active_count
  FROM public.appointments a
  WHERE a.id IS DISTINCT FROM NEW.id
    AND a.status IN ('confirmed', 'completed')
    AND (a.starts_at AT TIME ZONE 'Africa/Cairo')::date = v_local_date
    AND EXTRACT(HOUR FROM a.starts_at AT TIME ZONE 'Africa/Cairo')::integer = v_hour;

  IF v_active_count >= COALESCE(v_capacity, 2) THEN
    RAISE EXCEPTION 'This appointment hour is full';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER appointments_enforce_capacity
BEFORE INSERT OR UPDATE OF starts_at, status ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.enforce_clinic_appointment_capacity();

CREATE OR REPLACE FUNCTION public.get_public_availability(_clinic_date date)
RETURNS TABLE(slot_start time, spots_left integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH cfg AS (
    SELECT time_zone, opens_at, closes_at, weekly_day_off, patients_per_hour
    FROM public.clinic_settings WHERE singleton = true
  ),
  hours AS (
    SELECT generate_series(EXTRACT(HOUR FROM cfg.opens_at)::integer, EXTRACT(HOUR FROM cfg.closes_at)::integer - 1) AS hour, cfg.*
    FROM cfg
  )
  SELECT make_time(hours.hour::integer, 0, 0),
         GREATEST(0, hours.patients_per_hour - (
           SELECT count(*)::integer
           FROM public.appointments a
           WHERE a.status IN ('confirmed', 'completed')
             AND (a.starts_at AT TIME ZONE hours.time_zone)::date = _clinic_date
             AND EXTRACT(HOUR FROM a.starts_at AT TIME ZONE hours.time_zone)::integer = hours.hour::integer
         ))
  FROM hours
  WHERE _clinic_date >= (now() AT TIME ZONE hours.time_zone)::date
    AND EXTRACT(DOW FROM _clinic_date)::smallint <> hours.weekly_day_off
    AND make_timestamptz(EXTRACT(YEAR FROM _clinic_date)::integer, EXTRACT(MONTH FROM _clinic_date)::integer, EXTRACT(DAY FROM _clinic_date)::integer, hours.hour::integer, 0, 0, hours.time_zone) > now()
    AND NOT EXISTS (SELECT 1 FROM public.closed_dates d WHERE d.closed_on = _clinic_date)
    AND (
      SELECT count(*)::integer
      FROM public.appointments a
      WHERE a.status IN ('confirmed', 'completed')
        AND (a.starts_at AT TIME ZONE hours.time_zone)::date = _clinic_date
        AND EXTRACT(HOUR FROM a.starts_at AT TIME ZONE hours.time_zone)::integer = hours.hour::integer
    ) < hours.patients_per_hour
  ORDER BY hours.hour;
$$;
REVOKE ALL ON FUNCTION public.get_public_availability(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_availability(date) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_public_booking(
  _patient_name text,
  _phone text,
  _service_id uuid,
  _starts_at timestamptz,
  _patient_note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_patient_id uuid;
  v_appointment_id uuid;
  v_phone_digits text;
  v_local timestamp;
  v_local_date date;
  v_weekly_day_off smallint;
  v_opens_at time;
  v_closes_at time;
BEGIN
  IF _patient_name IS NULL OR length(trim(_patient_name)) < 2 OR length(trim(_patient_name)) > 120 THEN
    RAISE EXCEPTION 'Enter a valid patient name';
  END IF;
  v_phone_digits := regexp_replace(COALESCE(_phone, ''), '[^0-9]', '', 'g');
  IF length(v_phone_digits) < 8 OR length(v_phone_digits) > 15 THEN
    RAISE EXCEPTION 'Enter a valid mobile number';
  END IF;
  IF _patient_note IS NOT NULL AND length(_patient_note) > 500 THEN
    RAISE EXCEPTION 'Notes must be 500 characters or fewer';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.clinic_services WHERE id = _service_id AND is_active = true) THEN
    RAISE EXCEPTION 'Selected service is unavailable';
  END IF;

  SELECT weekly_day_off, opens_at, closes_at INTO v_weekly_day_off, v_opens_at, v_closes_at
  FROM public.clinic_settings WHERE singleton = true;
  v_local := _starts_at AT TIME ZONE 'Africa/Cairo';
  v_local_date := v_local::date;
  IF _starts_at <= now()
     OR EXTRACT(DOW FROM v_local)::smallint = v_weekly_day_off
     OR v_local::time < v_opens_at
     OR v_local::time >= v_closes_at
     OR EXTRACT(MINUTE FROM v_local) <> 0
     OR EXTRACT(SECOND FROM v_local) <> 0
     OR EXISTS (SELECT 1 FROM public.closed_dates WHERE closed_on = v_local_date) THEN
    RAISE EXCEPTION 'This appointment time is unavailable';
  END IF;

  INSERT INTO public.patients (full_name, phone, normalized_phone)
  VALUES (trim(_patient_name), trim(_phone), v_phone_digits)
  ON CONFLICT (normalized_phone)
  DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, updated_at = now()
  RETURNING id INTO v_patient_id;

  INSERT INTO public.appointments (patient_id, service_id, starts_at, patient_note, status)
  VALUES (v_patient_id, _service_id, _starts_at, NULLIF(trim(_patient_note), ''), 'confirmed')
  RETURNING id INTO v_appointment_id;
  RETURN v_appointment_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_public_booking(text, text, uuid, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_booking(text, text, uuid, timestamptz, text) TO anon, authenticated;

CREATE TRIGGER auth_user_profile_and_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_clinic_user();

CREATE POLICY profiles_read_self_or_doctor ON public.profiles
FOR SELECT TO authenticated USING (id = auth.uid() OR public.current_user_has_role('doctor'));
CREATE POLICY profiles_update_self_or_doctor ON public.profiles
FOR UPDATE TO authenticated USING (id = auth.uid() OR public.current_user_has_role('doctor'))
WITH CHECK (id = auth.uid() OR public.current_user_has_role('doctor'));
CREATE POLICY user_roles_read_self_or_doctor ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.current_user_has_role('doctor'));

CREATE POLICY clinic_settings_public_read ON public.clinic_settings
FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY clinic_settings_doctor_manage ON public.clinic_settings
FOR ALL TO authenticated USING (public.current_user_has_role('doctor'))
WITH CHECK (public.current_user_has_role('doctor'));

CREATE POLICY clinic_services_public_read ON public.clinic_services
FOR SELECT TO anon, authenticated USING (is_active OR public.current_user_has_role('doctor'));
CREATE POLICY clinic_services_doctor_manage ON public.clinic_services
FOR ALL TO authenticated USING (public.current_user_has_role('doctor'))
WITH CHECK (public.current_user_has_role('doctor'));

CREATE POLICY patients_doctor_access ON public.patients
FOR ALL TO authenticated USING (public.current_user_has_role('doctor'))
WITH CHECK (public.current_user_has_role('doctor'));
CREATE POLICY appointments_doctor_access ON public.appointments
FOR ALL TO authenticated USING (public.current_user_has_role('doctor'))
WITH CHECK (public.current_user_has_role('doctor'));
CREATE POLICY closed_dates_doctor_access ON public.closed_dates
FOR ALL TO authenticated USING (public.current_user_has_role('doctor'))
WITH CHECK (public.current_user_has_role('doctor'));
CREATE POLICY notification_preferences_doctor_access ON public.doctor_notification_preferences
FOR ALL TO authenticated USING (user_id = auth.uid() AND public.current_user_has_role('doctor'))
WITH CHECK (user_id = auth.uid() AND public.current_user_has_role('doctor'));
CREATE POLICY push_subscriptions_doctor_access ON public.push_subscriptions
FOR ALL TO authenticated USING (user_id = auth.uid() AND public.current_user_has_role('doctor'))
WITH CHECK (user_id = auth.uid() AND public.current_user_has_role('doctor'));
CREATE POLICY reminder_deliveries_doctor_access ON public.reminder_deliveries
FOR ALL TO authenticated USING (public.current_user_has_role('doctor'))
WITH CHECK (public.current_user_has_role('doctor'));
