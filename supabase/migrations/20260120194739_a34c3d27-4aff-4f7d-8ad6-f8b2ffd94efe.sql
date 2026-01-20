-- Dream book by Bon - Complete Database Schema

-- Enums
CREATE TYPE time_system AS ENUM ('inactive', 'activated', 'unknown');
CREATE TYPE safety_override AS ENUM ('none', 'helper', 'separation', 'wake', 'unknown');
CREATE TYPE exit_type AS ENUM ('wake', 'separation', 'collapse', 'unknown');
CREATE TYPE entity_role AS ENUM ('observer', 'protector', 'guide', 'intruder');
CREATE TYPE world_type AS ENUM ('persistent', 'transient');
CREATE TYPE module_type AS ENUM ('time_activation', 'safety_override', 'distance_expansion', 'other');

-- Worlds table
CREATE TABLE public.worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type world_type NOT NULL DEFAULT 'transient',
  stability INTEGER NOT NULL DEFAULT 3 CHECK (stability >= 0 AND stability <= 5),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Entities table
CREATE TABLE public.entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  role entity_role NOT NULL DEFAULT 'observer',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Modules table
CREATE TABLE public.system_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type module_type NOT NULL DEFAULT 'other',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Threats table
CREATE TABLE public.threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 5),
  response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dream Logs table
CREATE TABLE public.dream_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,
  wake_time TIME NOT NULL,
  world_id UUID REFERENCES public.worlds(id) ON DELETE SET NULL,
  time_system time_system NOT NULL DEFAULT 'unknown',
  environments TEXT[] NOT NULL DEFAULT '{}',
  threat_level INTEGER NOT NULL DEFAULT 0 CHECK (threat_level >= 0 AND threat_level <= 5),
  safety_override safety_override NOT NULL DEFAULT 'none',
  exit exit_type NOT NULL DEFAULT 'unknown',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dream Log Entities junction table
CREATE TABLE public.dream_log_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_log_id UUID NOT NULL REFERENCES public.dream_logs(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  UNIQUE(dream_log_id, entity_id)
);

-- Dream Log Threats junction table
CREATE TABLE public.dream_log_threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_log_id UUID NOT NULL REFERENCES public.dream_logs(id) ON DELETE CASCADE,
  threat_id UUID NOT NULL REFERENCES public.threats(id) ON DELETE CASCADE,
  UNIQUE(dream_log_id, threat_id)
);

-- Dream Log Modules junction table
CREATE TABLE public.dream_log_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_log_id UUID NOT NULL REFERENCES public.dream_logs(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.system_modules(id) ON DELETE CASCADE,
  UNIQUE(dream_log_id, module_id)
);

-- Sleep Logs table
CREATE TABLE public.sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sleep_id TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,
  sleep_start TIME NOT NULL,
  wake_time TIME NOT NULL,
  total_hours INTEGER NOT NULL DEFAULT 0,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  deep_hours INTEGER NOT NULL DEFAULT 0,
  deep_minutes INTEGER NOT NULL DEFAULT 0,
  light_hours INTEGER NOT NULL DEFAULT 0,
  light_minutes INTEGER NOT NULL DEFAULT 0,
  rem_hours INTEGER NOT NULL DEFAULT 0,
  rem_minutes INTEGER NOT NULL DEFAULT 0,
  nap_minutes INTEGER,
  nap_start TIME,
  nap_end TIME,
  sleep_score INTEGER CHECK (sleep_score IS NULL OR (sleep_score >= 0 AND sleep_score <= 100)),
  deep_continuity_score INTEGER CHECK (deep_continuity_score IS NULL OR (deep_continuity_score >= 0 AND deep_continuity_score <= 100)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_log_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_log_threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_log_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public access (personal app, no auth required)
CREATE POLICY "Allow all access to worlds" ON public.worlds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to entities" ON public.entities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to system_modules" ON public.system_modules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to threats" ON public.threats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to dream_logs" ON public.dream_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to dream_log_entities" ON public.dream_log_entities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to dream_log_threats" ON public.dream_log_threats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to dream_log_modules" ON public.dream_log_modules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sleep_logs" ON public.sleep_logs FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_worlds_updated_at BEFORE UPDATE ON public.worlds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON public.entities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_modules_updated_at BEFORE UPDATE ON public.system_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_threats_updated_at BEFORE UPDATE ON public.threats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dream_logs_updated_at BEFORE UPDATE ON public.dream_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate Dream ID
CREATE OR REPLACE FUNCTION public.generate_dream_id()
RETURNS TRIGGER AS $$
DECLARE
  date_str TEXT;
  seq_num INTEGER;
BEGIN
  date_str := TO_CHAR(NEW.date, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(dream_id FROM 13 FOR 3) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.dream_logs
  WHERE date = NEW.date;
  NEW.dream_id := 'DS-' || date_str || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_dream_id_trigger
BEFORE INSERT ON public.dream_logs
FOR EACH ROW
WHEN (NEW.dream_id IS NULL OR NEW.dream_id = '')
EXECUTE FUNCTION public.generate_dream_id();

-- Function to generate Sleep ID
CREATE OR REPLACE FUNCTION public.generate_sleep_id()
RETURNS TRIGGER AS $$
DECLARE
  date_str TEXT;
  seq_num INTEGER;
BEGIN
  date_str := TO_CHAR(NEW.date, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(sleep_id FROM 13 FOR 3) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.sleep_logs
  WHERE date = NEW.date;
  NEW.sleep_id := 'SL-' || date_str || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_sleep_id_trigger
BEFORE INSERT ON public.sleep_logs
FOR EACH ROW
WHEN (NEW.sleep_id IS NULL OR NEW.sleep_id = '')
EXECUTE FUNCTION public.generate_sleep_id();