-- ─── Health Records ───────────────────────────────────────────────────────────
-- Stores each AI symptom consultation result

CREATE TABLE IF NOT EXISTS health_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Core symptom data
  primary_symptom     TEXT NOT NULL,
  symptoms            TEXT[]        NOT NULL DEFAULT '{}',
  duration            TEXT,
  severity            TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  age                 INT,
  existing_conditions TEXT[]        NOT NULL DEFAULT '{}',
  medications         TEXT[]        NOT NULL DEFAULT '{}',

  -- Risk/urgency classification
  risk_level          TEXT NOT NULL CHECK (risk_level IN ('safe', 'monitor', 'consult', 'urgent')),
  urgency_level       TEXT          CHECK (urgency_level IN ('routine', 'urgent', 'emergency')),
  confidence          TEXT          CHECK (confidence IN ('low', 'medium', 'high')),
  needs_immediate_care BOOLEAN      NOT NULL DEFAULT FALSE,

  -- AI response fields
  summary             TEXT,
  risk_explanation    TEXT,
  recommended_action  TEXT,
  home_care           TEXT,
  disclaimer          TEXT,

  -- JSONB blobs for arrays
  disease_ranking     JSONB NOT NULL DEFAULT '[]',
  recommendations     JSONB NOT NULL DEFAULT '[]',
  watch_for           JSONB NOT NULL DEFAULT '[]'
);

-- Row-Level Security: each user only sees their own records
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own health records"
  ON health_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_health_records_user_created
  ON health_records (user_id, created_at DESC);


-- ─── Conversation Sessions ────────────────────────────────────────────────────
-- Stores multi-turn chat history (securely, server-side as per the guide)

CREATE TABLE IF NOT EXISTS conversation_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  messages     JSONB NOT NULL DEFAULT '[]',
  is_complete  BOOLEAN NOT NULL DEFAULT FALSE,
  record_id    UUID REFERENCES health_records(id) ON DELETE SET NULL
);

ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own sessions"
  ON conversation_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_sessions_user ON conversation_sessions (user_id, created_at DESC);


-- ─── User Profiles ────────────────────────────────────────────────────────────
-- Extends auth.users with health-specific metadata

CREATE TABLE IF NOT EXISTS user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  full_name  TEXT,
  phone      TEXT,
  age        INT,
  gender     TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  location   TEXT,                     -- village / district in Nepal
  lang       TEXT NOT NULL DEFAULT 'ne'
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
