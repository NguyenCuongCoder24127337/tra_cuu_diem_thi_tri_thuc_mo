-- Create feedback/suggestions table
CREATE TABLE IF NOT EXISTS public.thu_gop_y (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_thu_gop_y_status ON public.thu_gop_y(status);
CREATE INDEX IF NOT EXISTS idx_thu_gop_y_created_at ON public.thu_gop_y(created_at DESC);

-- Enable RLS
ALTER TABLE public.thu_gop_y ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert
CREATE POLICY "Allow anyone to insert suggestions" ON public.thu_gop_y
  FOR INSERT WITH CHECK (TRUE);

-- Allow admin to select all
CREATE POLICY "Allow admin to select suggestions" ON public.thu_gop_y
  FOR SELECT USING (TRUE);
