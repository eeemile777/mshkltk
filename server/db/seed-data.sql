-- =====================================================
-- SEED DATA: Categories, Badges, and Test Users
-- Date: 2025-11-19
-- Description: Populates Super Admin dynamic configuration
-- =====================================================

-- Clear existing data
TRUNCATE TABLE dynamic_categories, dynamic_badges, users CASCADE;

-- =====================================================
-- SEED CATEGORIES (12 categories from spec)
-- =====================================================

INSERT INTO dynamic_categories (id, label_en, label_ar, name_en, name_ar, icon, color, color_dark, sub_categories, is_active) VALUES
('infrastructure', 'Infrastructure', 'البنية التحتية', 'Infrastructure', 'البنية التحتية', 'FaRoadBridge', '#4A90E2', '#5EBFDE', 
  '[
    {"id": "unpaved_roads", "name_en": "Unpaved or damaged roads", "name_ar": "طرق غير معبدة أو متضررة"},
    {"id": "broken_sidewalks", "name_en": "Broken or occupied sidewalks", "name_ar": "أرصفة مكسورة أو مشغولة"},
    {"id": "bridge_maintenance", "name_en": "Bridges/stairways maintenance", "name_ar": "صيانة الجسور والسلالم"}
  ]'::jsonb, true),

('electricity_energy', 'Electricity & Energy', 'الكهرباء والطاقة', 'Electricity & Energy', 'الكهرباء والطاقة', 'FaBolt', '#F5A623', '#FFC06A',
  '[
    {"id": "unprotected_poles", "name_en": "Unprotected electricity poles", "name_ar": "أعمدة كهرباء غير محمية"},
    {"id": "exposed_wires", "name_en": "Exposed electric wires", "name_ar": "أسلاك كهربائية مكشوفة"},
    {"id": "unsafe_generators", "name_en": "Unsafe private generator connections", "name_ar": "وصلات مولدات خاصة غير آمنة"},
    {"id": "public_lighting", "name_en": "Malfunctioning public lighting", "name_ar": "إنارة عامة معطلة"}
  ]'::jsonb, true),

('water_sanitation', 'Water & Sanitation', 'المياه والصرف الصحي', 'Water & Sanitation', 'المياه والصرف الصحي', 'FaFaucetDrip', '#50E3C2', '#63E9C8',
  '[
    {"id": "water_leak", "name_en": "Leaking potable water", "name_ar": "تسرب مياه الشرب"},
    {"id": "blocked_sewage", "name_en": "Blocked or overflowing sewage", "name_ar": "مجاري مسدودة أو فائضة"},
    {"id": "stormwater_drainage", "name_en": "Lack of stormwater drainage", "name_ar": "نقص في أنظمة تصريف مياه الأمطار"}
  ]'::jsonb, true),

('waste_environment', 'Waste & Environment', 'النفايات والبيئة', 'Waste & Environment', 'النفايات والبيئة', 'FaRecycle', '#B8E986', '#C6F497',
  '[
    {"id": "garbage_accumulation", "name_en": "Garbage accumulation", "name_ar": "تراكم القمامة"},
    {"id": "missing_bins", "name_en": "Missing/overflowing bins", "name_ar": "حاويات مفقودة/فائضة"},
    {"id": "illegal_dumping", "name_en": "Illegal dumping sites", "name_ar": "مكبات نفايات غير شرعية"},
    {"id": "visual_pollution", "name_en": "Visual pollution (ads, etc.)", "name_ar": "تلوث بصري (إعلانات، تشويه)"},
    {"id": "noise_pollution", "name_en": "Noise pollution", "name_ar": "تلوث ضوضائي"}
  ]'::jsonb, true),

('public_safety', 'Public Safety', 'السلامة العامة', 'Public Safety', 'السلامة العامة', 'FaShieldHalved', '#9013FE', '#A53AFF',
  '[
    {"id": "broken_traffic_lights", "name_en": "Broken traffic lights", "name_ar": "إشارات مرور معطلة"},
    {"id": "missing_crossings", "name_en": "Missing pedestrian crossings", "name_ar": "غياب ممرات المشاة"},
    {"id": "unsafe_construction", "name_en": "Unsafe construction", "name_ar": "مواقع بناء غير آمنة"},
    {"id": "abandoned_vehicles", "name_en": "Abandoned/dangerously parked vehicles", "name_ar": "سيارات مهجورة أو متوقفة بشكل خطير"}
  ]'::jsonb, true),

('public_spaces', 'Public Spaces', 'المساحات العامة', 'Public Spaces', 'المساحات العامة', 'FaTreeCity', '#417505', '#549407',
  '[
    {"id": "neglected_parks", "name_en": "Neglected or dirty parks", "name_ar": "حدائق مهملة أو متسخة"},
    {"id": "broken_equipment", "name_en": "Broken benches or playground equipment", "name_ar": "مقاعد أو معدات ملاعب مكسورة"},
    {"id": "square_lighting", "name_en": "Non-functioning streetlights in squares", "name_ar": "إنارة معطلة في الساحات العامة"},
    {"id": "damaged_facilities", "name_en": "Damaged public facilities", "name_ar": "مرافق عامة متضررة"}
  ]'::jsonb, true),

('public_health', 'Public Health', 'الصحة العامة', 'Public Health', 'الصحة العامة', 'FaBriefcaseMedical', '#D0021B', '#E83D4F',
  '[
    {"id": "stray_animals", "name_en": "Stray animals posing risks", "name_ar": "حيوانات شاردة تشكل خطراً"},
    {"id": "insects_rodents", "name_en": "Spread of insects/rodents", "name_ar": "انتشار الحشرات/القوارض"},
    {"id": "stagnant_water", "name_en": "Stagnant or contaminated water", "name_ar": "مياه راكدة أو ملوثة"}
  ]'::jsonb, true),

('urban_planning', 'Urban Planning', 'التخطيط العمراني', 'Urban Planning', 'التخطيط العمراني', 'FaRulerCombined', '#BD10E0', '#D02FFA',
  '[
    {"id": "illegal_construction", "name_en": "Illegal construction", "name_ar": "بناء مخالف"},
    {"id": "occupied_sidewalks", "name_en": "Sidewalks occupied by shops", "name_ar": "أرصفة محتلة من قبل المحلات"},
    {"id": "public_property_encroachment", "name_en": "Encroachment on public property", "name_ar": "تعدي على الأملاك العامة"}
  ]'::jsonb, true),

('transportation', 'Transportation', 'النقل', 'Transportation', 'النقل', 'FaBus', '#7ED321', '#91E33A',
  '[
    {"id": "unregulated_stops", "name_en": "Unregulated bus stops", "name_ar": "مواقف حافلات غير منظمة"},
    {"id": "parking_issues", "name_en": "Lack or poor organization of parking", "name_ar": "نقص أو سوء تنظيم مواقف السيارات"},
    {"id": "missing_signage", "name_en": "Missing traffic signage", "name_ar": "غياب اللافتات المرورية"}
  ]'::jsonb, true),

('emergencies', 'Emergencies', 'الطوارئ', 'Emergencies', 'الطوارئ', 'FaTriangleExclamation', '#FF5A5F', '#FF8A8D',
  '[
    {"id": "accidents_collapses", "name_en": "Accidents or collapses", "name_ar": "حوادث أو انهيارات"},
    {"id": "falling_trees", "name_en": "Trees at risk of falling", "name_ar": "أشجار معرضة للسقوط"},
    {"id": "landslides", "name_en": "Landslides after storms", "name_ar": "انهيارات أرضية بعد العواصف"}
  ]'::jsonb, true),

('transparency_services', 'Transparency & Services', 'الشفافية والخدمات', 'Transparency & Services', 'الشفافية والخدمات', 'FaFileSignature', '#0D3B66', '#1E5A99',
  '[
    {"id": "absent_employees", "name_en": "Municipal employees absent", "name_ar": "غياب موظفي البلدية"},
    {"id": "paperwork_delays", "name_en": "Delays in citizen paperwork", "name_ar": "تأخير في معاملات المواطنين"},
    {"id": "lack_of_services", "name_en": "Lack of essential municipal services", "name_ar": "نقص في الخدمات البلدية الأساسية"}
  ]'::jsonb, true),

('other_unknown', 'Other / Unknown', 'أخرى / غير معروف', 'Other / Unknown', 'أخرى / غير معروف', 'FaQuestion', '#9E9E9E', '#BDBDBD',
  '[
    {"id": "unclear_issue", "name_en": "Unclear or out-of-scope issue", "name_ar": "مشكلة غير واضحة أو خارج النطاق"}
  ]'::jsonb, true);

-- =====================================================
-- SEED BADGES (14 badges from spec)
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

-- =====================================================
-- SEED TEST USERS (3 essential accounts)
-- =====================================================

-- Note: Password is 'password' hashed with bcrypt
INSERT INTO users (username, password_hash, display_name, role, is_active) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Admin', 'super_admin', true),
('beirut_portal', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Beirut Municipality', 'municipality', true),
('citizen_user', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test Citizen', 'citizen', true);

-- Update beirut portal user with municipality access
UPDATE users 
SET municipality_id = 'beirut', portal_access_level = 'read_write'
WHERE username = 'beirut_portal';

-- Print success message
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE '✓ 12 categories with sub-categories';
  RAISE NOTICE '✓ 14 badges with criteria';
  RAISE NOTICE '✓ 3 test users (admin/beirut_portal/citizen_user - all password: "password")';
END $$;
