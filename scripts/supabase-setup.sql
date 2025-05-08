-- OmniAgent Supabase Database Setup Script
-- This script creates the necessary tables, triggers, and RLS policies
-- for the OmniAgent application

-- Enable RLS on all tables
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_settings ENABLE ROW LEVEL SECURITY;

-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  preview TEXT,
  security_level TEXT NOT NULL DEFAULT 'class1',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create steps table if it doesn't exist
CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  log TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system',
  security_level TEXT NOT NULL DEFAULT 'class1',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  default_mode TEXT NOT NULL DEFAULT 'assistant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_settings_user_id_key UNIQUE (user_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
DROP TRIGGER IF EXISTS set_tasks_updated_at ON tasks;
CREATE TRIGGER set_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_steps_updated_at ON steps;
CREATE TRIGGER set_steps_updated_at
BEFORE UPDATE ON steps
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_user_settings_updated_at ON user_settings;
CREATE TRIGGER set_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- RLS Policies for tasks
DROP POLICY IF EXISTS "Users can only view their own tasks" ON tasks;
CREATE POLICY "Users can only view their own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own tasks" ON tasks;
CREATE POLICY "Users can only insert their own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own tasks" ON tasks;
CREATE POLICY "Users can only update their own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own tasks" ON tasks;
CREATE POLICY "Users can only delete their own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for steps (via task ownership)
DROP POLICY IF EXISTS "Users can only view steps for their tasks" ON steps;
CREATE POLICY "Users can only view steps for their tasks"
ON steps FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = steps.task_id
    AND tasks.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can only insert steps for their tasks" ON steps;
CREATE POLICY "Users can only insert steps for their tasks"
ON steps FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = steps.task_id
    AND tasks.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can only update steps for their tasks" ON steps;
CREATE POLICY "Users can only update steps for their tasks"
ON steps FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = steps.task_id
    AND tasks.user_id = auth.uid()
  )
);

-- RLS Policies for user_settings
DROP POLICY IF EXISTS "Users can only view their own settings" ON user_settings;
CREATE POLICY "Users can only view their own settings"
ON user_settings FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own settings" ON user_settings;
CREATE POLICY "Users can only update their own settings"
ON user_settings FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own settings" ON user_settings;
CREATE POLICY "Users can only insert their own settings"
ON user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_steps_task_id ON steps(task_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Helper functions for schema validation
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE (column_name text, data_type text) AS $$
BEGIN
  RETURN QUERY
  SELECT column_name::text, data_type::text
  FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_policies()
RETURNS TABLE (table_name text, name text, action text, definition text) AS $$
BEGIN
  RETURN QUERY
  SELECT p.tablename::text as table_name, p.policyname::text as name, 
         p.cmd::text as action, pg_get_expr(p.qual, p.polrelid)::text as definition
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 