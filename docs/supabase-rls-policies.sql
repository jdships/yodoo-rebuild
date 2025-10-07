-- RLS Policies for Yodoo AI
-- Run these commands in your Supabase SQL editor

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects table policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Chats table policies
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" ON chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats" ON chats
  FOR DELETE USING (auth.uid() = user_id);

-- Messages table policies
CREATE POLICY "Users can view messages from their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their chats" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their chats" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from their chats" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

-- Chat attachments table policies
CREATE POLICY "Users can view their own chat attachments" ON chat_attachments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat attachments" ON chat_attachments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat attachments" ON chat_attachments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat attachments" ON chat_attachments
  FOR DELETE USING (auth.uid() = user_id);

-- Feedback table policies
CREATE POLICY "Users can view their own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" ON feedback
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback" ON feedback
  FOR DELETE USING (auth.uid() = user_id);

-- User keys table policies (BYOK)
CREATE POLICY "Users can view their own API keys" ON user_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" ON user_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON user_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON user_keys
  FOR DELETE USING (auth.uid() = user_id);

-- User preferences table policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Service role bypass policies (for admin operations)
-- These allow the service role to bypass RLS for user creation and updates
CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage projects" ON projects
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage chats" ON chats
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage messages" ON messages
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage chat_attachments" ON chat_attachments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage feedback" ON feedback
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage user_keys" ON user_keys
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage user_preferences" ON user_preferences
  FOR ALL USING (auth.role() = 'service_role');
