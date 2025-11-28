# ⚡ Quick Start: GCP Proposal

Welcome to the Mshkltk GCP Migration Proposal. This folder contains everything you need to understand how we plan to host and scale the application.

## 📂 Document Map

| File | Who is it for? | What's inside? |
|:---|:---|:---|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | 🛠️ Engineers & Architects | Technical deep-dive: Cloud Run, Cloud SQL, Security, CI/CD. |
| **[COST_ANALYSIS.md](./COST_ANALYSIS.md)** | 💰 Finance & Managers | Cost models for Tripoli vs Milan (Conservative/Realistic/Ambitious). |
| **[INTARGET_PITCH.md](./INTARGET_PITCH.md)** | 👔 Executives & Partners | High-level business narrative and rollout strategy. |
| **[README.md](./README.md)** | 📖 Everyone | Overview of the proposal and current status. |

## 🚀 How to use these docs

1.  **Start with [INTARGET_PITCH.md](./INTARGET_PITCH.md)** to get the big picture.
2.  **Check [COST_ANALYSIS.md](./COST_ANALYSIS.md)** to see the numbers.
3.  **Read [ARCHITECTURE.md](./ARCHITECTURE.md)** to understand the "How".

## ❓ Key Decisions Made

*   **Compute:** We chose **Cloud Run** (Containers) over Cloud Functions (FaaS) to avoid rewriting the backend.
*   **Database:** We chose **Cloud SQL (PostgreSQL)** to match our local development environment.
*   **Maps:** We are using **Google Maps Platform** but with strict caching strategies to control costs.
