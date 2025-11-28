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
  name_en VARCHAR(255),
  name_ar VARCHAR(255),
  icon VARCHAR(100),
  color VARCHAR(50),
  color_dark VARCHAR(50),
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
  category_filter VARCHAR(100),
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
-- SEED DATA: Categories, Badges, and Test Users
-- =====================================================

-- SEED CATEGORIES with both label_* and name_* (frontend expects name_*)
INSERT INTO dynamic_categories (id, label_en, label_ar, name_en, name_ar, icon, color, color_dark, sub_categories, is_active) VALUES
('infrastructure', 'Infrastructure', 'البنية التحتية', 'Infrastructure', 'البنية التحتية', 'FaRoadBridge', '#4A90E2', '#4A90E2', 
  '[
    {"id": "unpaved_roads", "name_en": "Unpaved or damaged roads", "name_ar": "طرق غير معبدة أو متضررة"},
    {"id": "broken_sidewalks", "name_en": "Broken or occupied sidewalks", "name_ar": "أرصفة مكسورة أو مشغولة"},
    {"id": "bridge_maintenance", "name_en": "Bridges/stairways maintenance", "name_ar": "صيانة الجسور والسلالم"}
  ]'::jsonb, true),

('electricity_energy', 'Electricity & Energy', 'الكهرباء والطاقة', 'Electricity & Energy', 'الكهرباء والطاقة', 'FaBolt', '#F5A623', '#F5A623',
  '[
    {"id": "unprotected_poles", "name_en": "Unprotected electricity poles", "name_ar": "أعمدة كهرباء غير محمية"},
    {"id": "exposed_wires", "name_en": "Exposed electric wires", "name_ar": "أسلاك كهربائية مكشوفة"},
    {"id": "unsafe_generators", "name_en": "Unsafe private generator connections", "name_ar": "وصلات مولدات خاصة غير آمنة"},
    {"id": "public_lighting", "name_en": "Malfunctioning public lighting", "name_ar": "إنارة عامة معطلة"}
  ]'::jsonb, true),

('water_sanitation', 'Water & Sanitation', 'المياه والصرف الصحي', 'Water & Sanitation', 'المياه والصرف الصحي', 'FaFaucetDrip', '#50E3C2', '#50E3C2',
  '[
    {"id": "water_leak", "name_en": "Leaking potable water", "name_ar": "تسرب مياه الشرب"},
    {"id": "blocked_sewage", "name_en": "Blocked or overflowing sewage", "name_ar": "مجاري مسدودة أو فائضة"},
    {"id": "stormwater_drainage", "name_en": "Lack of stormwater drainage", "name_ar": "نقص في أنظمة تصريف مياه الأمطار"}
  ]'::jsonb, true),

('waste_environment', 'Waste & Environment', 'النفايات والبيئة', 'Waste & Environment', 'النفايات والبيئة', 'FaRecycle', '#B8E986', '#B8E986',
  '[
    {"id": "garbage_accumulation", "name_en": "Garbage accumulation", "name_ar": "تراكم القمامة"},
    {"id": "missing_bins", "name_en": "Missing/overflowing bins", "name_ar": "حاويات مفقودة/فائضة"},
    {"id": "illegal_dumping", "name_en": "Illegal dumping sites", "name_ar": "مكبات نفايات غير شرعية"},
    {"id": "visual_pollution", "name_en": "Visual pollution (ads, etc.)", "name_ar": "تلوث بصري (إعلانات، تشويه)"},
    {"id": "noise_pollution", "name_en": "Noise pollution", "name_ar": "تلوث ضوضائي"}
  ]'::jsonb, true),

('public_safety', 'Public Safety', 'السلامة العامة', 'Public Safety', 'السلامة العامة', 'FaShieldHalved', '#9013FE', '#9013FE',
  '[
    {"id": "broken_traffic_lights", "name_en": "Broken traffic lights", "name_ar": "إشارات مرور معطلة"},
    {"id": "missing_crossings", "name_en": "Missing pedestrian crossings", "name_ar": "غياب ممرات المشاة"},
    {"id": "unsafe_construction", "name_en": "Unsafe construction", "name_ar": "مواقع بناء غير آمنة"},
    {"id": "abandoned_vehicles", "name_en": "Abandoned/dangerously parked vehicles", "name_ar": "سيارات مهجورة أو متوقفة بشكل خطير"}
  ]'::jsonb, true),

('public_spaces', 'Public Spaces', 'المساحات العامة', 'Public Spaces', 'المساحات العامة', 'FaTreeCity', '#417505', '#417505',
  '[
    {"id": "neglected_parks", "name_en": "Neglected or dirty parks", "name_ar": "حدائق مهملة أو متسخة"},
    {"id": "broken_equipment", "name_en": "Broken benches or playground equipment", "name_ar": "مقاعد أو معدات ملاعب مكسورة"},
    {"id": "square_lighting", "name_en": "Non-functioning streetlights in squares", "name_ar": "إنارة معطلة في الساحات العامة"},
    {"id": "damaged_facilities", "name_en": "Damaged public facilities", "name_ar": "مرافق عامة متضررة"}
  ]'::jsonb, true),

('public_health', 'Public Health', 'الصحة العامة', 'Public Health', 'الصحة العامة', 'FaBriefcaseMedical', '#D0021B', '#D0021B',
  '[
    {"id": "stray_animals", "name_en": "Stray animals posing risks", "name_ar": "حيوانات شاردة تشكل خطراً"},
    {"id": "insects_rodents", "name_en": "Spread of insects/rodents", "name_ar": "انتشار الحشرات/القوارض"},
    {"id": "stagnant_water", "name_en": "Stagnant or contaminated water", "name_ar": "مياه راكدة أو ملوثة"}
  ]'::jsonb, true),

('urban_planning', 'Urban Planning', 'التخطيط العمراني', 'Urban Planning', 'التخطيط العمراني', 'FaRulerCombined', '#BD10E0', '#BD10E0',
  '[
    {"id": "illegal_construction", "name_en": "Illegal construction", "name_ar": "بناء مخالف"},
    {"id": "occupied_sidewalks", "name_en": "Sidewalks occupied by shops", "name_ar": "أرصفة محتلة من قبل المحلات"},
    {"id": "public_property_encroachment", "name_en": "Encroachment on public property", "name_ar": "تعدي على الأملاك العامة"}
  ]'::jsonb, true),

('transportation', 'Transportation', 'النقل', 'Transportation', 'النقل', 'FaBus', '#7ED321', '#7ED321',
  '[
    {"id": "unregulated_stops", "name_en": "Unregulated bus stops", "name_ar": "مواقف حافلات غير منظمة"},
    {"id": "parking_issues", "name_en": "Lack or poor organization of parking", "name_ar": "نقص أو سوء تنظيم مواقف السيارات"},
    {"id": "missing_signage", "name_en": "Missing traffic signage", "name_ar": "غياب اللافتات المرورية"}
  ]'::jsonb, true),

('emergencies', 'Emergencies', 'الطوارئ', 'Emergencies', 'الطوارئ', 'FaTriangleExclamation', '#FF5A5F', '#FF5A5F',
  '[
    {"id": "accidents_collapses", "name_en": "Accidents or collapses", "name_ar": "حوادث أو انهيارات"},
    {"id": "falling_trees", "name_en": "Trees at risk of falling", "name_ar": "أشجار معرضة للسقوط"},
    {"id": "landslides", "name_en": "Landslides after storms", "name_ar": "انهيارات أرضية بعد العواصف"}
  ]'::jsonb, true),

('transparency_services', 'Transparency & Services', 'الشفافية والخدمات', 'Transparency & Services', 'الشفافية والخدمات', 'FaFileSignature', '#0D3B66', '#0D3B66',
  '[
    {"id": "absent_employees", "name_en": "Municipal employees absent", "name_ar": "غياب موظفي البلدية"},
    {"id": "paperwork_delays", "name_en": "Delays in citizen paperwork", "name_ar": "تأخير في معاملات المواطنين"},
    {"id": "lack_of_services", "name_en": "Lack of essential municipal services", "name_ar": "نقص في الخدمات البلدية الأساسية"}
  ]'::jsonb, true),

('other_unknown', 'Other / Unknown', 'أخرى / غير معروف', 'Other / Unknown', 'أخرى / غير معروف', 'FaQuestion', '#9E9E9E', '#9E9E9E',
  '[
    {"id": "unclear_issue", "name_en": "Unclear or out-of-scope issue", "name_ar": "مشكلة غير واضحة أو خارج النطاق"}
  ]'::jsonb, true);

-- =====================================================
-- SEED BADGES (14 badges with criteria)
-- =====================================================

INSERT INTO dynamic_badges (id, name_en, name_ar, description_en, description_ar, icon, requirement_type, requirement_value, category_filter, is_active) VALUES
('pioneer', 'Pioneer', 'الرائد', 'Submitted your first report.', 'قدم أول بلاغ لك.', 'FaStar', 'report_count', 1, NULL, true),
('waste_warrior', 'Waste Warrior', 'محارب النفايات', 'Submitted 3 reports about waste.', 'قدم 3 بلاغات عن النفايات.', 'FaDumpster', 'report_count', 3, 'waste_environment', true),
('road_guardian', 'Road Guardian', 'حارس الطريق', 'Submitted a report about roads.', 'قدم بلاغاً عن الطرق.', 'FaShieldHalved', 'report_count', 1, 'infrastructure', true),
('lightbringer', 'Lightbringer', 'جالب النور', 'Submitted a report about lighting.', 'قدم بلاغاً عن الإنارة.', 'FaLightbulb', 'report_count', 1, 'electricity_energy', true),
('civic_scout', 'Civic Scout', 'الكشاف المدني', 'Submitted a report in the "Other" category.', 'قدم بلاغاً من فئة "أخرى".', 'FaQuestion', 'report_count', 1, 'other_unknown', true),
('city_explorer', 'City Explorer', 'مستكشف المدينة', 'Reported in 3 different areas.', 'قدم بلاغات في 3 مناطق مختلفة.', 'FaLocationArrow', 'report_count', 3, NULL, true),
('good_samaritan', 'Good Samaritan', 'فاعل خير', 'Confirmed your first report.', 'أكدت أول بلاغ لك.', 'FaHeart', 'confirmation_count', 1, NULL, true),
('community_helper', 'Community Helper', 'مساعد المجتمع', 'Confirmed 5 reports.', 'أكدت 5 بلاغات.', 'FaHandshakeAngle', 'confirmation_count', 5, NULL, true),
('civic_leader', 'Civic Leader', 'قائد مدني', 'Reached 100 points.', 'وصلت إلى 100 نقطة.', 'FaTrophy', 'point_threshold', 100, NULL, true),
('water_watchdog', 'Water Watchdog', 'رقيب المياه', 'Reported an issue about water or sanitation.', 'قدم بلاغاً عن المياه أو الصرف الصحي.', 'FaDroplet', 'report_count', 1, 'water_sanitation', true),
('safety_sentinel', 'Safety Sentinel', 'حارس السلامة', 'Reported a public safety hazard.', 'قدم بلاغاً عن خطر على السلامة العامة.', 'FaTrafficLight', 'report_count', 1, 'public_safety', true),
('park_protector', 'Park Protector', 'حامي الحدائق', 'Reported an issue in a public space.', 'قدم بلاغاً عن مشكلة في مساحة عامة.', 'FaPersonShelter', 'report_count', 1, 'public_spaces', true),
('health_hero', 'Health Hero', 'بطل الصحة', 'Reported a public health concern.', 'قدم بلاغاً عن مشكلة صحية عامة.', 'FaVirusSlash', 'report_count', 1, 'public_health', true),
('urban_planner', 'Urban Planner', 'المخطط الحضري', 'Reported an urban planning violation.', 'قدم بلاغاً عن مخالفة تخطيط عمراني.', 'FaBuildingUser', 'report_count', 1, 'urban_planning', true);

-- Note: Admin password is 'password' with per-user salt scheme:
-- bcrypt(hash of (password + salt)) using SALT_ROUNDS=10
INSERT INTO users (username, password_hash, salt, display_name, role, is_active)
VALUES (
  'admin',
  '$2b$10$WMMAjPIYJY.Bi7OZuLXqueSJ9dsM2vIipNpZHL4hk1y2/CmDtj.Pm',
  'static_dev_salt_admin',
  'Super Admin',
  'super_admin',
  true
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
