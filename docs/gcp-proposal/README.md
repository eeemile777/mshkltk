# 🚀 Mshkltk x Google Cloud Platform (GCP) - Pilot-First Proposal

**Prepared for:** Intarget (Google Partner & Reseller - Milan)  
**Date:** November 15, 2025  
**Approach:** Lean 6-month Firebase pilot, then scale if adoption validates  
**Philosophy:** Validate with a cheap pilot (€240). Scale only if metrics prove adoption.

---

## � What's Included

This folder contains the complete technical and business proposal for deploying **Mshkltk** to Google Cloud Platform, starting with a Firebase-based pilot for Tripoli, Lebanon + Milano, Italy.

### **Philosophy: Two Phases, One Decision Gate**

```
PHASE 0 (Months 1-6)         DECISION GATE          PHASE 1 (Months 7+, IF ADOPTED)
─────────────────────────    ─────────────────    ──────────────────────────────
Firebase Pilot               Real Metrics?         Cloud Run + Cloud SQL Scale
€0–40/month                                       €250–600/month  
3K MAU, 240 DAU                                   10K+ MAU
```

---

## 📁 Proposal Documents

### **✅ Phase 0: Pilot Documents (Current)**

These documents describe the **lean, 6-month Firebase pilot**:

1. **[INTARGET_PITCH.md](./INTARGET_PITCH.md)** ⭐ **START HERE**
   - Executive summary (5 min read)
   - Why lean pilot is the right approach
   - Timeline: Months 1-6 Firebase, decision gate at Month 6
   - Cost reality: €0–240 total (nearly free)
   - Geographic focus: Tripoli + Milano
   - **Audience:** Intarget leadership

2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** 🏗️
   - **Section 1: Phase 0 Firebase Pilot** (Detailed service breakdown)
     - Firebase Hosting, Cloud Functions, Firestore, Cloud Storage, Maps API, Auth, Logging, etc.
     - 10 services explained with pilot-scale usage
     - Cost table: €0–40/month for 3K MAU
   - **Section 2: Phase 1 Scale-Up** (Only if adoption validates)
     - Cloud Run + Cloud SQL architecture
     - BigQuery, Pub/Sub, advanced features
     - Migration path from Firebase → production stack
   - **Read time:** 25 min (Phase 0) + 15 min (Phase 1 if interested)

3. **[COST_ANALYSIS.md](./COST_ANALYSIS.md)** 💰
   - **Phase 0 Breakdown:** Service-by-service pilot costs
     - Why each free tier covers pilot usage
     - Firebase realistic: €0–40/month, risk mitigation
   - **Phase 1 Scale-Up:** If adoption is strong
     - Cloud Run + Cloud SQL breakdown
     - Migration costs (€0 dev time, €50–100 staging)
   - **Financial Case:** Year 1 (pilot + possible scale), Year 2+ projections
   - **Read time:** 20 min

---

### **⏳ Phase 1: Scale-Up Documents (For Later)**

These will be created **IF** pilot adoption validates and we decide to scale:

- **MIGRATION_PLAN.md** - Week-by-week transition from Firebase → Cloud Run + Cloud SQL
- **SCALING_ROADMAP.md** - Months 7-12 technical roadmap
- **PRODUCTION_ARCHITECTURE.md** - Full Cloud Run + Cloud SQL + BigQuery stack details

---

### **📊 Supporting Documents (Reference)**

- **[QUICK_START.md](./QUICK_START.md)** �
  - Navigation guide showing which docs to read for your role
  - Quick reference: Pilot vs Scale terms
  - Decision gate criteria (what metrics trigger Phase 1?)

---

## 🎯 Reading Guide by Role

### **For Intarget Decision-Makers (15 min)**
1. This README (overview)
2. INTARGET_PITCH.md (business case)
3. COST_ANALYSIS.md - Executive Summary (financial reality)

→ **Decision:** Approve 6-month Firebase pilot (€240 risk)?

---

### **For Intarget Technical Team (45 min)**
1. ARCHITECTURE.md - Phase 0 section (Firebase pilot details)
2. COST_ANALYSIS.md (service-level costs, risks)
3. INTARGET_PITCH.md - Decision Gate section (what metrics validate scaling?)

→ **Decision:** Feasible to deploy to Firebase on the given timeline?

---

### **For Implementation Planning (if approved)**
1. ARCHITECTURE.md - Phase 0 service details (what needs to be configured?)
2. Create detailed Firebase deployment plan (week 1-12)
3. Define monitoring dashboard for adoption metrics

---

## 🔑 Key Concepts

### **Phase 0: Pilot (Months 1-6)**
- **Platform:** Firebase Hosting, Cloud Functions, Firestore, Cloud Storage
- **Scale:** 3K MAU combined (Tripoli + Milano), ~240 DAU
- **Cost:** €0–40/month (nearly free, free tier handles all usage)
- **Goal:** Validate if citizens engage, if officials respond, if model works
- **Decision Point (Month 6):** Based on adoption metrics, scale or pivot?

### **Phase 1: Scale (Months 7+, only if adoption metrics hit targets)**
- **Platform:** Cloud Run, Cloud SQL, BigQuery, Pub/Sub
- **Scale:** 10K+ MAU (if adoption validates), regional expansion
- **Cost:** €250–600/month (proven architecture, advanced features)
- **Goal:** Serve multiple municipalities, enterprise features, analytics
- **Trigger:** 15%+ DAU/MAU, 50%+ official response rate, 20%+ resolution rate

### **Decision Gate Metrics (End of Month 6)**
| Metric | Target | If YES → Scale | If NO → Pivot |
|--------|--------|---|---|
| DAU/MAU Engagement | >15% | ✅ Users are engaged | Review product/UX |
| Official Response Rate | >50% | ✅ Government is using | Improve value prop |
| Report Resolution Rate | >20% | ✅ Government is acting | Reframe mechanics |
| 4-Week Retention | >60% | ✅ Users return | Optimize onboarding |
| User Growth Trend | Growing WoW | ✅ Viral coefficient | Check if bottleneck |

---

## 📊 Budget Reality

| Item | Cost | Timeline |
|------|------|----------|
| **Firebase Pilot** | €0–240 | 6 months |
| **Intarget Engagement** | €0 (GCP reseller, already built) | — |
| **Scale to Cloud Run** | €3–5K | Months 7-12 (IF adopted) |
| **Year 1 Total** | **€3–5.2K** | Months 1-12 |
| **Revenue (if adopted)** | €15K–50K | Months 7-12 (est.) |

---

## ✅ Why This Approach (Honest Assessment)

**OLD Narrative:** "Launch Mshkltk on enterprise GCP with Cloud Run + BigQuery. Year 1 cost €50-80K. Expected revenue €300K-500K. ROI 400-600%."
- High risk: Assumes product-market fit
- High spend: €50K before validation
- Bullshit metrics: Revenue numbers are fantasy without data

**NEW Narrative:** "Test Mshkltk with a €240 Firebase pilot. Measure adoption. If real, scale to Cloud Run (€250-600/month). If weak, learn and pivot."
- Low risk: €240 to validate
- Evidence-based: Real KPI data, not assumptions
- Honest: We don't overspend before proving the model works
- Intarget credibility: Shows smart business thinking

---

## 📅 Timeline Snapshot

| Week | Phase | Deliverable | Cost |
|------|-------|-------------|------|
| 1 | Setup | GCP accounts, Firebase config | €0 |
| 2-3 | Deploy | Mshkltk on Firebase, Cloud Functions | €0 |
| 4-8 | Soft Launch | Tripoli pilot, officials onboard | €10 |
| 9-12 | Public Launch | Open signup, Milano soft launch | €20 |
| Month 4-6 | Pilot Growth | Collect metrics, optimize | €30 |
| **Month 6** | **DECISION GATE** | **Analyze metrics, board decides** | — |
| Month 7-12 (IF YES) | Scale | Migrate to Cloud Run + SQL | €3–5K |

---

## 🤔 FAQ

**Q: Why Firebase instead of Cloud Run from day 1?**  
A: Firebase is free for pilot scale (3K MAU). Cloud Run costs €250-600/month minimum. Firebase validates before we spend money.

**Q: What if adoption is weak?**  
A: We've only spent €240. We document learnings, explore pivots (e.g., B2B-first to municipalities), or wind down gracefully. No big loss.

**Q: What if adoption is strong?**  
A: Month 7, we migrate to Cloud Run + Cloud SQL (3-4 weeks, zero downtime). Regional expansion begins. Revenue model activates.

**Q: How long can we stay on Firebase?**  
A: Indefinitely, technically. But at 10K+ MAU, Cloud Run becomes more economical. We transition when/if adoption justifies.

**Q: What's the revenue model?**  
A: See INTARGET_PITCH.md "What Intarget Gets" section. Conservative: €15K–50K Year 1 (if scaling); SaaS recurring fees to municipalities + data exports.

---

## 🚀 Next Step

**If Intarget approves pilot:**

1. **Week 1:** Set up GCP project + Firebase accounts + secrets
2. **Week 2-3:** Deploy Mshkltk (React → Firebase Hosting, API → Cloud Functions, data → Firestore)
3. **Week 4:** Begin Tripoli soft launch (government outreach)
4. **Week 8:** Public launch (citizen download + marketing)
5. **Month 4-6:** Grow user base, collect adoption metrics
6. **Month 6:** Board review → Scale decision

---

**Questions?** See QUICK_START.md for detailed reading guides, or reach out to discuss Phase 0 assumptions.
