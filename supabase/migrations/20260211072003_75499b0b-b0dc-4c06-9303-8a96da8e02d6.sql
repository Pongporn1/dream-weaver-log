
-- Add missing columns to threats table
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS ability text;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS countermeasure text;
ALTER TABLE public.threats ADD COLUMN IF NOT EXISTS summon_medium text;

-- Fix ALL restrictive policies to be permissive

-- dream_logs
DROP POLICY IF EXISTS "Users can view their own dream_logs" ON public.dream_logs;
DROP POLICY IF EXISTS "Users can insert their own dream_logs" ON public.dream_logs;
DROP POLICY IF EXISTS "Users can update their own dream_logs" ON public.dream_logs;
DROP POLICY IF EXISTS "Users can delete their own dream_logs" ON public.dream_logs;

CREATE POLICY "Users can view their own dream_logs" ON public.dream_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own dream_logs" ON public.dream_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dream_logs" ON public.dream_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dream_logs" ON public.dream_logs FOR DELETE USING (auth.uid() = user_id);

-- sleep_logs
DROP POLICY IF EXISTS "Users can view their own sleep_logs" ON public.sleep_logs;
DROP POLICY IF EXISTS "Users can insert their own sleep_logs" ON public.sleep_logs;
DROP POLICY IF EXISTS "Users can update their own sleep_logs" ON public.sleep_logs;
DROP POLICY IF EXISTS "Users can delete their own sleep_logs" ON public.sleep_logs;

CREATE POLICY "Users can view their own sleep_logs" ON public.sleep_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sleep_logs" ON public.sleep_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sleep_logs" ON public.sleep_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sleep_logs" ON public.sleep_logs FOR DELETE USING (auth.uid() = user_id);

-- entities
DROP POLICY IF EXISTS "Users can view their own entities" ON public.entities;
DROP POLICY IF EXISTS "Users can insert their own entities" ON public.entities;
DROP POLICY IF EXISTS "Users can update their own entities" ON public.entities;
DROP POLICY IF EXISTS "Users can delete their own entities" ON public.entities;

CREATE POLICY "Users can view their own entities" ON public.entities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own entities" ON public.entities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entities" ON public.entities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entities" ON public.entities FOR DELETE USING (auth.uid() = user_id);

-- threats
DROP POLICY IF EXISTS "Users can view their own threats" ON public.threats;
DROP POLICY IF EXISTS "Users can insert their own threats" ON public.threats;
DROP POLICY IF EXISTS "Users can update their own threats" ON public.threats;
DROP POLICY IF EXISTS "Users can delete their own threats" ON public.threats;

CREATE POLICY "Users can view their own threats" ON public.threats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own threats" ON public.threats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own threats" ON public.threats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own threats" ON public.threats FOR DELETE USING (auth.uid() = user_id);

-- worlds
DROP POLICY IF EXISTS "Users can view their own worlds" ON public.worlds;
DROP POLICY IF EXISTS "Users can insert their own worlds" ON public.worlds;
DROP POLICY IF EXISTS "Users can update their own worlds" ON public.worlds;
DROP POLICY IF EXISTS "Users can delete their own worlds" ON public.worlds;

CREATE POLICY "Users can view their own worlds" ON public.worlds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own worlds" ON public.worlds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own worlds" ON public.worlds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own worlds" ON public.worlds FOR DELETE USING (auth.uid() = user_id);

-- system_modules
DROP POLICY IF EXISTS "Users can view their own system_modules" ON public.system_modules;
DROP POLICY IF EXISTS "Users can insert their own system_modules" ON public.system_modules;
DROP POLICY IF EXISTS "Users can update their own system_modules" ON public.system_modules;
DROP POLICY IF EXISTS "Users can delete their own system_modules" ON public.system_modules;

CREATE POLICY "Users can view their own system_modules" ON public.system_modules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own system_modules" ON public.system_modules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own system_modules" ON public.system_modules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own system_modules" ON public.system_modules FOR DELETE USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- dream_log_entities
DROP POLICY IF EXISTS "Users can view their dream_log_entities" ON public.dream_log_entities;
DROP POLICY IF EXISTS "Users can insert their dream_log_entities" ON public.dream_log_entities;
DROP POLICY IF EXISTS "Users can delete their dream_log_entities" ON public.dream_log_entities;

CREATE POLICY "Users can view their dream_log_entities" ON public.dream_log_entities FOR SELECT USING (EXISTS (SELECT 1 FROM dream_logs WHERE dream_logs.id = dream_log_entities.dream_log_id AND dream_logs.user_id = auth.uid()));
CREATE POLICY "Users can insert their dream_log_entities" ON public.dream_log_entities FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM dream_logs WHERE dream_logs.id = dream_log_entities.dream_log_id AND dream_logs.user_id = auth.uid()));
CREATE POLICY "Users can delete their dream_log_entities" ON public.dream_log_entities FOR DELETE USING (EXISTS (SELECT 1 FROM dream_logs WHERE dream_logs.id = dream_log_entities.dream_log_id AND dream_logs.user_id = auth.uid()));

-- dream_log_threats
DROP POLICY IF EXISTS "Users can view their dream_log_threats" ON public.dream_log_threats;
DROP POLICY IF EXISTS "Users can insert their dream_log_threats" ON public.dream_log_threats;
DROP POLICY IF EXISTS "Users can delete their dream_log_threats" ON public.dream_log_threats;

CREATE POLICY "Users can view their dream_log_threats" ON public.dream_log_threats FOR SELECT USING (EXISTS (SELECT 1 FROM dream_logs WHERE dream_logs.id = dream_log_threats.dream_log_id AND dream_logs.user_id = auth.uid()));
CREATE POLICY "Users can insert their dream_log_threats" ON public.dream_log_threats FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM dream_logs WHERE dream_logs.id = dream_log_threats.dream_log_id AND dream_logs.user_id = auth.uid()));
CREATE POLICY "Users can delete their dream_log_threats" ON public.dream_log_threats FOR DELETE USING (EXISTS (SELECT 1 FROM dream_logs WHERE dream_logs.id = dream_log_threats.dream_log_id AND dream_logs.user_id = auth.uid()));

-- dream_log_modules
DROP POLICY IF EXISTS "Users can view their dream_log_modules" ON public.dream_log_modules;
DROP POLICY IF EXISTS "Users can insert their dream_log_modules" ON public.dream_log_modules;
DROP POLICY IF EXISTS "Users can delete their dream_log_modules" ON public.dream_log_modules;

CREATE POLICY "Users can view their dream_log_modules" ON public.dream_log_modules FOR SELECT USING (EXISTS (SELECT 1 FROM dream_logs WHERE dream_logs.id = dream_log_modules.dream_log_id AND dream_logs.user_id = auth.uid()));
CREATE POLICY "Users can insert their dream_log_modules" ON public.dream_log_modules FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM dream_logs WHERE dream_logs.id = dream_log_modules.dream_log_id AND dream_logs.user_id = auth.uid()));
CREATE POLICY "Users can delete their dream_log_modules" ON public.dream_log_modules FOR DELETE USING (EXISTS (SELECT 1 FROM dream_logs WHERE dream_logs.id = dream_log_modules.dream_log_id AND dream_logs.user_id = auth.uid()));
