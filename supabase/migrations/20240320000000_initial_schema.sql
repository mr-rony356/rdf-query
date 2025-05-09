-- Create custom types
CREATE TYPE user_role AS ENUM ('guest', 'user', 'admin');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table that extends auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'guest',
  is_active BOOLEAN DEFAULT TRUE,
  approval_status request_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create registration requests table
CREATE TABLE IF NOT EXISTS registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  reason TEXT,
  status request_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved queries table
CREATE TABLE IF NOT EXISTS saved_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  query_content JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create query history table
CREATE TABLE IF NOT EXISTS query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query_content JSONB NOT NULL,
  results JSONB,
  execution_time INTEGER, -- milliseconds
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  default_query_limit INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Registration requests policies
CREATE POLICY "Admins can view all registration requests" 
ON registration_requests FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins can update registration requests" 
ON registration_requests FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Users can view their own registration request" 
ON registration_requests FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own registration request" 
ON registration_requests FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Saved queries policies
CREATE POLICY "Users can view their own saved queries" 
ON saved_queries FOR SELECT 
USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can insert their own saved queries" 
ON saved_queries FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own saved queries" 
ON saved_queries FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own saved queries" 
ON saved_queries FOR DELETE 
USING (user_id = auth.uid());

-- Query history policies
CREATE POLICY "Users can view their own query history" 
ON query_history FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own query history" 
ON query_history FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- User settings policies
CREATE POLICY "Users can view their own settings" 
ON user_settings FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own settings" 
ON user_settings FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Function to handle registration approval
CREATE OR REPLACE FUNCTION approve_registration(
  request_id UUID,
  approved BOOLEAN,
  admin_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the user_id from the registration request
  SELECT user_id INTO v_user_id
  FROM registration_requests
  WHERE id = request_id;
  
  -- Update the registration request status
  UPDATE registration_requests
  SET 
    status = CASE WHEN approved THEN 'approved'::request_status ELSE 'rejected'::request_status END,
    reviewed_by = admin_id,
    updated_at = NOW()
  WHERE id = request_id;
  
  -- If approved, update the user's role to 'user'
  IF approved AND v_user_id IS NOT NULL THEN
    UPDATE profiles
    SET 
      role = 'user',
      approval_status = 'approved',
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_approval_status ON profiles(approval_status);
CREATE INDEX idx_registration_requests_status ON registration_requests(status);
CREATE INDEX idx_saved_queries_user_id ON saved_queries(user_id);
CREATE INDEX idx_query_history_user_id ON query_history(user_id);
CREATE INDEX idx_query_history_created_at ON query_history(created_at);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_active, approval_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.full_name,
    'guest',
    TRUE,
    'pending'
  );
  
  -- Create default user settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 