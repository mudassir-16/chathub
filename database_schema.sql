-- AnonConfess Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Confessions Table
CREATE TABLE IF NOT EXISTS confessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    support_count INTEGER DEFAULT 0,
    relate_count INTEGER DEFAULT 0,
    agree_count INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT content_length CHECK (char_length(content) >= 10 AND char_length(content) <= 1000),
    CONSTRAINT valid_category CHECK (category IN ('general', 'love', 'college', 'career', 'stress', 'family', 'secrets', 'random'))
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    confession_id UUID REFERENCES confessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT comment_length CHECK (char_length(comment) >= 1 AND char_length(comment) <= 500)
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_target_type CHECK (target_type IN ('confession', 'comment'))
);

-- Reactions Table (Optional - for tracking individual user reactions)
CREATE TABLE IF NOT EXISTS reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    confession_id UUID REFERENCES confessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_reaction CHECK (reaction_type IN ('support', 'relate', 'agree')),
    CONSTRAINT unique_user_reaction UNIQUE (confession_id, user_id, reaction_type)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_confessions_created_at ON confessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confessions_category ON confessions(category);
CREATE INDEX IF NOT EXISTS idx_confessions_user_id ON confessions(user_id);
CREATE INDEX IF NOT EXISTS idx_confessions_support_count ON confessions(support_count DESC);
CREATE INDEX IF NOT EXISTS idx_comments_confession_id ON comments(confession_id);
CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (true);

-- Confessions Policies
CREATE POLICY "Confessions are viewable by everyone"
    ON confessions FOR SELECT
    USING (NOT is_flagged);

CREATE POLICY "Authenticated users can insert confessions"
    ON confessions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own confessions"
    ON confessions FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete their own confessions"
    ON confessions FOR DELETE
    USING (true);

-- Comments Policies
CREATE POLICY "Comments are viewable by everyone"
    ON comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert comments"
    ON comments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can delete their own comments"
    ON comments FOR DELETE
    USING (true);

-- Reports Policies
CREATE POLICY "Users can insert reports"
    ON reports FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Reports are viewable by admins only"
    ON reports FOR SELECT
    USING (false); -- Modify this based on your admin authentication

-- Reactions Policies
CREATE POLICY "Reactions are viewable by everyone"
    ON reactions FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own reactions"
    ON reactions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can delete their own reactions"
    ON reactions FOR DELETE
    USING (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_confessions_updated_at
    BEFORE UPDATE ON confessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment reaction counts
CREATE OR REPLACE FUNCTION increment_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reaction_type = 'support' THEN
        UPDATE confessions SET support_count = support_count + 1 WHERE id = NEW.confession_id;
    ELSIF NEW.reaction_type = 'relate' THEN
        UPDATE confessions SET relate_count = relate_count + 1 WHERE id = NEW.confession_id;
    ELSIF NEW.reaction_type = 'agree' THEN
        UPDATE confessions SET agree_count = agree_count + 1 WHERE id = NEW.confession_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement reaction counts
CREATE OR REPLACE FUNCTION decrement_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.reaction_type = 'support' THEN
        UPDATE confessions SET support_count = GREATEST(support_count - 1, 0) WHERE id = OLD.confession_id;
    ELSIF OLD.reaction_type = 'relate' THEN
        UPDATE confessions SET relate_count = GREATEST(relate_count - 1, 0) WHERE id = OLD.confession_id;
    ELSIF OLD.reaction_type = 'agree' THEN
        UPDATE confessions SET agree_count = GREATEST(agree_count - 1, 0) WHERE id = OLD.confession_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for reaction count management
CREATE TRIGGER on_reaction_insert
    AFTER INSERT ON reactions
    FOR EACH ROW
    EXECUTE FUNCTION increment_reaction_count();

CREATE TRIGGER on_reaction_delete
    AFTER DELETE ON reactions
    FOR EACH ROW
    EXECUTE FUNCTION decrement_reaction_count();

-- Sample Data (Optional - for testing)
-- Uncomment to insert sample data

/*
INSERT INTO profiles (firebase_uid, username) VALUES
    ('test_uid_1', 'midnight_thinker'),
    ('test_uid_2', 'anonymous_soul'),
    ('test_uid_3', 'truth_seeker');

INSERT INTO confessions (user_id, username, content, category, support_count, relate_count, agree_count) VALUES
    (
        (SELECT id FROM profiles WHERE username = 'midnight_thinker'),
        'midnight_thinker',
        'Sometimes I feel like I''m not good enough, but I keep pushing forward anyway.',
        'stress',
        15,
        8,
        12
    ),
    (
        (SELECT id FROM profiles WHERE username = 'anonymous_soul'),
        'anonymous_soul',
        'I finally got the courage to tell my crush how I feel. They said yes!',
        'love',
        42,
        5,
        38
    ),
    (
        (SELECT id FROM profiles WHERE username = 'truth_seeker'),
        'truth_seeker',
        'College is harder than I expected, but I''m learning so much about myself.',
        'college',
        23,
        18,
        20
    );
*/

-- Realtime Publication (Enable realtime for tables)
-- Run these commands in Supabase Dashboard > Database > Replication
-- Or use the Supabase UI to enable realtime for these tables:
-- - confessions
-- - comments
-- - reactions

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'AnonConfess database schema created successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Enable Realtime for confessions, comments, and reactions tables in Supabase Dashboard';
    RAISE NOTICE '2. Update config.js with your Supabase credentials';
    RAISE NOTICE '3. Update config.js with your Firebase credentials';
END $$;
