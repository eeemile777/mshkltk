const { query } = require('./connection');

const categories = [
    {
        "id": "infrastructure",
        "icon": "FaRoadBridge",
        "color_light": "#4A90E2",
        "color_dark": "#5EBFDE",
        "name_en": "Infrastructure",
        "name_ar": "البنية التحتية",
        "is_active": true,
        "subCategories": [
            { "id": "unpaved_roads", "name_en": "Unpaved or damaged roads", "name_ar": "طرق غير معبدة أو متضررة" },
            { "id": "broken_sidewalks", "name_en": "Broken or occupied sidewalks", "name_ar": "أرصفة مكسورة أو مشغولة" },
            { "id": "bridge_maintenance", "name_en": "Bridges/stairways maintenance", "name_ar": "صيانة الجسور والسلالم" }
        ]
    },
    {
        "id": "electricity_energy",
        "icon": "FaBolt",
        "color_light": "#F5A623",
        "color_dark": "#FFC06A",
        "name_en": "Electricity & Energy",
        "name_ar": "الكهرباء والطاقة",
        "is_active": true,
        "subCategories": [
            { "id": "unprotected_poles", "name_en": "Unprotected electricity poles", "name_ar": "أعمدة كهرباء غير محمية" },
            { "id": "exposed_wires", "name_en": "Exposed electric wires", "name_ar": "أسلاك كهربائية مكشوفة" },
            { "id": "unsafe_generators", "name_en": "Unsafe private generator connections", "name_ar": "وصلات مولدات خاصة غير آمنة" },
            { "id": "public_lighting", "name_en": "Malfunctioning public lighting", "name_ar": "إنارة عامة معطلة" }
        ]
    },
    {
        "id": "water_sanitation",
        "icon": "FaFaucetDrip",
        "color_light": "#50E3C2",
        "color_dark": "#63E9C8",
        "name_en": "Water & Sanitation",
        "name_ar": "المياه والصرف الصحي",
        "is_active": true,
        "subCategories": [
            { "id": "water_leak", "name_en": "Leaking potable water", "name_ar": "تسرب مياه الشرب" },
            { "id": "blocked_sewage", "name_en": "Blocked or overflowing sewage", "name_ar": "مجاري مسدودة أو فائضة" },
            { "id": "stormwater_drainage", "name_en": "Lack of stormwater drainage", "name_ar": "نقص في أنظمة تصريف مياه الأمطار" }
        ]
    },
    {
        "id": "waste_environment",
        "icon": "FaRecycle",
        "color_light": "#B8E986",
        "color_dark": "#C6F497",
        "name_en": "Waste & Environment",
        "name_ar": "النفايات والبيئة",
        "is_active": true,
        "subCategories": [
            { "id": "garbage_accumulation", "name_en": "Garbage accumulation", "name_ar": "تراكم القمامة" },
            { "id": "missing_bins", "name_en": "Missing/overflowing bins", "name_ar": "حاويات مفقودة/فائضة" },
            { "id": "illegal_dumping", "name_en": "Illegal dumping sites", "name_ar": "مكبات نفايات غير شرعية" },
            { "id": "visual_pollution", "name_en": "Visual pollution (ads, etc.)", "name_ar": "تلوث بصري (إعلانات، تشويه)" },
            { "id": "noise_pollution", "name_en": "Noise pollution", "name_ar": "تلوث ضوضائي" }
        ]
    },
    {
        "id": "public_safety",
        "icon": "FaShieldHalved",
        "color_light": "#9013FE",
        "color_dark": "#A53AFF",
        "name_en": "Public Safety",
        "name_ar": "السلامة العامة",
        "is_active": true,
        "subCategories": [
            { "id": "broken_traffic_lights", "name_en": "Broken traffic lights", "name_ar": "إشارات مرور معطلة" },
            { "id": "missing_crossings", "name_en": "Missing pedestrian crossings", "name_ar": "غياب ممرات المشाة" },
            { "id": "unsafe_construction", "name_en": "Unsafe construction", "name_ar": "مواقع بناء غير آمنة" },
            { "id": "abandoned_vehicles", "name_en": "Abandoned/dangerously parked vehicles", "name_ar": "سيارات مهجورة أو متوقفة بشكل خطير" }
        ]
    },
    {
        "id": "public_spaces",
        "icon": "FaTreeCity",
        "color_light": "#417505",
        "color_dark": "#549407",
        "name_en": "Public Spaces",
        "name_ar": "المساحات العامة",
        "is_active": true,
        "subCategories": [
            { "id": "neglected_parks", "name_en": "Neglected or dirty parks", "name_ar": "حدائق مهملة أو متسخة" },
            { "id": "broken_equipment", "name_en": "Broken benches or playground equipment", "name_ar": "مقاعد أو معدات ملاعب مكسورة" },
            { "id": "square_lighting", "name_en": "Non-functioning streetlights in squares", "name_ar": "إنارة معطلة في الساحات العامة" },
            { "id": "damaged_facilities", "name_en": "Damaged public facilities", "name_ar": "مرافق عامة متضررة" }
        ]
    },
    {
        "id": "public_health",
        "icon": "FaBriefcaseMedical",
        "color_light": "#D0021B",
        "color_dark": "#E83D4F",
        "name_en": "Public Health",
        "name_ar": "الصحة العامة",
        "is_active": true,
        "subCategories": [
            { "id": "stray_animals", "name_en": "Stray animals posing risks", "name_ar": "حيوانات شاردة تشكل خطراً" },
            { "id": "insects_rodents", "name_en": "Spread of insects/rodents", "name_ar": "انتشار الحشرات/القوارض" },
            { "id": "stagnant_water", "name_en": "Stagnant or contaminated water", "name_ar": "مياه راكدة أو ملوثة" }
        ]
    },
    {
        "id": "urban_planning",
        "icon": "FaRulerCombined",
        "color_light": "#BD10E0",
        "color_dark": "#D02FFA",
        "name_en": "Urban Planning",
        "name_ar": "التخطيط العمراني",
        "is_active": true,
        "subCategories": [
            { "id": "illegal_construction", "name_en": "Illegal construction", "name_ar": "بناء مخالف" },
            { "id": "occupied_sidewalks", "name_en": "Sidewalks occupied by shops", "name_ar": "أرصفة محتلة من قبل المحلات" },
            { "id": "public_property_encroachment", "name_en": "Encroachment on public property", "name_ar": "تعدي على الأملاك العامة" }
        ]
    },
    {
        "id": "transportation",
        "icon": "FaBus",
        "color_light": "#7ED321",
        "color_dark": "#91E33A",
        "name_en": "Transportation",
        "name_ar": "النقل",
        "is_active": true,
        "subCategories": [
            { "id": "unregulated_stops", "name_en": "Unregulated bus stops", "name_ar": "مواقف حافلات غير منظمة" },
            { "id": "parking_issues", "name_en": "Lack or poor organization of parking", "name_ar": "نقص أو سوء تنظيم مواقف السيارات" },
            { "id": "missing_signage", "name_en": "Missing traffic signage", "name_ar": "غياب اللافتات المرورية" }
        ]
    },
    {
        "id": "emergencies",
        "icon": "FaTriangleExclamation",
        "color_light": "#FF5A5F",
        "color_dark": "#FF8A8D",
        "name_en": "Emergencies",
        "name_ar": "الطوارئ",
        "is_active": true,
        "subCategories": [
            { "id": "accidents_collapses", "name_en": "Accidents or collapses", "name_ar": "حوادث أو انهيارات" },
            { "id": "falling_trees", "name_en": "Trees at risk of falling", "name_ar": "أشجار معرضة للسقوط" },
            { "id": "landslides", "name_en": "Landslides after storms", "name_ar": "انهيارات أرضية بعد العواصف" }
        ]
    },
    {
        "id": "transparency_services",
        "icon": "FaFileSignature",
        "color_light": "#0D3B66",
        "color_dark": "#1E5A99",
        "name_en": "Transparency & Services",
        "name_ar": "الشفافية والخدمات",
        "is_active": true,
        "subCategories": [
            { "id": "absent_employees", "name_en": "Municipal employees absent", "name_ar": "غياب موظفي البلدية" },
            { "id": "paperwork_delays", "name_en": "Delays in citizen paperwork", "name_ar": "تأخير في معاملات المواطنين" },
            { "id": "lack_of_services", "name_en": "Lack of essential municipal services", "name_ar": "نقص في الخدمات البلدية الأساسية" }
        ]
    },
    {
        "id": "other_unknown",
        "icon": "FaQuestion",
        "color_light": "#9E9E9E",
        "color_dark": "#BDBDBD",
        "name_en": "Other / Unknown",
        "name_ar": "أخرى / غير معروف",
        "is_active": true,
        "subCategories": [
            { "id": "unclear_issue", "name_en": "Unclear or out-of-scope issue", "name_ar": "مشكلة غير واضحة أو خارج النطاق" }
        ]
    }
];

async function seedCategories() {
    try {
        console.log('🌱 Seeding categories...');

        for (const cat of categories) {
            await query(
                `INSERT INTO dynamic_categories (id, icon, color, color_dark, name_en, name_ar, label_en, label_ar, is_active, sub_categories)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
         icon = $2,
         color = $3,
         color_dark = $4,
         name_en = $5,
         name_ar = $6,
         label_en = $7,
         label_ar = $8,
         is_active = $9,
         sub_categories = $10`,
                [
                    cat.id,
                    cat.icon,
                    cat.color_light,
                    cat.color_dark,
                    cat.name_en,
                    cat.name_ar,
                    cat.name_en, // Also populate label_en for backwards compatibility
                    cat.name_ar, // Also populate label_ar for backwards compatibility
                    cat.is_active,
                    JSON.stringify(cat.subCategories)
                ]
            );
            console.log(`✅ Seeded category: ${cat.id}`);
        }

        console.log('✨ All categories seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();
