-- Storage Bucket Policies for Yodoo AI
-- Run these in your Supabase Dashboard → Storage → Policies

-- Policy for uploading files to chat-attachments bucket
CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-attachments' 
    AND auth.role() = 'authenticated'
  );

-- Policy for viewing files in chat-attachments bucket  
CREATE POLICY "Authenticated users can view files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-attachments' 
    AND auth.role() = 'authenticated'
  );

-- Policy for deleting files in chat-attachments bucket
CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'chat-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Alternative more restrictive policy (if you want users to only access their own files)
CREATE POLICY "Users can only access their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- For avatars bucket (if you have one)
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
