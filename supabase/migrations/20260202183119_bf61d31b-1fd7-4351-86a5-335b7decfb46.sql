-- Create storage bucket for AI-generated symbols
INSERT INTO storage.buckets (id, name, public)
VALUES ('dream-symbols', 'dream-symbols', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to symbols
CREATE POLICY "Public can view dream symbols"
ON storage.objects FOR SELECT
USING (bucket_id = 'dream-symbols');

-- Allow authenticated users to upload symbols (for edge functions)
CREATE POLICY "Allow symbol uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dream-symbols');

-- Allow updates to symbols
CREATE POLICY "Allow symbol updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'dream-symbols');