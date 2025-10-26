# 🌱 DATABASE DEFAULTS & SEED DATA

## Overview

The Mshkltk application comes with comprehensive default data to get you started immediately. This includes categories, badges, gamification settings, demo users, and sample reports.

---

## 📋 Default Categories (12 Total)

All categories are **bilingual (English/Arabic)** and come with associated icons and colors:

| ID | Name (EN) | Name (AR) | Icon | Color |
|----|-----------|-----------|------|-------|
| 1 | Infrastructure | البنية التحتية | FaRoadBridge | #4A90E2 |
| 2 | Electricity & Energy | الكهرباء والطاقة | FaBolt | #F5A623 |
| 3 | Water & Sanitation | المياه والصرف الصحي | FaFaucetDrip | #50E3C2 |
| 4 | Waste & Environment | النفايات والبيئة | FaRecycle | #B8E986 |
| 5 | Public Safety | السلامة العامة | FaShieldHalved | #9013FE |
| 6 | Public Spaces | المساحات العامة | FaTreeCity | #417505 |
| 7 | Public Health | الصحة العامة | FaBriefcaseMedical | #D0021B |
| 8 | Urban Planning | التخطيط العمراني | FaRulerCombined | #BD10E0 |
| 9 | Transportation | النقل | FaBus | #7ED321 |
| 10 | Emergencies | الطوارئ | FaTriangleExclamation | #FF5A5F |
| 11 | Transparency & Services | الشفافية والخدمات | FaFileSignature | #0D3B66 |
| 12 | Other / Unknown | أخرى / غير معروف | FaQuestion | #9E9E9E |

### Subcategories

Each category has multiple subcategories. For example:

- **Infrastructure**: Unpaved roads, Broken sidewalks, Bridge maintenance
- **Waste & Environment**: Garbage accumulation, Missing bins, Illegal dumping, Visual pollution
- **Electricity & Energy**: Unprotected poles, Exposed wires, Unsafe generators, Public lighting

---

## 🏆 Default Badges (12 Total)

Gamification badges encourage citizen engagement:

| Badge | Name (EN) | Name (AR) | Condition | Reward |
|-------|-----------|-----------|-----------|--------|
| 🌟 | Pioneer | الرائد | 1st report submitted | 25 pts |
| 🗑️ | Waste Warrior | محارب النفايات | 3 waste reports | 50 pts |
| 🛡️ | Road Guardian | حارس الطريق | 1 infrastructure report | 25 pts |
| 💡 | Lightbringer | جالب النور | 1 electricity report | 25 pts |
| ❤️ | Good Samaritan | فاعل خير | 1st confirmation | 30 pts |
| 🤝 | Community Helper | مساعد المجتمع | 5 confirmations | 75 pts |
| 🏆 | Civic Leader | قائد مدني | Reach 100 points | 100 pts |
| 💧 | Water Watchdog | رقيب المياه | 1 water/sanitation report | 25 pts |
| 🚦 | Safety Sentinel | حارس السلامة | 1 safety report | 25 pts |
| 🏞️ | Park Protector | حامي الحدائق | 1 public space report | 25 pts |
| 🦠 | Health Hero | بطل الصحة | 1 health report | 25 pts |
| 🏗️ | Urban Planner | المخطط الحضري | 1 planning violation report | 25 pts |

---

## 🎮 Gamification Points System

Default point values for actions:

```json
{
  "pointsRules": [
    {"id": "submit_report", "points": 10, "description": "For submitting a new report"},
    {"id": "confirm_report", "points": 3, "description": "For confirming an existing report"},
    {"id": "earn_badge", "points": 25, "description": "Bonus for earning a new badge"},
    {"id": "comment", "points": 2, "description": "For adding a comment to a report"}
  ]
}
```

### How Points Work:
- **Submit Report**: +10 points
- **Confirm Report**: +3 points
- **Add Comment**: +2 points
- **Earn Badge**: +25 points (bonus on top of action points)

---

## 👥 Default Users

The seed creates 8 users for testing:

### Super Admin
```
Username: admin
Password: password
Role: super_admin
```
**Can do**: Everything - manage all users, reports, configuration

---

### Portal Users (Municipality Access)

#### Beirut Municipality
```
Username: beirut_portal
Password: password
Role: municipality
Municipality: beirut
Access: read_write
```

#### Tripoli Municipality
```
Username: tripoli_portal
Password: password
Role: municipality
Municipality: tripoli
Access: read_write
```

#### Sidon Municipality
```
Username: sidon_portal
Password: password
Role: municipality
Municipality: sidon
Access: read_only
```

**Can do**: View and manage reports in their municipality, update status, add comments

---

### Demo Citizens

#### Ali Hassan
```
Username: ali_hassan
Password: password
Points: 35
Reports: 3
Badges: ["pioneer"]
```

#### Maya Khalil
```
Username: maya_khalil
Password: password
Points: 52
Reports: 5
Badges: ["pioneer", "waste_warrior"]
```

#### Rami Said
```
Username: rami_said
Password: password
Points: 18
Reports: 1
Confirmations: 3
Badges: ["pioneer", "good_samaritan"]
```

#### Layla Nasser
```
Username: layla_nasser
Password: password
Points: 127
Reports: 10
Confirmations: 7
Badges: ["pioneer", "civic_leader", "community_helper"]
```

#### Omar Haddad
```
Username: omar_haddad
Password: password
Points: 23
Reports: 2
Badges: ["pioneer", "road_guardian"]
```

---

## 📍 Sample Reports

The seed includes 3 sample reports:

1. **Large pothole on main road** (Beirut, Infrastructure, HIGH severity)
   - Status: New
   - Confirmations: 5
   - Created by: ali_hassan

2. **Overflowing dumpster** (Beirut, Waste, MEDIUM severity)
   - Status: In Progress
   - Confirmations: 12
   - Created by: maya_khalil
   - Has comments and status history

3. **Broken streetlight** (Tripoli, Electricity, LOW severity)
   - Status: Resolved
   - Confirmations: 8
   - Created by: rami_said
   - Has full status history (new → received → resolved)

---

## 🚀 How to Seed the Database

### Method 1: Using the Seed Script (Recommended)

```bash
./seed-database.sh
```

This will:
1. Clear existing data
2. Populate all default categories, badges, and settings
3. Create demo users and reports
4. Display login credentials

### Method 2: Manual SQL Execution

```bash
psql -h localhost -U mshkltk_user -d mshkltk_db -f server/db/seed.sql
```

### Method 3: Full Database Reset

If you want to completely reset everything:

```bash
./setup-database.sh  # Recreate schema
./seed-database.sh   # Seed with defaults
```

---

## ⚠️ Important Notes

### Password Hashing
The seed file uses **placeholder password hashes** for demo purposes. All passwords are currently set to `"password"`.

**For production**, you MUST:
1. Use proper password hashing (bcrypt/argon2)
2. Change all default passwords
3. Remove or disable demo accounts

### Data Persistence
- All categories, badges, and settings are stored in **PostgreSQL**
- Changes made in Super Admin panel are **permanent**
- To reset to defaults, re-run the seed script

### Customization
You can edit `server/db/seed.sql` to:
- Add more demo users
- Create additional sample reports
- Modify default point values
- Add custom badges or categories

---

## 📊 Verification

After seeding, verify data was loaded:

```sql
-- Connect to database
psql -h localhost -U mshkltk_user -d mshkltk_db

-- Check counts
SELECT COUNT(*) FROM dynamic_categories;  -- Should be 12
SELECT COUNT(*) FROM dynamic_badges;      -- Should be 12
SELECT COUNT(*) FROM users;               -- Should be 8
SELECT COUNT(*) FROM reports;             -- Should be 3

-- View sample data
SELECT username, role, points FROM users;
SELECT title, municipality, status FROM reports;
```

---

## 🔄 Re-seeding

To re-seed the database (WARNING: destroys existing data):

```bash
./seed-database.sh
```

The script will:
- ✅ Clear all tables (TRUNCATE)
- ✅ Re-insert all defaults
- ✅ Reset auto-increment counters
- ✅ Display summary

---

## 📝 Default Credentials Summary

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| admin | password | super_admin | Full system access |
| beirut_portal | password | municipality | Beirut reports (read/write) |
| tripoli_portal | password | municipality | Tripoli reports (read/write) |
| sidon_portal | password | municipality | Sidon reports (read-only) |
| ali_hassan | password | citizen | Demo user with reports |
| maya_khalil | password | citizen | Demo user with badges |
| rami_said | password | citizen | Demo user with confirmations |
| layla_nasser | password | citizen | Demo power user (127 pts) |
| omar_haddad | password | citizen | Demo user |

---

## 🎯 Next Steps

After seeding:

1. ✅ Start the backend: `cd server && npm start`
2. ✅ Start the frontend: `PORT=3000 npm run dev`
3. ✅ Login as `admin` / `password`
4. ✅ Explore Super Admin panels:
   - Categories management
   - Badges configuration
   - Points system settings
   - User management
5. ✅ Test as citizen: Login as `ali_hassan` / `password`
6. ✅ Test as portal: Login as `beirut_portal` / `password`

---

## 🔐 Security Reminder

**BEFORE PRODUCTION:**
- [ ] Change all default passwords
- [ ] Use environment variables for credentials
- [ ] Implement proper password hashing
- [ ] Remove or disable demo accounts
- [ ] Enable SSL/TLS for database connections
- [ ] Set up proper authentication tokens (JWT)

---

## 📚 Additional Resources

- Database Schema: `server/db/schema.sql`
- Seed Data: `server/db/seed.sql`
- Mock Data Reference: `data/mockData.ts`
- Dynamic Config Reference: `data/dynamicConfig.ts`

---

**Last Updated**: October 22, 2025  
**Database Version**: PostgreSQL 14+ with PostGIS
