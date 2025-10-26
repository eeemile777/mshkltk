# Realistic Seed Data Summary 🌱

## Overview
The database has been seeded with **realistic, production-like data** that mimics real-world usage patterns.

---

## 📊 Statistics

### Users
- **Total Citizens:** 25 users
- **Total Users (including admin & portals):** 29 users
- **Active Contributors:** 12 users who have submitted reports
- **Inactive Users:** 13 users who haven't submitted reports yet (realistic!)

### Reports
- **Total Reports:** 100 reports
- **Geographic Distribution:**
  - Beirut: 42 reports (largest city)
  - Tripoli: 31 reports (second largest)
  - Sidon: 10 reports
  - Tyre: 10 reports
  - Other cities: 7 reports (Zahle, Jounieh, Baalbek, Nabatieh)

---

## 👥 User Distribution (Realistic Activity Patterns)

### Power Users (15-18 reports)
- **Layla Nasser** - 18 reports, 167 points
- **Ali Hassan** - 17 reports, 245 points
- **Maya Khalil** - 17 reports, 198 points

### Active Users (6-8 reports)
- **Omar Haddad** - 8 reports, 115 points
- **Zahra Mansour** - 7 reports, 87 points
- **Dina Elias** - 7 reports, 47 points
- **Sara Azar** - 6 reports, 54 points
- **Rami Said** - 6 reports, 132 points
- **Nour Ibrahim** - 6 reports, 98 points

### Regular Users (1-4 reports)
- **Ahmad Khoury** - 4 reports, 51 points
- **Karim Saleh** - 3 reports, 76 points
- **Youssef Chahine** - 1 report, 43 points

### Light/Inactive Users (0 reports)
13 users with 0 reports each, representing:
- New users who haven't started yet
- Lurkers who browse but don't contribute
- Inactive accounts
- **This is realistic!** Not everyone participates equally

---

## 🎲 Weighted Distribution Logic

Reports are distributed using a **weighted random algorithm** that favors more active users:

- Top 3 users (power users): 15% chance each
- Next 5 users (active): 6-12% chance each
- Next 5 users (regular): 3-5% chance each
- Remaining 12 users (light): 1-2% chance each

This creates a **Pareto distribution** (80/20 rule) similar to real civic engagement platforms where a small percentage of users create most of the content.

---

## 🗺️ Geographic Authenticity

All reports use **real Lebanese coordinates**:

- **Beirut**: 33.85-33.91°N, 35.47-35.53°E
- **Tripoli**: 34.42-34.46°N, 35.82-35.87°E
- **Sidon**: 33.55-33.57°N, 35.36-35.38°E
- **Tyre**: 33.26-33.28°N, 35.19-35.21°E
- **Other cities**: Accurate coordinates for Zahle, Jounieh, Baalbek, Nabatieh

---

## 📦 What's Included

### Categories (12 total)
Infrastructure, Electricity & Energy, Water & Sanitation, Waste & Environment, Public Safety, Public Spaces, Public Health, Urban Planning, Transportation, Emergencies, Community, Other

### Badges (12 total)
Pioneer, Civic Leader, Community Helper, Waste Warrior, Road Guardian, Safety Champion, Green Advocate, Good Samaritan, Neighborhood Watch, Quick Responder, Persistent Reporter, Super Contributor

### Gamification
4 point rules: Submit Report (10pts), Confirm Report (3pts), Add Comment (1pt), Report Resolved (5pts)

### Report Variety
- **Status:** New, Received, In Progress, Resolved (randomly distributed)
- **Severity:** Low, Medium, High (randomly distributed)
- **Categories:** All 10 main categories represented
- **Timestamps:** Reports spread across the last 60 days

---

## 🔑 Test Credentials

### Super Admin
- Username: `admin`
- Password: `password`

### Portal Users
- Beirut Portal: `beirut_portal` / `password`
- Tripoli Portal: `tripoli_portal` / `password`
- Sidon Portal: `sidon_portal` / `password`

### Sample Citizens
- Power User: `ali_hassan` / `password` (245 points, 17 reports)
- Active User: `maya_khalil` / `password` (198 points, 17 reports)
- Regular User: `rami_said` / `password` (132 points, 6 reports)
- Light User: `nadine_labaki` / `password` (16 points, 0 reports)

---

## ✅ Realism Features

1. **Varied User Activity:** Some users very active, others inactive (like real life!)
2. **Weighted Distribution:** Power users create more content (Pareto principle)
3. **Geographic Clustering:** More reports in larger cities (Beirut, Tripoli)
4. **Temporal Spread:** Reports created over 60-day period, not all at once
5. **Status Variety:** Mix of new, in-progress, and resolved reports
6. **All Editable:** Every piece of data can be edited/deleted via Super Admin panel

---

## 🚀 Next Steps

1. **Start the server:** `npm run dev`
2. **Login as different users** to see varied dashboards
3. **Test Super Admin panel** - all data is fully editable
4. **View the map** - see geographic distribution across Lebanon
5. **Check leaderboard** - see realistic point rankings

The seed data is production-ready and mimics real-world civic engagement patterns!
