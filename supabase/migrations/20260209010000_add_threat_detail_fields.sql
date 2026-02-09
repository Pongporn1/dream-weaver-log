-- Split threat details into dedicated fields.
ALTER TABLE public.threats
ADD COLUMN IF NOT EXISTS ability TEXT,
ADD COLUMN IF NOT EXISTS countermeasure TEXT,
ADD COLUMN IF NOT EXISTS summon_medium TEXT;

-- Keep old data visible by moving legacy combined response into ability when empty.
UPDATE public.threats
SET ability = response
WHERE ability IS NULL
  AND response IS NOT NULL
  AND btrim(response) <> '';
