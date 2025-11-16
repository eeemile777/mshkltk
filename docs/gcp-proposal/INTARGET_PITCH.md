# ⭐ INTARGET PITCH - Mshkltk x Google Cloud

**For:** Intarget Leadership  
**From:** Mshkltk Team  
**Date:** November 15, 2025  
**Duration:** 5 minutes  
**Philosophy:** Validate with a cheap, lean pilot. Scale only if adoption is real.

---

## 🎯 The Opportunity

**Mshkltk** is a civic-tech platform that connects citizens with city governments to report infrastructure issues and track resolutions in real-time.

**Current Status:**
- ✅ 95% production-ready
- ✅ 3 portals built (Citizen, Municipality, Super Admin)
- ✅ 45/46 tests passing (99% passing)
- ✅ Real backend: Node.js + PostgreSQL with PostGIS
- ✅ Offline-first PWA with AI-powered analysis
- ✅ Bilingual (English + Arabic, RTL support)

**Market Opportunity:**
- Governments worldwide need citizen engagement
- Middle East & Europe both underserved
- Tripoli, Lebanon + Milano, Italy = ideal test markets
- Low risk, high learning potential

---

## 💡 The Ask

**Validate Mshkltk with an intentionally lean 6-month Firebase pilot**

- **Months 1-6:** Deploy to Firebase (€0-40/month). Test if citizens + officials engage.
- **Decision Gate (Month 6):** Based on real usage data, decide to scale.
- **If YES (adoption strong):** Migrate to Cloud Run + Cloud SQL (€300-600/month).
- **If NO (adoption weak):** Wind down gracefully, minimal sunk cost.

**Geographic Focus:**
- Pilot: **Tripoli, Lebanon** (Arabic-first, gov-friendly)
- Secondary: **Milano, Italy** (EU market validation, GDPR compliance)
- **Combined Pilot Scale:** 3K MAU, ~240 DAU

---

## 💰 The Economics (Lean & Honest)

| Scenario | Cost | Timeline | Decision | Next Step |
|----------|------|----------|----------|-----------|
| **Pilot (Firebase)** | €0–240 | 6 months | Validate adoption | Scale or pivot |
| **Scale (Cloud Run/SQL)** | €250–600/mo | Months 7-12 | If adoption strong | Regional expansion |
| **Production (Mature)** | €500–1.5K/mo | Year 2+ | If revenue justified | Multi-region, BigQuery |

**Year 1 Reality (Best Case):**
- Months 1-6: €30 (pilot phase, Firebase free tier)
- Months 7-12: €3K (early scale if adoption is strong)
- **Total Year 1 cost:** €3,030 (not €50-80K)
- **Cost per user (pilot phase):** €0.01 (nearly free)

**Intarget's Upside:**
- Low financial risk: €0-240 to test market
- High learning value: Real user adoption data
- Clear scale path: If adoption validates, scale predictably
- Revenue potential: €15K-50K Year 1 (if scaling, conservative)

---

## 🏗️ Two-Phase Architecture

### **Phase 0: Pilot (Months 1-6, Firebase)**

```
┌────────────────────────────────────────┐
│   Users in Tripoli & Milano            │
│   (~3K MAU, ~240 DAU)                  │
└────────────┬─────────────────────────┘
             │
    ┌────────┴────────────────┐
    │  Firebase Hosting        │
    │  (React SPA, ~€0)        │
    └────────┬────────────────┘
             │
    ┌────────┴──────────┐
    │                   │
 ┌──┴──┐        ┌──────┴──────┐
 │Cloud│        │   Cloud     │
 │Func │        │  Firestore  │
 │(API)│        │   (DB)      │
 └──┬──┘        └──────┬──────┘
    │                  │
    └──────┬───────────┘
           │
    ┌──────┴──────────────────────┐
    │ Firebase Platform Services   │
    ├──────────────────────────────┤
    │ • Firebase Auth (free)       │
    │ • Cloud Storage (~€0-10)     │
    │ • Maps API (via proxy)       │
    │ • Cloud Logging (free)       │
    │ • Analytics (free)           │
    └──────────────────────────────┘

TOTAL PILOT COST: €0–40/month
```

**Why Firebase for Pilot:**
- ✅ Zero ops overhead (fully managed)
- ✅ Scales instantly from 0 → 10K DAU
- ✅ Free tier covers entire 3K MAU, 240 DAU easily
- ✅ Can migrate to Cloud SQL later if needed
- ✅ No lock-in; code is portable

---

### **Phase 1: Scale (Months 7+, only if adoption validates)**

```
┌────────────────────────────────────────┐
│   Users Across Multiple Cities          │
│   (10K+ MAU if adoption strong)         │
└────────────┬─────────────────────────┘
             │
    ┌────────┴────────────────┐
    │  Cloud Run + CDN         │
    │  (Production API)        │
    └────────┬────────────────┘
             │
    ┌────────┴──────────┐
    │                   │
 ┌──┴──────┐       ┌───┴──────────┐
 │Cloud    │       │  Cloud SQL   │
 │Run      │       │  (PostgreSQL)│
 │(Backend)│       │  + PostGIS   │
 └──┬──────┘       └───┬──────────┘
    │                  │
    └──────┬───────────┘
           │
    ┌──────┴──────────────────────┐
    │ GCP Production Stack         │
    ├──────────────────────────────┤
    │ • Cloud Run Container (~€100-150)  │
    │ • Cloud SQL PostgreSQL (~€100-150) │
    │ • Cloud Storage (~€10-30)   │
    │ • BigQuery Analytics (~€30-50)     │
    │ • Pub/Sub Notifications (~€5-15)   │
    │ • Cloud Logging (free)      │
    └──────────────────────────────┘

TOTAL SCALE COST: €250–600/month
```

**Why Scale to Cloud Run:**
- ✅ Complex SQL queries (PostGIS spatial analysis)
- ✅ High concurrency (many simultaneous users)
- ✅ Advanced features (Pub/Sub notifications, BigQuery)
- ✅ Enterprise SLAs (99.95% uptime)

---

## 📊 Decision Gate (End of Month 6)

**Before spending €3K-5K on scaling, we measure:**

| Metric | Target | Success = Scale |
|--------|--------|-----------------|
| **DAU/MAU Ratio** | >15% | If ≥15%, users are engaged |
| **Official Response Rate** | >50% | If ≥50%, officials are using it |
| **Report Resolution Rate** | >20% | If ≥20%, government is acting |
| **Retention (Wk 4 → Wk 8)** | >60% | If ≥60%, app is sticky |
| **User Signups Trend** | Growing | If growing, product-market fit |

**Outcome:**
- **IF all targets hit:** Migrate to Cloud Run + Cloud SQL, begin regional expansion
- **IF 3/5 targets hit:** Stay on Firebase, optimize product
- **IF <3 targets hit:** Wind down pilot, apply learnings elsewhere

**This is NOT "fail-fast" hype.** It's honest validation. We may learn that civic-tech adoption in these cities requires different approaches (more municipal buy-in, different marketing, etc.). That's valuable knowledge worth only €240.

---

## ⏱️ Timeline (Realistic)

| Phase | Duration | Deliverable | Cost |
|-------|----------|-----------|------|
| **Phase 0.0: Setup** | Week 1 | Firebase + GCP accounts, secrets | €0 |
| **Phase 0.1: Deploy** | Week 2-3 | Mshkltk on Firebase Hosting, Cloud Functions | €0 |
| **Phase 0.2: Soft Launch** | Week 4-8 | Tripoli pilot, early officials onboard | €10 |
| **Phase 0.3: Public Launch** | Week 9-12 | Open to all users, Milano soft launch | €20 |
| **Phase 0.4: Pilot Growth** | Month 4-6 | Growth marketing, collect adoption metrics | €30 |
| **Month 6: Decision Gate** | — | Analyze metrics, board decision | — |
| **Phase 1 (IF YES)** | Month 7-12 | Migrate to Cloud Run + Cloud SQL, scale | €3K-5K |

**Total for full Year 1:** €30–240 (pilot) + €3K–5K (scale, if adopted) = **€3,030–5,240**

---

## 🌍 Geographic Strategy

### **Month 1-3: Tripoli, Lebanon (Arabic-First Validation)**
- Launch in Tripoli municipality
- Focus on government officials + civic leaders
- Optimize for Arabic language, RTL layout
- **Pilot Scale:** 500–1,500 users

### **Month 4-6: Milano, Italy (EU Compliance)**
- Soft launch Milano secondary market
- Validate GDPR, EU data residency approach
- Test English + Italian bilingual flows
- **Cumulative Scale:** 2K–3K MAU

### **Month 7+: IF Adoption Validates → Regional Expansion**
- Full Lebanon (20+ municipalities)
- All Italian major cities (50+ municipalities)
- Path to 50K+ MAU by end Year 1

### **IF Adoption Is Weak → Controlled Wind-Down**
- Document learnings
- Explore pivots (B2B to municipalities directly, not citizens first)
- Minimal financial impact

---

## 🎁 What Intarget Gets

1. **Low-Cost Market Validation:** €240 to test if civic-tech adoption works in Med region
2. **Revenue Opportunity:** If adoption is strong, €15K-50K Year 1 (SaaS fees to municipalities)
3. **Strategic Learning:** Real data on civic engagement, citizen-government dynamics
4. **Tech Partnership:** Proven GCP architecture, scalable to other verticals
5. **Optionality:** If Tripoli + Milano work, expand aggressively with low risk

---

## ✅ Why This Approach

**Old Narrative:** "Launch Mshkltk as enterprise with Cloud Run + BigQuery from day 1. Costs €50-80K. Hope for €300K revenue."
- High financial risk
- Assumes product-market fit exists (it doesn't)
- Overspend before validation

**New Narrative (Honest):** "Test Mshkltk with a €240 Firebase pilot. If adoption is real, scale confidently to Cloud Run (€300-600/month). If adoption is weak, learn, pivot, or wind down."
- **Low financial risk** (€240 vs €50-80K)
- **Evidence-based scaling** (not assumptions)
- **Intarget credibility:** We don't bullshit on numbers

**Bottom Line:** Intarget is known for being smart, not reckless. This approach shows we're validating before scaling. That's good business.

---

## 📝 Next Steps (If Approved)

1. **Week 1:** Set up GCP project, Firebase accounts
2. **Week 2-3:** Deploy Mshkltk to Firebase Hosting + Cloud Functions
3. **Week 4:** Begin Tripoli soft launch (govt outreach)
4. **Week 8:** Public launch (citizen download)
5. **Month 6:** Board review adoption metrics → decide on scaling

**Questions?** Let's discuss Phase 0 assumptions, expected KPIs, or risk mitigation.
