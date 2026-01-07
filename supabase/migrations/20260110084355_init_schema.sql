-- Table for all sorts of encrypted data
CREATE TABLE IF NOT EXISTS public.encrypted_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  encrypted_data TEXT NOT NULL,
  category TEXT NOT NULL,
  initialization_vector TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Row Level Security (RLS) aktivieren
ALTER TABLE public.encrypted_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own records" ON public.white_dog_records;

CREATE POLICY "Users can manage their own records"
ON public.encrypted_records FOR ALL
USING (
  (SELECT auth.uid()) = user_id
);