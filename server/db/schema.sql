-- Mshkltk Database Schema
-- PostgreSQL with PostGIS extension for geospatial features

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM (
  'citizen',
  'municipality',
  'utility',
  'union_of_municipalities',
  'super_admin'
);

CREATE TYPE portal_access_level AS ENUM (
  'read_only',
  'read_write'
);

CREATE TYPE report_category AS ENUM (
  'infrastructure',
  'electricity_energy',
  'water_sanitation',
  'waste_environment',
  'public_safety',
  'public_spaces',
  'public_health',
  'urban_planning',
  'transportation',
  'emergencies',
  'transparency_services',
  'other_unknown'
);

CREATE TYPE report_status AS ENUM (
  'new',
  'received',
  'in_progress',
  'resolved'
);

CREATE TYPE report_severity AS ENUM (
  'high',
  'medium',
  'low'
);

CREATE TYPE notification_type AS ENUM (
  'status_change',
  'new_comment',
  'report_confirmed',
  'badge_earned',
  'report_resolved'
);

-- =====================================================
-- USERS TABLE
-- =====================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  display_name VARCHAR(255) NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  password_hash TEXT,
  salt TEXT,
  points INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  reports_count INTEGER DEFAULT 0,
  reports_confirmed INTEGER DEFAULT 0,
  confirmed_report_ids TEXT[] DEFAULT '{}',
  subscribed_report_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  avatar_url TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  role user_role DEFAULT 'citizen',
  portal_access_level portal_access_level,
  municipality_id VARCHAR(100),
  scoped_categories report_category[],
  scoped_municipalities TEXT[],
  scoped_sub_categories TEXT[],
  is_active BOOLEAN DEFAULT true,
  portal_title VARCHAR(255),
  portal_subtitle VARCHAR(255)
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_municipality_id ON users(municipality_id);

-- =====================================================
-- REPORTS TABLE
-- =====================================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  photo_urls TEXT[] DEFAULT '{}',
  location GEOGRAPHY(POINT, 4326) NOT NULL,  -- PostGIS geography for lat/lng
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  area VARCHAR(500),
  municipality VARCHAR(100) NOT NULL,
  category report_category NOT NULL,
  sub_category VARCHAR(100),
  note_en TEXT NOT NULL,
  note_ar TEXT NOT NULL,
  status report_status DEFAULT 'new',
  severity report_severity DEFAULT 'medium',
  confirmations_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  subscribed_user_ids TEXT[] DEFAULT '{}'
);

CREATE INDEX idx_reports_municipality ON reports(municipality);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_location ON reports USING GIST(location);  -- Spatial index

-- =====================================================
-- COMMENTS TABLE
-- =====================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_report_id ON comments(report_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  body_en TEXT,
  body_ar TEXT,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_report_id ON notifications(report_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- REPORT HISTORY TABLE
-- =====================================================

CREATE TABLE report_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  old_status report_status,
  new_status report_status NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  proof_urls TEXT[] DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_history_report_id ON report_history(report_id);
CREATE INDEX idx_report_history_timestamp ON report_history(timestamp DESC);

-- =====================================================
-- DYNAMIC CATEGORIES TABLE (Super Admin Management)
-- =====================================================

CREATE TABLE dynamic_categories (
  id VARCHAR(100) PRIMARY KEY,
  label_en VARCHAR(255) NOT NULL,
  label_ar VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  color VARCHAR(50),
  sub_categories JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DYNAMIC BADGES TABLE (Super Admin Management)
-- =====================================================

CREATE TABLE dynamic_badges (
  id VARCHAR(100) PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon VARCHAR(100),
  color VARCHAR(50),
  requirement_type VARCHAR(100),
  requirement_value INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- GAMIFICATION SETTINGS TABLE (Super Admin Management)
-- =====================================================

CREATE TABLE gamification_settings (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'default',
  points_rules JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default gamification settings
INSERT INTO gamification_settings (id, points_rules) VALUES (
  'default',
  '[
    {"id": "submit_report", "points": 10, "description": "For submitting a new report"},
    {"id": "confirm_report", "points": 3, "description": "For confirming an existing report"},
    {"id": "earn_badge", "points": 25, "description": "Bonus for earning a new badge"},
    {"id": "comment", "points": 2, "description": "For adding a comment to a report"}
  ]'::jsonb
);

-- =====================================================
-- AUDIT LOG TABLE (For tracking admin actions)
-- =====================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
