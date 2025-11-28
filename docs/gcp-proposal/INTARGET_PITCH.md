# 🚀 Mshkltk: GCP Migration & Scale-Up Strategy

**For:** Intarget & Stakeholders  
**Date:** November 25, 2025  

---

## 🌟 The Vision
**Mshkltk** is not just a reporting app; it's a bridge between citizens and municipalities. We are building a platform that turns complaints into data-driven civic improvements.

To succeed, we need a hosting platform that is:
1.  **Reliable:** It must work when citizens need it.
2.  **Scalable:** From 100 users in Tripoli to 100,000 in Milan.
3.  **Cost-Effective:** Sustainable for municipal budgets.

---

## 🏗️ Our Solution: "Serverless Containers" on GCP

We have chosen a modern, industry-standard architecture using **Google Cloud Run** and **Cloud SQL**.

### Why this wins:
*   **Zero Wasted Cost:** We pay only when people use the app. If no one reports a pothole at 3 AM, we pay €0 for compute.
*   **No Rewrite Needed:** We take our existing, tested code and deploy it directly. No risky "serverless functions" rewrite.
*   **Infinite Scale:** If a report goes viral, Google Cloud automatically adds more capacity in seconds.

---

## 🏙️ The Rollout Plan

### Phase 1: The Tripoli Pilot 🇱🇧
*Goal: Validation & Trust*
*   **Target:** 1,000 - 5,000 Active Users.
*   **Infrastructure:** Shared-core database, single container instance.
*   **Estimated Cost:** **< €20 / month.**
*   **Risk:** Near Zero.

### Phase 2: The Milan Expansion 🇮🇹
*Goal: Growth & Integration*
*   **Target:** 50,000+ Active Users.
*   **Infrastructure:** High-Availability Database, Auto-scaling containers (1-50+), Dedicated Support.
*   **Estimated Cost:** **€150 - €400 / month.**
*   **Value:** At this scale, the cost per citizen is fractions of a cent.

---

## 💰 The Bottom Line

| Scenario | Monthly Cost | Status |
|:---|:---:|:---|
| **Tripoli Pilot** | **~€15** | ✅ Ready to Deploy |
| **Milan Launch** | **~€150** | 📈 Scalable |
| **Milan Saturation** | **~€400+** | 🚀 Enterprise Scale |

**We are ready.** The architecture is defined, the costs are modeled, and the technology is proven.
