# 💰 GCP Cost Analysis - Mshkltk

**Document:** Financial & Cost Analysis  
**For:** Intarget Business & Finance Teams  
**Date:** November 15, 2025  
**Focus:** Pilot Phase (6 months) + Realistic Scale-Up Path

---

## 🎯 Executive Summary

**Realistic Cost Structure:**

| Timeline | Phase | Scenario | Monthly Cost | Cumulative Cost (6 mo) | Key Metric |
|----------|-------|----------|--------------|------------------------|-----------|
| **Months 1-6** | **Pilot** | Firebase (3K MAU) | €0–40/month | **€0–240** | ~240 DAU, 7.8K reads/day |
| **Months 7-12** | **Scale (IF adoption is strong)** | Cloud Run + Cloud SQL | €250–400/month | €1.5K–2.4K | 10K+ MAU |
| **Year 2+** | **Production** | Full Stack | €500–1.5K/month | — | 50K+ MAU |

**Bottom Line:** 
- **Pilot Reality (6 months):** €0–240 total (nearly free, validated by 3K MAU from PDF)
- **Year 1 Total:** €240–2.4K (€200–400 average if scaling post-pilot)
- **Cost per user:** €0.01–0.08 (depending on scale & engagement)
- **No enterprise spend needed until adoption proves the model**

---

## 📋 Phase 0: Firebase Pilot Costs (Months 1–6, 3K MAU)

### **Cost Breakdown by Service**

| Service | Free Tier | Pilot Usage | Unit Cost | Monthly | 6-Month Total |
|---------|-----------|-------------|-----------|---------|---------------|
| **Firebase Hosting** | 10 GB/month | ~1.5 GB | €0 | €0 | €0 |
| **Cloud Functions** | 2M invocations | ~240K | €0 | €0 | €0 |
| **Cloud Firestore** | 50K reads/day, 20K writes/day | 7.8K reads, 150 writes/day | €0 | €0 | €0 |
| **Cloud Storage** | 5 GB/month | ~1 GB/month | €0 | €0 | €0 |
| **Maps API** | 10K calls/month each | 11K maps, 1K geocoding | €0–5 overage | €0–5 | €0–30 |
| **Firebase Auth** | Unlimited | 3K users | €0 | €0 | €0 |
| **Cloud Logging** | 50 GB/month | ~1-2 GB | €0 | €0 | €0 |
| **Secret Manager** | 6 secrets free | 5 secrets | €0.06/secret/month | €0.30 | €1.80 |
| **Analytics** | Free | Firebase SDK | €0 | €0 | €0 |
| **Cloud Tasks (optional)** | 3 jobs free | <1 job/day | €0 | €0 | €0 |
| **Subtotal** | — | — | — | **€0.30–5** | **€1.80–30** |

**Realistic Pilot Range:** €0–40/month (accounting for small Map API overages or misconfiguration)

---

### **Detailed Service Analysis**

#### **1. Firebase Hosting** (Frontend)
- **Usage:** ~50MB/day traffic = ~1.5GB/month
- **Free Tier:** 10 GB/month
- **Cost:** €0

#### **2. Cloud Functions** (API Endpoints)
- **Usage:** ~240K API calls/month (7.8K reads/day + 150 writes/day)
- **Free Tier:** 2M invocations/month
- **Cost:** €0
- **Risk:** If app is deployed incorrectly with infinite loops, could hit costs. Mitigated by timeouts (60s) and billing alerts.

#### **3. Cloud Firestore** (Database)
- **Usage:** 
  - Reads: ~7.8K/day = ~234K/month
  - Writes: ~150/day = ~4.5K/month
  - Data size: ~50 MB (negligible)
- **Free Tier:** 50K reads/day, 20K writes/day
- **Cost:** €0
- **Risk:** If queries are inefficient or "hot partition" patterns emerge, cost could spike. Mitigated by schema design and monitoring.

#### **4. Cloud Storage** (Media)
- **Usage:** ~30-40 MB/day = ~1 GB/month (images ~500KB each, occasional 5MB videos)
- **Free Tier:** 5 GB/month (Operations: €0.0004 per 10K requests, negligible)
- **Cost:** €0 (at free tier)
- **Worst case:** If media exceeds 5 GB, overage is €0.020/GB = ~€0.10-0.20 extra

#### **5. Google Maps API**
- **Usage:**
  - Maps SDK: ~360 loads/day = ~11K/month (slight overage above 10K free)
  - Geocoding: ~900 codes/month (under 10K free)
- **Free Tier:** 10K per metric per month
- **Cost:** €0–5/month (Maps overage only)
- **Mitigation:** Image compression in frontend reduces payload; can set usage alerts

#### **6. Firebase Authentication**
- **Usage:** 3K users
- **Cost:** €0 (unlimited free)

#### **7. Cloud Logging & Monitoring**
- **Usage:** ~1-2 GB logs/month
- **Free Tier:** 50 GB/month
- **Cost:** €0

#### **8. Secret Manager**
- **Usage:** 5 secrets (Maps API key, Firebase admin key, encryption key, etc.)
- **Cost:** €0.06 per secret per month = €0.30/month
- **6-month total:** €1.80

---

### **Phase 0 Pilot: Total Cost**

| Scenario | Best Case | Realistic | Worst Case |
|----------|-----------|-----------|-----------|
| **Monthly Cost** | €0 | €2–5 | €30–40 |
| **6-Month Total** | €0 | €12–30 | €180–240 |
| **Per DAU** | €0 | €0.01–0.02 | €0.08–0.10 |

**Key Insight:** Firebase free tier is **genuinely sufficient for a 3K MAU pilot.** The platform was designed for exactly this scale.

---

## 📊 Phase 1: Scale-Up Costs (Post-Pilot, 10K+ MAU)

**Decision Gate:** Only scale if pilot achieves:
- ✅ 20%+ DAU/MAU engagement rate
- ✅ Officials actively responding (>50% response rate)
- ✅ Reports resulting in municipal action (>20% resolution rate)
- ✅ Week-over-week retention >70%

### **Cost Breakdown (Scaled to 10K MAU)**

| Service | Pilot (3K MAU) | Scale (10K MAU) | Difference | Notes |
|---------|---|---|---|---|
| **Firebase Hosting** | €0 | €0–10 | +€0–10 | More traffic, but still under free tier + CDN |
| **Cloud Functions** | €0 | €50–100 | +€50–100 | ~1M invocations/month (still free) + slight compute overage |
| **Cloud Firestore (migrate to Cloud SQL)** | €0 | €0 (data) | — | At 10K MAU, migrate to Cloud SQL for complex queries |
| **Cloud SQL (PostgreSQL + PostGIS)** | N/A | €100–150/month | +€100–150 | db-f1-micro instance (~db.t3.micro equivalent) |
| **Cloud Storage** | €0 | €10–30 | +€10–30 | ~20 GB/month media (€0.020/GB overage) |
| **Maps API** | €0–5 | €50–100 | +€50–95 | Higher query volume, but still optimizable |
| **Pub/Sub (async notifications)** | N/A | €5–15 | +€5–15 | New service for scaled notifications |
| **BigQuery (analytics)** | N/A | €30–50 | +€30–50 | Monthly data loading, queries |
| **Cloud Run (Express backend)** | €0 (Cloud Functions) | €100–150 | +€100–150 | Containerized API for complex logic |
| **Subtotal** | **€0–5** | **€345–615** | **+€340–610** | Per month |

**Phase 1 Realistic:** €300–600/month (average €450) for 10K MAU

---

### **Migration Costs (if scaling)**

| Cost Item | Estimate | Timing | Notes |
|-----------|----------|--------|-------|
| **Data Migration (Firestore → Cloud SQL)** | €0 | 1 week | No external cost; dev time only |
| **Cloud Function → Cloud Run refactoring** | €0 | 1-2 weeks | Straightforward (same Node.js code) |
| **Testing & QA** | €0 | 1 week | Internal effort |
| **Load testing & optimization** | €0–500 | 1 week | Optional, if performance tuning needed |
| **Staging environment (temporary)** | €50–100 | 2 weeks | Temporary Cloud Run instance |
| **Zero-downtime migration** | €0 | 4 hours | Blue/green deployment |
| **Total Migration Cost** | **€50–600** | **4 weeks** | One-time cost |

---

## 📈 Annual Cost Projections

### **Scenario A: Lean Pilot (Stay Firebase)**

Assumption: Adoption is moderate; want to extend pilot rather than scale.

| Year | Monthly (avg) | Annual | MAU | Notes |
|------|---|---|---|---|
| Year 1 (Pilot Phase) | €5/month | €60 | 3K | Firebase throughout |
| Year 2 | €10/month | €120 | 3K–5K | Minor cost creep; still Firebase |

**Total Year 1 Cost:** €60
**Cost per user:** €0.02

---

### **Scenario B: Successful Adoption (Scale Post-Pilot)**

Assumption: Strong engagement in months 1-6; scale to 10K MAU in months 7-12.

| Period | Monthly (avg) | 6-Month Total | MAU | Notes |
|--------|---|---|---|---|
| **Months 1-6 (Firebase Pilot)** | €5 | €30 | 3K | Near-zero cost |
| **Months 7-9 (Migration + early scale)** | €200 | €600 | 5K–8K | Testing Cloud Run/SQL |
| **Months 10-12 (Full scale)** | €400 | €1,200 | 8K–10K | Stable Cloud Run + Cloud SQL |
| **Year 1 Total** | **€200 avg** | — | 3K → 10K | **€2,430 Year 1 cost** |
| **Year 2 (Stable scaled state)** | €400–500 | €4,800–6,000 | 10K | Mature operations |

**Cost per user (Year 1, blended):** €0.24
**Cost per user (Year 2):** €0.48–0.60

---

### **Scenario C: Breakeven Analysis**

**Question:** At what MAU does Firebase become more expensive than Cloud Run + Cloud SQL?

**Answer:** ~15K MAU

| MAU | Firebase Cost | Cloud Run/SQL Cost | Break-even |
|-----|---|---|---|
| 3K | €5 | ~€0 (unused) | Firebase wins |
| 5K | €10 | ~€150 | Firebase wins |
| 10K | €30 | ~€400 | Firebase wins |
| 15K | €60 | ~€450 | Parity |
| 20K | €100 | ~€550 | Cloud Run wins |
| 50K | €300 | €1,200 | Cloud Run wins (economies of scale) |

**Interpretation:** Firebase is cheaper up to 15K MAU; beyond that, Cloud Run + Cloud SQL becomes more economical.

---

## 💡 Cost Optimization Strategies

### **Pilot Phase (Months 1-6)**
1. **Image compression in frontend** → Reduces storage & bandwidth
2. **Cloud Function caching** → Fewer database queries
3. **Firestore query optimization** → Proper indexing, avoid full collection scans
4. **Maps API billing alerts** → Catch overages early
5. **Don't use advanced features** → BigQuery, Pub/Sub, etc. are not needed yet

### **Scale Phase (Months 7-12, if applicable)**
1. **Cloud SQL connection pooling** → Reuse database connections
2. **Redis caching layer** → Memorystore, cache hot reports/confirmations
3. **BigQuery for analytics** → Move heavy reporting queries out of Cloud SQL
4. **Pub/Sub for notifications** → Decouple notification delivery from API response
5. **Cloud CDN** → Cache static assets, API responses
6. **Batch exports** → Aggregate heavy operations into scheduled jobs

### **Production Phase (Year 2+)**
1. **Reserved instances** → 30% discount on Cloud Run/Cloud SQL (long-term commitment)
2. **Committed use discounts** → GCP's loyalty discounts at scale
3. **Multi-region failover** → High availability without doubling cost (load balancing)
4. **Terraform automation** → IaC for cost-predictable infrastructure

---

## 🚨 Cost Risk & Mitigation

| Risk | Probability | Impact | Mitigation | Fallback |
|------|---|---|---|---|
| **Maps API overage** | High | €50–100/month | Implement client-side caching, usage alerts | Switch to Open Street Map (free) |
| **Uncompressed media** | Medium | €100+/month | Frontend validation, Cloud Function limits | Reject large files |
| **Rogue Cloud Function** | Low | €500+/month | Timeouts (60s), memory limits, dry-run tests | Kill function, restore from backup |
| **Unexpected Firebase costs** | Very low | €50+/month | Firebase has hard limits; unlikely to exceed | Auto-scale back to Firestore |
| **Adoption exceeds forecast** | Low | Cloud Run needed sooner | Scale-up timeline accelerated | Pre-plan migration to Cloud Run |

**Mitigation Strategy:** Set billing alerts at €20/month (pilot), €200/month (early scale). Revisit costs monthly.

---

## 📝 Cost Management Workflow

### **Monthly (Billing Cycle)**
1. Review GCP billing dashboard
2. Check service-by-service costs
3. Compare to forecast in this document
4. Adjust quotas/alerts if needed
5. Document any anomalies

### **Quarterly (Strategy Review)**
1. Assess pilot adoption metrics
2. Decide: stay Firebase or scale to Cloud Run?
3. Update cost forecasts
4. Brief Intarget stakeholders on financial status

### **Annual (Planning)**
1. Aggregate Year 1 costs
2. Calculate cost per user & per DAU
3. Update projections for Year 2
4. Identify reserved instances / committed discounts

---

## 🎯 ROI & Financial Case for Intarget Partnership

**Assumption:** Mshkltk generates revenue via:
- Intarget service fees (municipal adoption, premium analytics)
- Eventual SaaS license model (€500-1K/municipality/month)

**Revenue Model (Year 1, Post-Pilot):**
- Pilot (Months 1-6): €0 (validation phase)
- Early Revenue (Months 7-9): €2K (one municipality pilot fee)
- Full Launch (Months 10-12): €15K (Tripoli + Milano + 2 more cities)
- **Year 1 Revenue (est.):** €17K

**Year 1 Profitability:**
- Revenue: €17K
- GCP Cost: €2,430 (Scenario B)
- Dev/ops labor: ~€30K (Milo + 0.5 FTE engineer, pro-rata)
- **Year 1 Net:** €17K - €32,430 = -€15,430 (investment phase)

**Year 2 Profitability (Scaled):**
- Revenue (10K MAU + 5 municipalities): €50K (est.)
- GCP Cost: €5,500 (€400-500/month average)
- Dev/ops labor: €30K (0.5 FTE, stabilized)
- **Year 2 Net:** €50K - €35,500 = **€14,500 profit** ✅

**ROI Projection:**
- Breakeven: Month 16–18 (mid Year 2)
- 2-year cumulative: -€15,430 + €14,500 = -€930 (near breakeven)
- 3-year cumulative: -€930 + €30K (Year 3) = **€29K profit**

**Key Insight:** Mshkltk is not a cash-burning moonshot. It breaks even in Year 2 with conservative adoption (5 municipalities, 10K MAU). The €2.4K GCP cost Year 1 is trivial; the success factor is adoption & revenue model, not infrastructure cost.

---

## ✅ Conclusion

- **Pilot Phase (6 months):** €0–240 total (nearly free; validates market fit)
- **Scale Phase (if justified):** €250–600/month (Cloud Run + Cloud SQL)
- **Decision Gate:** Adoption metrics, not cost, determine scaling
- **Long-term:** Cost per user converges to €0.50–1.00 at 50K MAU (industry standard for civic tech)

**For Intarget:** This is a low-cost, low-risk way to validate a civic-tech platform in two Mediterranean cities. If adoption is strong, the scale path is clear. If it's weak, you've only spent €240 before pivoting. No enterprise spend needed upfront.

---
