-- Add dream_types column to dream_logs table
ALTER TABLE dream_logs 
ADD COLUMN IF NOT EXISTS dream_types TEXT[] DEFAULT '{}';

-- Add comment to describe the column
COMMENT ON COLUMN dream_logs.dream_types IS 'Types of dreams: lucid, nightmare, recurring, prophetic';
