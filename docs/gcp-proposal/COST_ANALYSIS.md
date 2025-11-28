# 💰 GCP Cost Analysis - Mshkltk (Realistic & Optimized)

**Document:** Financial & Cost Analysis  
**Date:** November 25, 2025  
**Focus:** Realistic Scenarios for Tripoli (Lebanon) & Milan (Italy)  
**Assumptions:** 100% AI usage, 2-3 media per report, optimized Maps

---

## 🎯 Executive Summary

This analysis provides **realistic** cost modeling for Mshkltk on Google Cloud Platform using the **Cloud Run + Cloud SQL** architecture.

**Key Findings:**
- **Tripoli (250k population):** €15–400/month depending on adoption (0.4%–8% penetration)
- **Milan (1.4M population):** €100–5,500/month depending on adoption (0.4%–14% penetration)
- **Primary Cost Drivers:** Maps API (>50%), Cloud SQL (15-30%), Cloud Run (5-15%), AI Analysis (<10%)
- **All scenarios include:** 100% AI usage, optimized Maps, realistic engagement
- **Architecture:** Multi-tenant (shared backend, city-specific frontends) - costs are **additive**, not multiplicative

> **Note:** These costs assume a **shared backend** serving multiple cities. Adding a new city only adds incremental costs (Maps, AI, Storage for that city's users), not full infrastructure duplication. See [ARCHITECTURE.md](./ARCHITECTURE.md) for multi-tenant design.

---

## 📊 Population & Market Context

### Tripoli, Lebanon 🇱🇧
- **Population:** ~250,000 (metro area)
- **Internet Penetration:** ~78%
- **Smartphone Ownership:** ~65%
- **Addressable Market:** ~162,500 potential users
- **Civic Engagement Context:** High need for infrastructure reporting, limited municipal resources
- **Language:** Primarily Arabic, some French/English

### Milan, Italy 🇮🇹
- **Population:** ~1,400,000 (metro area ~3.2M)
- **Internet Penetration:** ~92%
- **Smartphone Ownership:** ~88%
- **Addressable Market:** ~1,128,000 potential users
- **Civic Engagement Context:** High expectations, existing digital services, tech-savvy population
- **Language:** Italian, some English

---

## 🔢 Realistic User Behavior Model

### User Segmentation

We model three distinct user types based on civic tech research:

| User Type | % of MAU | Reports/Month | Photos/Report | App Sessions/Month | Behavior |
|:---|:---:|:---:|:---:|:---:|:---|
| **Casual Reporter** | 60% | 1 | 2 | 3 | Reports once, checks status occasionally |
| **Active Citizen** | 30% | 5 | 2.5 | 12 | Regular reporter, browses map, comments |
| **Power User** | 10% | 15 | 3 | 30 | Daily usage, community activist, heavy engagement |

### Blended Average per MAU:
- **Reports per MAU per month:** (0.6 × 1) + (0.3 × 5) + (0.1 × 15) = **3.6 reports/MAU/month**
- **Photos per report:** 2.5 average (some reports have 2, some have 3)
- **Map loads per session:** 4 average (browse map, view reports, check location)

### AI Usage (100% of Reports):
- **Categorization:** Every report analyzed for category suggestion
- **Image Analysis:** Every photo analyzed (damage detection, quality check)
- **Text Processing:** Every description analyzed (language detection, quality, urgency)
- **Estimated tokens per report:** ~3,000 input tokens (text + image analysis)

---

## 🇱🇧 Tripoli, Lebanon - Realistic Scenarios

### Scenario 1: Minimal Adoption (0.4% penetration)
**User Base:** 1,000 MAU | 120 DAU (12% engagement)

#### Usage Assumptions:
- **Reports:** 3.6 per MAU = 3,600/month = 120/day
- **Photos:** 2.5 per report = 9,000 photos/month
- **Photo size:** 600KB average (compressed) = 5.4GB uploads/month
- **Map loads:** 4 per session × 120 DAU × 25 days = 12,000/month
  - *Optimized:* 80% static, 20% dynamic = 2,400 dynamic, 9,600 static
- **AI analysis:** 100% of reports = 3,600 AI calls/month
- **AI tokens:** 3,000 tokens/report × 3,600 = 10.8M tokens/month
- **Comments:** 0.4 per report = 1,440/month
- **Geocoding:** 1 per report = 3,600/month (90% cache hit = 360 API calls)

#### Cost Breakdown:

| Service | Usage | Unit Cost | Monthly Cost |
|:---|:---|:---:|:---:|
| **Cloud Run** | ~120k requests, 5 CPU-hours | Free tier (180k vCPU-sec) | €0 |
| **Cloud SQL** | db-f1-micro, 15GB storage | Fixed | €12 |
| **Cloud Storage** | 5.4GB uploads, 8GB total | €0.020/GB | €0.20 |
| **Maps - Dynamic** | 2,400 loads | Free tier (10k) | €0 |
| **Maps - Static** | 9,600 loads | Free tier (10k) | €0 |
| **Maps - Geocoding** | 360 API calls (90% cached) | Free tier (10k) | €0 |
| **Vertex AI** | 10.8M tokens input, 1M output | €0.075/1M in, €0.30/1M out | €1.10 |
| **Firebase Hosting** | 8GB bandwidth | Free tier (10GB) | €0 |
| **Secret Manager** | 5 secrets | Free tier (6 versions) | €0 |
| **Cloud Logging** | 3GB logs | Free tier (50GB) | €0 |
| **TOTAL** | | | **€13.30/month** |

**Cost per MAU:** €0.013  
**Cost per report:** €0.004

---

### Scenario 2: Conservative (1.5% penetration)
**User Base:** 3,750 MAU | 450 DAU

#### Usage Assumptions:
- **Reports:** 3.6 per MAU = 13,500/month = 450/day
- **Photos:** 2.5 per report = 33,750 photos/month
- **Photo size:** 600KB avg = 20GB uploads/month
- **Map loads:** 4 per session × 450 DAU × 25 days = 45,000/month
  - *Optimized:* 80% static, 20% dynamic = 9,000 dynamic, 36,000 static
- **AI analysis:** 100% = 13,500 AI calls/month
- **AI tokens:** 3,000 × 13,500 = 40.5M tokens/month
- **Comments:** 0.5 per report = 6,750/month
- **Geocoding:** 13,500/month (90% cache = 1,350 API calls)

#### Cost Breakdown:

| Service | Usage | Unit Cost | Monthly Cost |
|:---|:---|:---:|:---:|
| **Cloud Run** | ~450k requests, 18 CPU-hours | Free tier (50 vCPU-hrs) | €0 |
| **Cloud SQL** | db-custom-1-3840, 25GB | ~$55/mo | €55 |
| **Cloud Storage** | 20GB uploads, 30GB total | €0.020/GB | €0.60 |
| **Maps - Dynamic** | 9,000 loads | Free tier (10k) | €0 |
| **Maps - Static** | 36,000 loads | €2/1k (26k paid) | €52 |
| **Maps - Geocoding** | 1,350 API calls | Free tier (10k) | €0 |
| **Vertex AI** | 40.5M input, 4M output | €0.075/1M in, €0.30/1M out | €4.25 |
| **Firebase Hosting** | 25GB bandwidth | €0.026/GB overage | €0.40 |
| **Secret Manager** | 5 secrets | Free tier | €0 |
| **TOTAL** | | | **€112.25/month** |

**Cost per MAU:** €0.030  
**Cost per report:** €0.008

---

### Scenario 3: Realistic (4% penetration)
**User Base:** 10,000 MAU | 1,200 DAU

#### Usage Assumptions:
- **Reports:** 3.6 per MAU = 36,000/month = 1,200/day
- **Photos:** 2.5 per report = 90,000 photos/month
- **Photo size:** 600KB avg = 54GB uploads/month
- **Map loads:** 4 per session × 1,200 DAU × 25 days = 120,000/month
  - *Optimized:* 80% static, 20% dynamic = 24,000 dynamic, 96,000 static
- **AI analysis:** 100% = 36,000 AI calls/month
- **AI tokens:** 3,000 × 36,000 = 108M tokens/month
- **Comments:** 0.6 per report = 21,600/month
- **Geocoding:** 36,000/month (90% cache = 3,600 API calls)

#### Cost Breakdown:

| Service | Usage | Unit Cost | Monthly Cost |
|:---|:---|:---:|:---:|
| **Cloud Run** | ~1.2M requests, 50 CPU-hours | Free tier (50 vCPU-hrs) | €0 |
| **Cloud SQL** | db-custom-2-8192, 60GB | ~$100/mo | €100 |
| **Cloud Storage** | 54GB uploads, 100GB total | €0.020/GB | €2.00 |
| **Maps - Dynamic** | 24,000 loads | €7/1k (14k paid) | €98 |
| **Maps - Static** | 96,000 loads | €2/1k (86k paid) | €172 |
| **Maps - Geocoding** | 3,600 API calls | Free tier (10k) | €0 |
| **Vertex AI** | 108M input, 10M output | €0.075/1M in, €0.30/1M out | €11.10 |
| **Firebase Hosting** | 70GB bandwidth | €0.026/GB overage | €1.60 |
| **Secret Manager** | 5 secrets | Free tier | €0 |
| **TOTAL** | | | **€384.70/month** |

**Cost per MAU:** €0.038  
**Cost per report:** €0.011

---

### Scenario 4: Optimistic (8% penetration)
**User Base:** 20,000 MAU | 2,400 DAU

#### Usage Assumptions:
- **Reports:** 3.6 per MAU = 72,000/month = 2,400/day
- **Photos:** 2.5 per report = 180,000 photos/month
- **Photo size:** 600KB avg = 108GB uploads/month
- **Map loads:** 4 per session × 2,400 DAU × 25 days = 240,000/month
  - *Optimized:* 80% static, 20% dynamic = 48,000 dynamic, 192,000 static
- **AI analysis:** 100% = 72,000 AI calls/month
- **AI tokens:** 3,000 × 72,000 = 216M tokens/month
- **Comments:** 0.8 per report = 57,600/month
- **Geocoding:** 72,000/month (90% cache = 7,200 API calls)

#### Cost Breakdown:

| Service | Usage | Unit Cost | Monthly Cost |
|:---|:---|:---:|:---:|
| **Cloud Run** | ~2.5M requests, 100 CPU-hours | 50 billable hrs x $0.0864 | €4.30 |
| **Cloud SQL** | db-custom-2-8192 HA, 120GB | ~$200/mo (HA) | €200 |
| **Cloud Storage** | 108GB uploads, 220GB total | €0.020/GB | €4.40 |
| **Maps - Dynamic** | 48,000 loads | €7/1k (38k paid) | €266 |
| **Maps - Static** | 192,000 loads | €2/1k (182k paid) | €364 |
| **Maps - Geocoding** | 7,200 API calls | Free tier (10k) | €0 |
| **Vertex AI** | 216M input, 20M output | €0.075/1M in, €0.30/1M out | €22.20 |
| **Firebase Hosting** | 150GB bandwidth | €0.026/GB overage | €3.60 |
| **Secret Manager** | 5 secrets | Free tier | €0 |
| **TOTAL** | | | **€864.50/month** |

**Cost per MAU:** €0.043  
**Cost per report:** €0.012

---

## 🇮🇹 Milan, Italy - Realistic Scenarios

### Scenario 1: Minimal Adoption (0.4% penetration)
**User Base:** 5,600 MAU | 672 DAU

#### Usage Assumptions:
- **Reports:** 3.6 per MAU = 20,160/month = 672/day
- **Photos:** 2.5 per report = 50,400 photos/month
- **Photo size:** 650KB avg (higher quality) = 33GB uploads/month
- **Map loads:** 4 per session × 672 DAU × 25 days = 67,200/month
  - *Optimized:* 80% static, 20% dynamic = 13,440 dynamic, 53,760 static
- **AI analysis:** 100% = 20,160 AI calls/month
- **AI tokens:** 3,000 × 20,160 = 60.5M tokens/month
- **Comments:** 0.5 per report = 10,080/month
- **Geocoding:** 20,160/month (90% cache = 2,016 API calls)

#### Cost Breakdown:

| Service | Usage | Unit Cost | Monthly Cost |
|:---|:---|:---:|:---:|
| **Cloud Run** | ~670k requests, 28 CPU-hours | €0.00001/vCPU-sec | €22 |
| **Cloud SQL** | db-custom-1-3840, 35GB | Fixed | €40 |
| **Cloud Storage** | 33GB uploads, 50GB total | €0.020/GB | €1.20 |
| **Maps - Dynamic** | 13,440 loads | Free tier (28k) | €0 |
| **Maps - Static** | 53,760 loads | €2/1k (25.8k paid) | €52 |
| **Maps - Geocoding** | 2,016 API calls | Free tier | €0 |
| **Vertex AI** | 60.5M input, 6M output | €0.075/1M in, €0.30/1M out | €6.35 |
| **Firebase Hosting** | 40GB bandwidth | €0.10/GB overage | €3 |
| **Secret Manager** | 5 secrets | €0.06/secret | €0.30 |
| **TOTAL** | | | **€124.85/month** |

**Cost per MAU:** €0.022  
**Cost per report:** €0.006

---

### Scenario 2: Conservative (1.5% penetration)
**User Base:** 21,000 MAU | 2,520 DAU

#### Usage Assumptions:
- **Reports:** 3.6 per MAU = 75,600/month = 2,520/day
- **Photos:** 2.5 per report = 189,000 photos/month
- **Photo size:** 650KB avg = 123GB uploads/month
- **Map loads:** 4 per session × 2,520 DAU × 25 days = 252,000/month
  - *Optimized:* 80% static, 20% dynamic = 50,400 dynamic, 201,600 static
- **AI analysis:** 100% = 75,600 AI calls/month
- **AI tokens:** 3,000 × 75,600 = 226.8M tokens/month
- **Comments:** 0.6 per report = 45,360/month
- **Geocoding:** 75,600/month (90% cache = 7,560 API calls)

#### Cost Breakdown:

| Service | Usage | Unit Cost | Monthly Cost |
|:---|:---|:---:|:---:|
| **Cloud Run** | ~2.5M requests, 105 CPU-hours | €0.00001/vCPU-sec | €84 |
| **Cloud SQL** | db-custom-2-8192, 80GB | Fixed | €80 |
| **Cloud Storage** | 123GB uploads, 200GB total | €0.020/GB | €4.50 |
| **Maps - Dynamic** | 50,400 loads | €7/1k (22.4k paid) | €157 |
| **Maps - Static** | 201,600 loads | €2/1k (173.6k paid) | €347 |
| **Maps - Geocoding** | 7,560 API calls | Free tier | €0 |
| **Vertex AI** | 226.8M input, 22M output | €0.075/1M in, €0.30/1M out | €23.60 |
| **Firebase Hosting** | 160GB bandwidth | €0.10/GB overage | €15 |
| **Secret Manager** | 5 secrets | €0.06/secret | €0.30 |
| **TOTAL** | | | **€711.40/month** |

**Cost per MAU:** €0.034  
**Cost per report:** €0.009

---

### Scenario 3: Realistic (4% penetration)
**User Base:** 56,000 MAU | 6,720 DAU

#### Usage Assumptions:
- **Reports:** 3.6 per MAU = 201,600/month = 6,720/day
- **Photos:** 2.5 per report = 504,000 photos/month
- **Photo size:** 650KB avg = 328GB uploads/month
- **Map loads:** 4 per session × 6,720 DAU × 25 days = 672,000/month
  - *Optimized:* 80% static, 20% dynamic = 134,400 dynamic, 537,600 static
- **AI analysis:** 100% = 201,600 AI calls/month
- **AI tokens:** 3,000 × 201,600 = 604.8M tokens/month
- **Comments:** 0.8 per report = 161,280/month
- **Geocoding:** 201,600/month (90% cache = 20,160 API calls)

#### Cost Breakdown:

| Service | Usage | Unit Cost | Monthly Cost |
|:---|:---|:---:|:---:|
| **Cloud Run** | ~6.7M requests, 280 CPU-hours | €0.00001/vCPU-sec | €224 |
| **Cloud SQL** | db-custom-2-8192 HA, 180GB | Fixed + HA | €160 |
| **Cloud Storage** | 328GB uploads, 550GB total | €0.020/GB | €12 |
| **Maps - Dynamic** | 134,400 loads | €7/1k (106.4k paid) | €745 |
| **Maps - Static** | 537,600 loads | €2/1k (509.6k paid) | €1,019 |
| **Maps - Geocoding** | 20,160 API calls | Free tier | €0 |
| **Vertex AI** | 604.8M input, 60M output | €0.075/1M in, €0.30/1M out | €63.36 |
| **Firebase Hosting** | 450GB bandwidth | €0.10/GB overage | €44 |
| **Secret Manager** | 5 secrets | €0.06/secret | €0.30 |
| **TOTAL** | | | **€2,267.66/month** |

**Cost per MAU:** €0.040  
**Cost per report:** €0.011

---

### Scenario 4: Optimistic (8% penetration)
**User Base:** 112,000 MAU | 13,440 DAU

#### Usage Assumptions:
- **Reports:** 3.6 per MAU = 403,200/month = 13,440/day
- **Photos:** 2.5 per report = 1,008,000 photos/month
- **Photo size:** 650KB avg = 655GB uploads/month
- **Map loads:** 4 per session × 13,440 DAU × 25 days = 1,344,000/month
  - *Optimized:* 80% static, 20% dynamic = 268,800 dynamic, 1,075,200 static
- **AI analysis:** 100% = 403,200 AI calls/month
- **AI tokens:** 3,000 × 403,200 = 1,209.6M tokens/month
- **Comments:** 1.0 per report = 403,200/month
- **Geocoding:** 403,200/month (90% cache = 40,320 API calls)

#### Cost Breakdown:

| Service | Usage | Unit Cost | Monthly Cost |
|:---|:---|:---:|:---:|
| **Cloud Run** | ~13.4M requests, 560 CPU-hours | €0.00001/vCPU-sec | €448 |
| **Cloud SQL** | db-custom-4-16384 HA, 350GB | Fixed + HA | €320 |
| **Cloud Storage** | 655GB uploads, 1.1TB total | €0.020/GB | €24 |
| **Maps - Dynamic** | 268,800 loads | €7/1k (240.8k paid) | €1,686 |
| **Maps - Static** | 1,075,200 loads | €2/1k (1,047.2k paid) | €2,094 |
| **Maps - Geocoding** | 40,320 API calls | €5/1k (12.3k paid) | €62 |
| **Vertex AI** | 1,209.6M input, 120M output | €0.075/1M in, €0.30/1M out | €126.72 |
| **Firebase Hosting** | 900GB bandwidth | €0.10/GB overage | €89 |
| **Secret Manager** | 5 secrets | €0.06/secret | €0.30 |
| **Cloud CDN** | Enabled | Included | €0 |
| **TOTAL** | | | **€4,850/month** |

**Cost per MAU:** €0.043  
**Cost per report:** €0.012

---

### Scenario 5: Ambitious (14% penetration)
**User Base:** 196,000 MAU | 23,520 DAU

#### Usage Assumptions:
- **Reports:** 3.6 per MAU = 705,600/month = 23,520/day
- **Photos:** 2.5 per report = 1,764,000 photos/month
- **Photo size:** 650KB avg = 1.15TB uploads/month
- **Map loads:** 4 per session × 23,520 DAU × 25 days = 2,352,000/month
  - *Optimized:* 80% static, 20% dynamic = 470,400 dynamic, 1,881,600 static
- **AI analysis:** 100% = 705,600 AI calls/month
- **AI tokens:** 3,000 × 705,600 = 2,116.8M tokens/month
- **Comments:** 1.2 per report = 846,720/month
- **Geocoding:** 705,600/month (90% cache = 70,560 API calls)

#### Cost Breakdown:

| Service | Usage | Unit Cost | Monthly Cost |
|:---|:---|:---:|:---:|
| **Cloud Run** | ~23.5M requests, 980 CPU-hours | €0.00001/vCPU-sec | €784 |
| **Cloud SQL** | db-custom-8-32768 HA, 650GB | Fixed + HA | €640 |
| **Cloud Storage** | 1.15TB uploads, 2TB total | €0.020/GB | €42 |
| **Maps - Dynamic** | 470,400 loads | €7/1k (442.4k paid) | €3,097 |
| **Maps - Static** | 1,881,600 loads | €2/1k (1,853.6k paid) | €3,707 |
| **Maps - Geocoding** | 70,560 API calls | €5/1k (42.6k paid) | €213 |
| **Vertex AI** | 2,116.8M input, 210M output | €0.075/1M in, €0.30/1M out | €221.76 |
| **Firebase Hosting** | 1.6TB bandwidth | €0.10/GB overage | €160 |
| **Secret Manager** | 5 secrets | €0.06/secret | €0.30 |
| **Cloud CDN** | Enabled | Included | €0 |
| **Cloud Memorystore** | Redis 2GB (caching) | Fixed | €50 |
| **TOTAL** | | | **€8,915/month** |

**Cost per MAU:** €0.045  
**Cost per report:** €0.013

---

## 📈 Comparative Summary

> **Note:** All costs reflect **realistic usage** (100% AI, 3.6 reports/MAU/month, 2.5 photos/report, optimized Maps).

### Tripoli Cost Progression

| Scenario | MAU | Monthly Cost | Cost/MAU | Cost/Report |
|:---|---:|---:|---:|---:|
| Minimal (0.4%) | 1,000 | €18 | €0.018 | €0.005 |
| Conservative (1.5%) | 3,750 | €72 | €0.019 | €0.005 |
| Realistic (4%) | 10,000 | €266 | €0.027 | €0.007 |
| Optimistic (8%) | 20,000 | €730 | €0.036 | €0.010 |

### Milan Cost Progression

| Scenario | MAU | Monthly Cost | Cost/MAU | Cost/Report |
|:---|---:|---:|---:|---:|
| Minimal (0.4%) | 5,600 | €125 | €0.022 | €0.006 |
| Conservative (1.5%) | 21,000 | €711 | €0.034 | €0.009 |
| Realistic (4%) | 56,000 | €2,268 | €0.040 | €0.011 |
| Optimistic (8%) | 112,000 | €4,850 | €0.043 | €0.012 |
| Ambitious (14%) | 196,000 | €8,915 | €0.045 | €0.013 |

---

## 💡 Key Insights

### Cost Drivers (Realistic Scenarios):

1. **Maps API (40-50%):** Still the biggest cost, but optimized
2. **AI Analysis (25-35%):** Now significant with 100% usage
3. **Cloud SQL (15-20%):** Database costs scale with data
4. **Cloud Run (10-15%):** Compute is efficient
5. **Storage (2-5%):** Photos add up but manageable

### Cost per Report Trends:
- **Economies of scale work:** Cost per report drops from €0.006 → €0.013 as you scale
- **AI is consistent:** ~€0.001-0.002 per report regardless of scale
- **Maps dominate:** ~€0.005-0.008 per report at scale

---

## ⚠️ Critical Assumptions to Validate

1. **3.6 reports/MAU/month:** Based on 60% casual (1/mo), 30% active (5/mo), 10% power (15/mo)
   - **Validate:** Track actual user behavior in first 3 months
   
2. **2.5 photos/report:** Assumes most reports have 2-3 photos
   - **Risk:** Could be higher (4-5 photos) if users are thorough
   
3. **90% geocoding cache hit:** Assumes addresses repeat frequently
   - **Validate:** Monitor cache hit rate weekly
   
4. **80% static maps:** Assumes list views dominate over detail views
   - **Validate:** Track map load patterns

---

## 🎯 Recommendations

### For Tripoli Launch:
- **Budget:** €20-30/month (covers Minimal scenario with buffer)
- **Billing Alerts:** €50, €100, €150
- **Monitor:** AI usage, map loads, report volume

### For Milan Launch:
- **Budget:** €150-200/month initially (Minimal scenario)
- **Scale to:** €700-1,000/month if Conservative adoption
- **Billing Alerts:** €200, €500, €1,000, €2,000
- **Critical:** Implement all Maps optimizations from day 1

### General:
- **Week 1:** Track actual reports/MAU vs 3.6 assumption
- **Month 1:** Validate all cost assumptions against real data
- **Month 3:** Revise forecast based on actual patterns
- **Always:** Keep Maps optimization as top priority

---

## ✅ Conclusion

With **realistic assumptions** (100% AI, higher engagement, more photos):

- **Tripoli:** €18-730/month (manageable for pilot)
- **Milan:** €125-8,915/month (requires budget planning)

**The good news:** Cost per report stays low (€0.005-0.013) even at scale. The platform is economically viable.

**The reality:** Maps + AI will cost more than initially estimated, but it's predictable and controllable with proper optimization.
