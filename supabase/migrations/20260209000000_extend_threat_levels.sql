-- Extend threat catalog levels to support Level 6-7 archetypes.
ALTER TABLE public.threats
DROP CONSTRAINT IF EXISTS threats_level_check;

ALTER TABLE public.threats
ADD CONSTRAINT threats_level_check
CHECK (level >= 0 AND level <= 7);
