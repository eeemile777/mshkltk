# 📑 GCP Proposal - Quick Start Guide

**Folder:** `/docs/gcp-proposal/`  
**Updated:** November 15, 2025  
**Status:** Pilot-First Proposal (4/5 core documents ready)

---

## 🎯 What This Proposal Is

This is a **lean, honest proposal** for deploying Mshkltk on Google Cloud Platform:

- **Phase 0 (Months 1-6):** Firebase pilot for €0–240 (validate before spending)
- **Phase 1 (Months 7+, if adoption is strong):** Scale to Cloud Run + Cloud SQL

**Philosophy:** "Build cheap, measure real metrics, scale only if adoption justifies it."

---

## 📁 The Documents

| File | Status | Read Time | For Whom |
|------|--------|-----------|----------|
| **INTARGET_PITCH.md** | ✅ Done | 5 min | Intarget leadership, decision makers |
| **ARCHITECTURE.md** | ✅ Done | 25 min (Phase 0) + 15 min (Phase 1) | Technical teams, architects |
| **COST_ANALYSIS.md** | ✅ Done | 20 min | Finance, business stakeholders |
| **README.md** | ✅ Done | 5 min | Anyone (overview + navigation) |
| **QUICK_START.md** | ✅ You are here | 3 min | Quick reference |

---

## 🚀 Quick Navigation

### **"I have 5 minutes" (Executive Brief)**
→ Read **INTARGET_PITCH.md**
- What's the opportunity?
- Why lean pilot approach?
- What's the timeline?
- What does Intarget get?

---

### **"I have 20 minutes" (Decision Meeting)**
→ Read in this order:
1. **INTARGET_PITCH.md** (5 min) - Business case
2. **COST_ANALYSIS.md** - Executive Summary section (10 min) - Financial reality
3. **ARCHITECTURE.md** - "Two Phases" section (5 min) - Why Firebase for pilot?

**Result:** You understand the pilot model and realistic costs.

---

### **"I have 1 hour" (Technical Deep Dive)**
→ Read in this order:
1. **INTARGET_PITCH.md** (5 min) - Context
2. **ARCHITECTURE.md** - Full Phase 0 section (25 min) - Firebase details
3. **COST_ANALYSIS.md** - Phase 0 & Phase 1 sections (20 min) - Cost breakdown
4. **README.md** - Reference (5 min) - Document structure

**Result:** You can discuss technical feasibility and implementation.

---

### **"I need to understand the Decision Gate" (Strategic)**
→ Read these sections:
1. **INTARGET_PITCH.md** - "Decision Gate (End of Month 6)" section
2. **README.md** - "Decision Gate Metrics" table
3. **COST_ANALYSIS.md** - "Phase 0 vs Phase 1" comparison

**Result:** You understand what triggers scaling from Firebase to Cloud Run.

---

### **"I'm implementing this" (Execution)**
→ Bookmark these documents:
1. **ARCHITECTURE.md** - Section: "Phase 0 Service Details" (reference during deployment)
2. **COST_ANALYSIS.md** - Service-by-service cost tables (for monitoring)
3. **README.md** - "Timeline Snapshot" (week-by-week checklist)

**Next steps after approval:**
- Create Firebase deployment plan (Week 1-3)
- Set up monitoring dashboard for adoption metrics (Week 2)
- Define go/no-go criteria for Phase 1 decision (Month 6)

---

## 🔑 Key Terms (Quick Reference)

### **Phase 0: Pilot (Months 1-6)**
- **What:** Firebase Hosting, Cloud Functions, Firestore
- **Who:** Tripoli + Milano users (target 3K MAU)
- **Cost:** €0–40/month (nearly free)
- **Goal:** Does the product work? Do users engage? Do officials respond?
- **Decision Point:** Month 6 - analyze metrics, decide to scale or pivot

### **Phase 1: Scale (Months 7+, if adopted)**
- **What:** Cloud Run, Cloud SQL, BigQuery
- **Who:** Multi-municipality expansion (target 10K+ MAU)
- **Cost:** €250–600/month (proven, advanced features)
- **Goal:** Serve enterprise users, analytics, advanced notifications
- **Trigger:** Adoption metrics pass decision gate (15%+ DAU/MAU, 50%+ official response, etc.)

### **Decision Gate**
End of Month 6, we measure:
- **DAU/MAU Ratio** - Are users coming back? (target >15%)
- **Official Response Rate** - Are officials using it? (target >50%)
- **Report Resolution Rate** - Is government acting? (target >20%)
- **Retention** - Are users sticky? (target >60% week-over-week)
- **Growth Trend** - Is adoption accelerating? (target growing week-over-week)

If 4/5 metrics hit targets → Scale. Otherwise → Optimize on Firebase or pivot.

---

## 💰 Cost Reality (One Table)

| Timeline | Platform | Cost | Scale | Decision |
|----------|----------|------|-------|----------|
| **Months 1-6** | Firebase | €0–240 | 3K MAU | Validate adoption |
| **Months 7-12 (IF adopted)** | Cloud Run + SQL | €3–5K | 10K+ MAU | Expand regionally |
| **Year 2+ (if successful)** | Mature GCP | €5–15K/month | 50K+ MAU | Recurring revenue |

**Bottom Line:** Low financial risk (€240 to test), clear scale path (if adoption is real).

---

## 📊 Document Quick Reference

### **INTARGET_PITCH.md** (5-page executive summary)
**Covers:**
- Why Intarget should partner with Mshkltk
- Lean pilot approach (€240 risk vs €50K enterprise spend)
- Timeline: Weeks 1-12 for Tripoli + Milano
- What Intarget earns: Revenue share + infrastructure margin
- Decision gate: When to scale (and when not to)

**Best for:** Leadership discussions, board presentations

---

### **ARCHITECTURE.md** (40-page technical spec)
**Covers:**
- **Phase 0 (Firebase):**
  - Firebase Hosting (frontend)
  - Cloud Functions (API)
  - Firestore (database)
  - Cloud Storage (media)
  - Maps API, Auth, Logging, Analytics
  - Service-by-service cost tables
- **Phase 1 (Scale):**
  - Cloud Run (backend container)
  - Cloud SQL (PostgreSQL + PostGIS)
  - BigQuery (analytics)
  - Pub/Sub (notifications)
  - Migration path from Firebase → production

**Best for:** Technical teams, architects, implementation planning

---

### **COST_ANALYSIS.md** (15-page financial breakdown)
**Covers:**
- **Phase 0:** Why each Firebase service is free for 3K MAU
- **Phase 1:** Cost of scaling (€250–600/month breakdown)
- **Scenarios:** Firebase-only, Firebase→Cloud Run migration, Year 2+ projections
- **Risks:** Overage scenarios + mitigation (billing alerts, quotas)
- **ROI:** Year 1 (€240 pilot + possible €3-5K scale) vs revenue (€15K-50K if adopted)

**Best for:** Finance reviews, cost control, risk mitigation

---

### **README.md** (5-page navigation guide)
**Covers:**
- What Phase 0 and Phase 1 are
- Decision gate criteria (what metrics trigger scaling?)
- Reading guides by role (5 min executive, 45 min technical, 1 hour deep dive)
- FAQ (Firebase vs Cloud Run, weak adoption plan, revenue model)
- Next steps if approved

**Best for:** Orientation, answers quick questions, points to right documents

---

## ❓ FAQ (Answers Inside Docs)

**Q: Why Firebase and not Cloud Run from day 1?**  
→ See INTARGET_PITCH.md: "Two-Phase Architecture" section
→ See ARCHITECTURE.md: "Rationale" after Phase 0 diagram

**Q: What if adoption is weak?**  
→ See README.md: FAQ section
→ See COST_ANALYSIS.md: "Scenario A: Lean Pilot (Stay Firebase)"

**Q: What if adoption is strong?**  
→ See INTARGET_PITCH.md: "Phase 1" section
→ See COST_ANALYSIS.md: "Phase 1 Scale-Up Costs"

**Q: How much will Year 1 really cost?**  
→ See COST_ANALYSIS.md: "Phase 0 Pilot Costs" + "Phase 1 Scale-Up" tables
→ See ARCHITECTURE.md: "Phase 0 Cost Summary"

**Q: What are the real KPIs for success?**  
→ See INTARGET_PITCH.md: "Decision Gate" section  
→ See README.md: "Decision Gate Metrics" table

**Q: When do we need to scale?**  
→ See README.md: "Decision Gate" section
→ See COST_ANALYSIS.md: "Scenario B: Successful Adoption"

**Q: What about GDPR, security, compliance?**  
→ These are Phase 1 documents (not yet written, will be created if pilot validates)
→ For now, assume Firebase default GDPR support + basic security

---

## 📋 Before Your Intarget Meeting

1. ✅ Read INTARGET_PITCH.md (5 min)
2. ✅ Scan COST_ANALYSIS.md Executive Summary (10 min)
3. ✅ Review ARCHITECTURE.md diagrams (10 min)
4. ⏳ Optional: Ask clarifying questions about adoption metrics or scaling timeline
5. ⏳ Optional: Prepare Q&A on competitor landscaping or municipal sales process

---

## 🎯 After Intarget Approves Pilot

1. **Week 1:** Use ARCHITECTURE.md Phase 0 to set up Firebase project
2. **Week 2-3:** Deploy Mshkltk to Firebase (step-by-step from README.md timeline)
3. **Week 4-12:** Run pilot, collect adoption metrics (track against Decision Gate criteria)
4. **Month 6:** Board review metrics, decide on Phase 1 scaling

---

**Need clarification?** Each main document can stand alone. Start with INTARGET_PITCH.md, then dig deeper into ARCHITECTURE.md or COST_ANALYSIS.md based on your role.
