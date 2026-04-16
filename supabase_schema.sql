-- Create a table for photos
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  guest_name TEXT,
  caption TEXT,
  is_approved BOOLEAN DEFAULT TRUE, -- Set to FALSE if you want moderation by default
  width INTEGER,
  height INTEGER
);

-- Enable Realtime for the photos table
ALTER PUBLICATION supabase_realtime ADD TABLE photos;

-- Create a storage bucket for photos
-- Note: You'll need to create a bucket named 'wedding-photos' in the Supabase UI 
-- and set its privacy to 'Public'.
