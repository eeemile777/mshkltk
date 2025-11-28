-- Mshkltk Database Seed Data
-- This file populates the database with default/demo data

-- =====================================================
-- CLEAR EXISTING DATA (in correct order due to foreign keys)
-- =====================================================

TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE report_history CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE reports CASCADE;
-- Keep dynamic configuration seeded by schema.sql
-- TRUNCATE TABLE dynamic_categories CASCADE;
-- TRUNCATE TABLE dynamic_badges CASCADE;
-- gamification_settings already has default data from schema.sql

-- Categories are seeded by schema.sql (with sub_categories)

-- Badges are seeded by schema.sql

-- =====================================================
-- SEED USERS
-- =====================================================
-- NOTE: All demo users can be edited/deleted from Super Admin panel
-- Use /api/users endpoints to manage users
-- IMPORTANT: Change all passwords before production!
-- PASSWORD: 'password' (bcrypt hashed with salt 'salt123')
-- BCRYPT HASH: $2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq

-- NOTE: Do not recreate Super Admin here. Admin is seeded by schema.sql.

-- Portal Users (Municipality Access) - EDITABLE/DELETABLE
INSERT INTO users (id, username, password_hash, salt, role, display_name, municipality_id, portal_access_level, points, reports_count, reports_confirmed, achievements, created_at) VALUES
(uuid_generate_v4(), 'beirut_portal', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'municipality', 'Beirut Municipality Portal', 'beirut', 'read_write', 0, 0, 0, '{}', NOW()),
(uuid_generate_v4(), 'tripoli_portal', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'municipality', 'Tripoli Municipality Portal', 'tripoli', 'read_write', 0, 0, 0, '{}', NOW()),
(uuid_generate_v4(), 'sidon_portal', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'municipality', 'Sidon Municipality Portal', 'sidon', 'read_only', 0, 0, 0, '{}', NOW())
ON CONFLICT (username) DO NOTHING;

-- Regular Citizens (Demo Users) - FULLY EDITABLE/DELETABLE
-- Creating 25 realistic users with varied activity levels
INSERT INTO users (id, username, password_hash, salt, role, display_name, municipality_id, points, reports_count, reports_confirmed, achievements, created_at) VALUES
-- Power users (very active, lots of reports)
(uuid_generate_v4(), 'ali_hassan', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Ali Hassan', NULL, 245, 15, 8, '{pioneer,civic_leader,community_helper}', NOW() - INTERVAL '120 days'),
(uuid_generate_v4(), 'maya_khalil', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Maya Khalil', NULL, 198, 12, 6, '{pioneer,waste_warrior,civic_leader}', NOW() - INTERVAL '90 days'),
(uuid_generate_v4(), 'layla_nasser', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Layla Nasser', NULL, 167, 10, 5, '{pioneer,civic_leader,community_helper}', NOW() - INTERVAL '80 days'),

-- Active users (moderate activity)
(uuid_generate_v4(), 'rami_said', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Rami Said', NULL, 132, 8, 4, '{pioneer,road_guardian}', NOW() - INTERVAL '70 days'),
(uuid_generate_v4(), 'omar_haddad', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Omar Haddad', NULL, 115, 7, 3, '{pioneer,good_samaritan}', NOW() - INTERVAL '60 days'),
(uuid_generate_v4(), 'nour_ibrahim', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Nour Ibrahim', NULL, 98, 6, 3, '{pioneer,waste_warrior}', NOW() - INTERVAL '55 days'),
(uuid_generate_v4(), 'zahra_mansour', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Zahra Mansour', NULL, 87, 5, 2, '{pioneer}', NOW() - INTERVAL '50 days'),
(uuid_generate_v4(), 'karim_saleh', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Karim Saleh', NULL, 76, 5, 2, '{pioneer,road_guardian}', NOW() - INTERVAL '48 days'),

-- Regular users (occasional reporters)
(uuid_generate_v4(), 'sara_azar', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Sara Azar', NULL, 54, 4, 1, '{pioneer}', NOW() - INTERVAL '45 days'),
(uuid_generate_v4(), 'ahmad_khoury', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Ahmad Khoury', NULL, 51, 3, 2, '{pioneer}', NOW() - INTERVAL '42 days'),
(uuid_generate_v4(), 'dina_elias', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Dina Elias', NULL, 47, 3, 1, '{pioneer}', NOW() - INTERVAL '40 days'),
(uuid_generate_v4(), 'youssef_chahine', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Youssef Chahine', NULL, 43, 3, 1, '{pioneer}', NOW() - INTERVAL '38 days'),
(uuid_generate_v4(), 'lina_farah', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Lina Farah', NULL, 39, 3, 1, '{pioneer}', NOW() - INTERVAL '35 days'),

-- Light users (few reports)
(uuid_generate_v4(), 'marwan_badawi', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Marwan Badawi', NULL, 32, 2, 1, '{pioneer}', NOW() - INTERVAL '30 days'),
(uuid_generate_v4(), 'hala_sfeir', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Hala Sfeir', NULL, 28, 2, 0, '{pioneer}', NOW() - INTERVAL '28 days'),
(uuid_generate_v4(), 'fadi_geagea', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Fadi Geagea', NULL, 24, 2, 1, '{pioneer}', NOW() - INTERVAL '25 days'),
(uuid_generate_v4(), 'rima_harb', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Rima Harb', NULL, 21, 1, 0, '{pioneer}', NOW() - INTERVAL '22 days'),
(uuid_generate_v4(), 'michel_aoun', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Michel Aoun', NULL, 18, 1, 0, '{pioneer}', NOW() - INTERVAL '20 days'),
(uuid_generate_v4(), 'nadine_labaki', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Nadine Labaki', NULL, 16, 1, 0, '{pioneer}', NOW() - INTERVAL '18 days'),
(uuid_generate_v4(), 'georges_khabbaz', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Georges Khabbaz', NULL, 14, 1, 0, '{pioneer}', NOW() - INTERVAL '15 days'),

-- Very light users (1 report each)
(uuid_generate_v4(), 'rita_hayek', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Rita Hayek', NULL, 12, 1, 0, '{pioneer}', NOW() - INTERVAL '12 days'),
(uuid_generate_v4(), 'elie_saab', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Elie Saab', NULL, 10, 1, 0, '{pioneer}', NOW() - INTERVAL '10 days'),
(uuid_generate_v4(), 'carine_roitfeld', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Carine Roitfeld', NULL, 10, 1, 0, '{pioneer}', NOW() - INTERVAL '8 days'),
(uuid_generate_v4(), 'ziad_doueiri', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Ziad Doueiri', NULL, 10, 1, 0, '{pioneer}', NOW() - INTERVAL '6 days'),
(uuid_generate_v4(), 'nada_zeidan', '$2b$10$/XKB3KURteVp2nW0mjXnou.u.V6wh4DxBRJ6L3lCaqlVQ8slrf5sq', 'salt123', 'citizen', 'Nada Zeidan', NULL, 10, 1, 0, '{pioneer}', NOW() - INTERVAL '4 days')
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- SEED SAMPLE REPORTS (100 reports across Lebanon)
-- =====================================================

-- Get user IDs for report creation
DO $$
DECLARE
    user_array UUID[];
    all_users UUID[];
    random_user UUID;
    user_weights INTEGER[] := ARRAY[15, 15, 12, 12, 10, 8, 7, 6, 5, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1]; -- Report distribution weights
    total_weight INTEGER := 100;
    random_weight INTEGER;
    cumulative_weight INTEGER;
    user_index INTEGER;
    report1_id UUID;
    report2_id UUID;
    report3_id UUID;
    i INTEGER;
    j INTEGER;
    random_category TEXT;
    random_status TEXT;
    random_severity TEXT;
    random_lat DECIMAL;
    random_lng DECIMAL;
    random_municipality TEXT;
    random_confirmations INTEGER;
    categories TEXT[] := ARRAY['infrastructure', 'electricity_energy', 'water_sanitation', 'waste_environment', 'public_safety', 'public_spaces', 'public_health', 'urban_planning', 'transportation', 'emergencies'];
    statuses TEXT[] := ARRAY['new', 'received', 'in_progress', 'resolved'];
    severities TEXT[] := ARRAY['low', 'medium', 'high'];
    
    -- Realistic street names by city
    beirut_streets TEXT[] := ARRAY['Hamra Street', 'Verdun Street', 'Bliss Street', 'Gemmayze Street', 'Mar Mikhael Avenue', 'Achrafieh Road', 'Sassine Square', 'Corniche Beirut', 'Raouche Area', 'Badaro Street'];
    tripoli_streets TEXT[] := ARRAY['Abdul Hamid Karami Square', 'Corniche El Mina', 'Tall Square', 'Azmi Street', 'Khan Al-Khayyatin', 'Al-Mina Port Road', 'Rashid Karami Street', 'Bahsas Street', 'Abou Ali River Road', 'Koura Highway'];
    sidon_streets TEXT[] := ARRAY['Sea Castle Road', 'Old Souks Street', 'Riad El Solh Street', 'Khan El Franj Street', 'Corniche Sidon', 'Eastern Boulevard', 'Ain El Helweh Road', 'Maghdoucheh Road', 'Sarafand Highway', 'Tyre Road'];
    tyre_streets TEXT[] := ARRAY['Al-Bass Beach Road', 'Hippodrome Street', 'Old Souks Tyre', 'Rashidieh Road', 'Corniche Tyre', 'Archaeological Site Road', 'Port Road', 'Jabal Amel Street', 'Coast Highway', 'Bourj El Shamali Road'];
    other_streets TEXT[] := ARRAY['Main Street', 'Central Square', 'Municipality Road', 'Old Quarter', 'Market Street', 'Coastal Road', 'Mountain Road', 'Highway'];
    
    issue_types_en TEXT[] := ARRAY['broken pavement', 'water leak', 'blocked drain', 'damaged road sign', 'malfunctioning traffic light', 'illegal dumping', 'fallen tree branch', 'broken sidewalk', 'graffiti on wall', 'abandoned vehicle'];
    issue_types_ar TEXT[] := ARRAY['رصيف متكسر', 'تسرب مياه', 'مجرى مسدود', 'لافتة طريق تالفة', 'إشارة مرور معطلة', 'رمي نفايات غير قانوني', 'غصن شجرة ساقط', 'رصيف مكسور', 'كتابة على الجدار', 'مركبة مهجورة'];
    
    photo_pool TEXT[] := ARRAY[
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
        'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400',
        'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400',
        'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1581094794329-c8112e6df13b?w=400'
    ];
    
    random_street TEXT;
    random_issue_en TEXT;
    random_issue_ar TEXT;
    random_photo TEXT;
BEGIN
    -- Fetch ALL user IDs in order of activity level (most active first)
    SELECT ARRAY_AGG(id ORDER BY reports_count DESC, created_at ASC) INTO all_users 
    FROM users WHERE role = 'citizen';
    
    user_array := all_users;

    -- Insert 3 initial detailed reports (using random users from array)
    INSERT INTO reports (id, title_en, title_ar, note_en, note_ar, photo_urls, location, lat, lng, municipality, category, status, severity, confirmations_count, created_by, created_at)
    VALUES 
    (uuid_generate_v4(), 
     'Dangerous pothole on Verdun Street near ABC Mall', 
     'حفرة خطيرة في شارع فردان بالقرب من ABC مول',
     'There is a massive pothole on Verdun Street, right in front of ABC Mall''s main entrance. It''s been there for over a week and is getting worse with the rain. Several cars have already damaged their tires. This needs urgent attention before someone gets hurt!',
     'توجد حفرة ضخمة في شارع فردان، أمام المدخل الرئيسي لمركز ABC التجاري. موجودة منذ أكثر من أسبوع وتزداد سوءًا مع المطر. تضررت عدة سيارات بالفعل. نحتاج إصلاح عاجل قبل أن يتأذى أحد!',
     '{https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400,https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400}', 
     ST_SetSRID(ST_MakePoint(35.5018, 33.8938), 4326),
     33.8938, 35.5018,
     'beirut', 'infrastructure', 'new', 'high', 5, user_array[1], NOW() - INTERVAL '3 days')
    RETURNING id INTO report1_id;

    INSERT INTO reports (id, title_en, title_ar, note_en, note_ar, photo_urls, location, lat, lng, municipality, category, status, severity, confirmations_count, created_by, created_at)
    VALUES 
    (uuid_generate_v4(), 
     'Overflowing garbage containers on Hamra Street',
     'حاويات قمامة فائضة في شارع الحمرا',
     'The garbage containers at the corner of Hamra Street (near Starbucks) have been overflowing for three days now. The smell is unbearable and it''s attracting rats and stray dogs. The whole sidewalk is covered with trash. Shopkeepers and residents are complaining. Please collect this urgently!',
     'حاويات القمامة عند زاوية شارع الحمرا (بالقرب من ستاربكس) تفيض منذ ثلاثة أيام. الرائحة لا تطاق وتجذب الفئران والكلاب الضالة. الرصيف بأكمله مغطى بالنفايات. أصحاب المحلات والسكان يشتكون. يرجى جمعها بشكل عاجل!',
     '{https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400,https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400}',
     ST_SetSRID(ST_MakePoint(35.4955, 33.8886), 4326),
     33.8886, 35.4955,
     'beirut', 'waste_environment', 'in_progress', 'medium', 12, user_array[2], NOW() - INTERVAL '6 days')
    RETURNING id INTO report2_id;

    INSERT INTO reports (id, title_en, title_ar, note_en, note_ar, photo_urls, location, lat, lng, municipality, category, status, severity, confirmations_count, created_by, created_at)
    VALUES 
    (uuid_generate_v4(), 
     'Streetlight out on Corniche El Mina',
     'إنارة الشارع معطلة على كورنيش الميناء',
     'The main streetlight on Corniche El Mina (near the fishing port) has been broken for over 10 days. The whole area is pitch black at night, making it very dangerous for pedestrians and fishermen. There have been two incidents of people tripping and falling. This is a safety hazard that needs immediate fixing.',
     'إنارة الشارع الرئيسية على كورنيش الميناء (بالقرب من ميناء الصيادين) معطلة منذ أكثر من 10 أيام. المنطقة بأكملها مظلمة تمامًا في الليل، مما يجعلها خطيرة جدًا على المشاة والصيادين. حصل حادثتان لأشخاص تعثروا وسقطوا. هذا خطر على السلامة يحتاج إصلاحاً فورياً.',
     '{https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400}',
     ST_SetSRID(ST_MakePoint(35.8444, 34.4363), 4326),
     34.4363, 35.8444,
     'tripoli', 'electricity_energy', 'resolved', 'low', 8, user_array[4], NOW() - INTERVAL '29 days')
    RETURNING id INTO report3_id;

    -- Generate 97 more reports (100 total) randomly distributed across Lebanon
    -- 40 in Beirut, 30 in Tripoli, 10 in Sidon, 10 in Tyre, 7 scattered elsewhere
    FOR i IN 1..97 LOOP
        -- Select random user with weighted distribution (active users more likely)
        random_weight := floor(random() * total_weight)::int + 1;
        cumulative_weight := 0;
        user_index := 1;
        
        FOR j IN 1..array_length(user_weights, 1) LOOP
            cumulative_weight := cumulative_weight + user_weights[j];
            IF random_weight <= cumulative_weight THEN
                user_index := j;
                EXIT;
            END IF;
        END LOOP;
        
        random_user := user_array[user_index];
        
        -- Select random attributes
        random_category := categories[1 + floor(random() * 10)::int];
        random_status := statuses[1 + floor(random() * 4)::int];
        random_severity := severities[1 + floor(random() * 3)::int];
        random_confirmations := floor(random() * 20)::int;
        
        -- Select random issue type and photo
        random_issue_en := issue_types_en[1 + floor(random() * array_length(issue_types_en, 1))::int];
        random_issue_ar := issue_types_ar[1 + floor(random() * array_length(issue_types_ar, 1))::int];
        random_photo := photo_pool[1 + floor(random() * array_length(photo_pool, 1))::int];
        
        -- Distribute geographically and select appropriate street names
        IF i <= 40 THEN
            -- Beirut area (33.85-33.91 lat, 35.47-35.53 lng)
            random_municipality := 'beirut';
            random_lat := 33.85 + (random() * 0.06);
            random_lng := 35.47 + (random() * 0.06);
            random_street := beirut_streets[1 + floor(random() * array_length(beirut_streets, 1))::int];
        ELSIF i <= 70 THEN
            -- Tripoli area (34.42-34.46 lat, 35.82-35.87 lng)
            random_municipality := 'tripoli';
            random_lat := 34.42 + (random() * 0.04);
            random_lng := 35.82 + (random() * 0.05);
            random_street := tripoli_streets[1 + floor(random() * array_length(tripoli_streets, 1))::int];
        ELSIF i <= 80 THEN
            -- Sidon area (33.55-33.57 lat, 35.36-35.38 lng)
            random_municipality := 'sidon';
            random_lat := 33.55 + (random() * 0.02);
            random_lng := 35.36 + (random() * 0.02);
            random_street := sidon_streets[1 + floor(random() * array_length(sidon_streets, 1))::int];
        ELSIF i <= 90 THEN
            -- Tyre area (33.26-33.28 lat, 35.19-35.21 lng)
            random_municipality := 'tyre';
            random_lat := 33.26 + (random() * 0.02);
            random_lng := 35.19 + (random() * 0.02);
            random_street := tyre_streets[1 + floor(random() * array_length(tyre_streets, 1))::int];
        ELSE
            -- Other cities (random selection)
            random_street := other_streets[1 + floor(random() * array_length(other_streets, 1))::int];
            CASE (1 + floor(random() * 4)::int)
                WHEN 1 THEN
                    random_municipality := 'zahle';
                    random_lat := 33.84 + (random() * 0.02);
                    random_lng := 35.90 + (random() * 0.02);
                WHEN 2 THEN
                    random_municipality := 'jounieh';
                    random_lat := 33.98 + (random() * 0.01);
                    random_lng := 35.64 + (random() * 0.01);
                WHEN 3 THEN
                    random_municipality := 'baalbek';
                    random_lat := 34.00 + (random() * 0.02);
                    random_lng := 36.20 + (random() * 0.02);
                ELSE
                    random_municipality := 'nabatieh';
                    random_lat := 33.37 + (random() * 0.02);
                    random_lng := 35.48 + (random() * 0.02);
            END CASE;
        END IF;
        
        -- Select random issue type and photo
        random_issue_en := issue_types_en[1 + floor(random() * array_length(issue_types_en, 1))::int];
        random_issue_ar := issue_types_ar[1 + floor(random() * array_length(issue_types_ar, 1))::int];
        random_photo := photo_pool[1 + floor(random() * array_length(photo_pool, 1))::int];
        
        -- Insert report with realistic content
        INSERT INTO reports (
            id, title_en, title_ar, note_en, note_ar, 
            photo_urls, location, lat, lng, 
            municipality, category, status, severity, 
            confirmations_count, created_by, created_at
        ) VALUES (
            uuid_generate_v4(),
            random_issue_en || ' on ' || random_street,
            random_issue_ar || ' في ' || random_street,
            'Report #' || i || ': ' || random_issue_en || ' reported on ' || random_street || ', ' || random_municipality || '. Category: ' || random_category || '. This issue requires attention. Status: ' || random_status || '. Severity level: ' || random_severity || '.',
            'بلاغ رقم ' || i || ': تم الإبلاغ عن ' || random_issue_ar || ' في ' || random_street || '، ' || random_municipality || '. الفئة: ' || random_category || '. هذه المشكلة تحتاج إلى اهتمام. الحالة: ' || random_status || '. مستوى الخطورة: ' || random_severity || '.',
            ARRAY[random_photo]::text[],
            ST_SetSRID(ST_MakePoint(random_lng, random_lat), 4326),
            random_lat, random_lng,
            random_municipality, random_category::report_category, random_status::report_status, random_severity::report_severity,
            random_confirmations, random_user,
            NOW() - (random() * INTERVAL '60 days')
        );
    END LOOP;

    -- Insert Report History (using users from array)
    INSERT INTO report_history (id, report_id, old_status, new_status, changed_by, timestamp) VALUES
    (uuid_generate_v4(), report2_id, NULL, 'new', user_array[2], NOW() - INTERVAL '6 days'),
    (uuid_generate_v4(), report2_id, 'new', 'received', user_array[2], NOW() - INTERVAL '5 days'),
    (uuid_generate_v4(), report2_id, 'received', 'in_progress', user_array[2], NOW() - INTERVAL '4 days'),
    (uuid_generate_v4(), report3_id, NULL, 'new', user_array[4], NOW() - INTERVAL '29 days'),
    (uuid_generate_v4(), report3_id, 'new', 'received', user_array[4], NOW() - INTERVAL '28 days'),
    (uuid_generate_v4(), report3_id, 'received', 'resolved', user_array[4], NOW() - INTERVAL '27 days');

    -- Insert Realistic Comments (authentic conversations)
    INSERT INTO comments (id, report_id, user_id, text, created_at) VALUES
    (uuid_generate_v4(), report1_id, user_array[3], 'I drive through here every morning and almost damaged my car yesterday! Thank you for reporting this.', NOW() - INTERVAL '2 days'),
    (uuid_generate_v4(), report1_id, user_array[5], 'Same here! My tire got damaged last week. This needs to be fixed ASAP!', NOW() - INTERVAL '2 days'),
    (uuid_generate_v4(), report1_id, user_array[7], 'I saw a motorcycle flip over this pothole this morning. Someone is going to get seriously hurt!', NOW() - INTERVAL '1 day'),
    (uuid_generate_v4(), report2_id, user_array[1], 'This has been a problem for weeks now. I work in a shop nearby and customers complain about the smell daily.', NOW() - INTERVAL '5 days'),
    (uuid_generate_v4(), report2_id, user_array[6], 'I live above one of these shops. The rats are getting into the buildings now. Please fix this urgently!', NOW() - INTERVAL '4 days'),
    (uuid_generate_v4(), report2_id, user_array[4], 'UPDATE: Municipality just came and collected the trash! Thank you all for reporting!', NOW() - INTERVAL '3 days'),
    (uuid_generate_v4(), report3_id, user_array[2], 'Finally fixed! The light is back on. Great work municipality!', NOW() - INTERVAL '27 days'),
    (uuid_generate_v4(), report3_id, user_array[8], 'Confirmed! I was just there and the light is working perfectly now.', NOW() - INTERVAL '27 days');

END $$;

-- =====================================================
-- VERIFY SEED DATA
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'SEED DATA SUMMARY:';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Categories: %', (SELECT COUNT(*) FROM dynamic_categories);
    RAISE NOTICE 'Badges: %', (SELECT COUNT(*) FROM dynamic_badges);
    RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM users WHERE role = 'citizen');
    RAISE NOTICE 'Total Users (incl. admin/portal): %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Reports: %', (SELECT COUNT(*) FROM reports);
    RAISE NOTICE '  - Beirut: %', (SELECT COUNT(*) FROM reports WHERE municipality = 'beirut');
    RAISE NOTICE '  - Tripoli: %', (SELECT COUNT(*) FROM reports WHERE municipality = 'tripoli');
    RAISE NOTICE '  - Sidon: %', (SELECT COUNT(*) FROM reports WHERE municipality = 'sidon');
    RAISE NOTICE '  - Tyre: %', (SELECT COUNT(*) FROM reports WHERE municipality = 'tyre');
    RAISE NOTICE 'Comments: %', (SELECT COUNT(*) FROM comments);
    RAISE NOTICE 'Report History: %', (SELECT COUNT(*) FROM report_history);
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'DEFAULT CREDENTIALS (for testing):';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Super Admin: admin / password';
    RAISE NOTICE 'Beirut Portal: beirut_portal / password';
    RAISE NOTICE 'Tripoli Portal: tripoli_portal / password';
    RAISE NOTICE 'Citizen: ali_hassan / password';
    RAISE NOTICE '==============================================';
END $$;
