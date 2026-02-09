
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add user_id to all existing tables
ALTER TABLE public.dream_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.sleep_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.entities ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.worlds ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.threats ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.system_modules ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all access to dream_logs" ON public.dream_logs;
DROP POLICY IF EXISTS "Allow all access to sleep_logs" ON public.sleep_logs;
DROP POLICY IF EXISTS "Allow all access to entities" ON public.entities;
DROP POLICY IF EXISTS "Allow all access to worlds" ON public.worlds;
DROP POLICY IF EXISTS "Allow all access to threats" ON public.threats;
DROP POLICY IF EXISTS "Allow all access to system_modules" ON public.system_modules;
DROP POLICY IF EXISTS "Allow all access to dream_log_entities" ON public.dream_log_entities;
DROP POLICY IF EXISTS "Allow all access to dream_log_threats" ON public.dream_log_threats;
DROP POLICY IF EXISTS "Allow all access to dream_log_modules" ON public.dream_log_modules;

-- New RLS policies for dream_logs
CREATE POLICY "Users can view their own dream_logs"
  ON public.dream_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own dream_logs"
  ON public.dream_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dream_logs"
  ON public.dream_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dream_logs"
  ON public.dream_logs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- New RLS policies for sleep_logs
CREATE POLICY "Users can view their own sleep_logs"
  ON public.sleep_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sleep_logs"
  ON public.sleep_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sleep_logs"
  ON public.sleep_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sleep_logs"
  ON public.sleep_logs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- New RLS policies for entities
CREATE POLICY "Users can view their own entities"
  ON public.entities FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own entities"
  ON public.entities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entities"
  ON public.entities FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entities"
  ON public.entities FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- New RLS policies for worlds
CREATE POLICY "Users can view their own worlds"
  ON public.worlds FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own worlds"
  ON public.worlds FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own worlds"
  ON public.worlds FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own worlds"
  ON public.worlds FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- New RLS policies for threats
CREATE POLICY "Users can view their own threats"
  ON public.threats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own threats"
  ON public.threats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own threats"
  ON public.threats FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own threats"
  ON public.threats FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- New RLS policies for system_modules
CREATE POLICY "Users can view their own system_modules"
  ON public.system_modules FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own system_modules"
  ON public.system_modules FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own system_modules"
  ON public.system_modules FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own system_modules"
  ON public.system_modules FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Junction tables: access via parent dream_log ownership
CREATE POLICY "Users can view their dream_log_entities"
  ON public.dream_log_entities FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dream_logs WHERE id = dream_log_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert their dream_log_entities"
  ON public.dream_log_entities FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.dream_logs WHERE id = dream_log_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete their dream_log_entities"
  ON public.dream_log_entities FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dream_logs WHERE id = dream_log_id AND user_id = auth.uid()));

CREATE POLICY "Users can view their dream_log_threats"
  ON public.dream_log_threats FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dream_logs WHERE id = dream_log_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert their dream_log_threats"
  ON public.dream_log_threats FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.dream_logs WHERE id = dream_log_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete their dream_log_threats"
  ON public.dream_log_threats FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dream_logs WHERE id = dream_log_id AND user_id = auth.uid()));

CREATE POLICY "Users can view their dream_log_modules"
  ON public.dream_log_modules FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dream_logs WHERE id = dream_log_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert their dream_log_modules"
  ON public.dream_log_modules FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.dream_logs WHERE id = dream_log_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete their dream_log_modules"
  ON public.dream_log_modules FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dream_logs WHERE id = dream_log_id AND user_id = auth.uid()));
