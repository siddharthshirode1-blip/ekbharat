# 🇮🇳 EkBhaarat - National Governance Intelligence & Citizen Welfare Platform
> **Unified Cross-Ministry Analytics, AI Synthesis, Geospatial HeatMaps, DBT Tracking, and "Show Me The Proof" Citizen Grievance Redressal (CPGRAMS & GIGW 3.0 Compliant)**

---

## 📖 Table of Contents
1. [Overview](#-overview)
2. [What EkBhaarat Can Do (Core Features)](#-what-ekbhaarat-can-do-core-features)
3. [Module Breakdown & Capabilities](#-module-breakdown--capabilities)
4. [System Architecture](#-system-architecture)
5. [Privacy & Security Architecture](#-privacy--security-architecture)
6. [Tech Stack](#-tech-stack)
7. [Installation & Setup](#-installation--setup)
8. [Available User Accounts & Roles](#-available-user-accounts--roles)
9. [Open Datasets & Downloads](#-open-datasets--downloads)
10. [Compliance & Standards](#-compliance--standards)

---

## 🌟 Overview

**EkBhaarat** is a national-scale government intelligence platform designed to eliminate silos across Indian ministries (Education, Healthcare, Rural Development, Agriculture, Jal Shakti, Road Transport, and Women & Child Development). 

It bridges the gap between public administrators and citizens by providing:
- **For Citizens:** A single-window welfare hub to discover entitlements, track DBT payouts, report civic issues with photo evidence, and track on-ground repairs live like a food-delivery app.
- **For Administrators & Nodal Officers:** AI-driven Text-to-SQL analytics, cross-ministry budget convergence detection, GIS geospatial lag heatmaps, and evidence-verified grievance resolution tools.

---

## 🚀 What EkBhaarat Can Do (Core Features)

| Feature | Description | Key Modules |
| :--- | :--- | :--- |
| **🧠 Natural Language AI SQL Engine** | Type questions in plain English/Hindi; generates instant Chart.js graphs, tables, and downloadable audit reports. | `ai.html`, `app.py` |
| **🔍 Multi-Ministry Scheme Explorer** | Comprehensive details of 100+ welfare schemes across 7 ministries with village/district/city breakdown. | `schemes.html` |
| **🗺️ Geospatial Aspirational HeatMap** | Interactive Leaflet GIS map visualizing Poverty Index, Saturation Scores, and infrastructure lag tiers. | `map.html` |
| **⚡ Scheme Overlap & Convergence** | Identifies redundant spending across ministries and suggests NITI Aayog policy convergence to save public funds. | `overlap.html` |
| **💰 DBT Integrity & Fund Radar** | Real-time tracking of ₹14.8 Lakh Cr budget outlays, release tranches, expenditures, and 98.6% Aadhaar seed rates. | `beneficiaries.html` |
| **📸 "Show Me The Proof" Grievance System** | Citizens report damaged roads or water pipes with Before Photos; admins upload verified After Photos. | `complaints.html` |
| **🚀 Food-Delivery Style Stepper Tracker** | Live 5-step visual tracking (Lodged → Admin Review → Municipality → Work In Progress → Resolved). | `complaints.html` |
| **🏛️ Structured Admin Rejection Workflow** | Admins can formally disapprove issues with official reason codes and justification remarks visible to the citizen. | `complaints.html` |
| **🔒 Strict Multi-Tenant Data Privacy** | Citizens can only view and track their own private grievances. Cross-user access is intercepted and blocked. | `complaints.html`, `app.py` |
| **📰 Gazette & Upcoming Schemes** | Forward-looking gazette notices, policy roadmaps, and sanctioned project launches. | `updates.html` |
| **📥 National Open Data Repository** | 1-Click download of 7 Master Datasets in Excel (`.xlsx`), CSV, and complete ZIP package with SHA-256 hashes. | `data.html` |
| **👤 Dynamic Citizen & Admin Auth** | Login with any Gmail/custom email with automatic profile creation and individual database persistence. | `login.html`, `signup.html` |

---

## 📂 Module Breakdown & Capabilities

### 1. 🧠 AI Natural Language Governance Intelligence Studio (`ai.html`)
- Converts conversational queries into verified read-only SQLite SQL queries.
- Examples of queries it handles:
  - *"Which districts have maximum funds spent on healthcare?"*
  - *"Show delayed education projects in Uttar Pradesh"*
  - *"Which schemes have the highest budget allocation?"*
  - *"Find aspirational villages with high poverty index"*
- **Graphical Visualizations:** Dynamically generates Bar, Line, and Doughnut charts.
- **Export Capabilities:** 1-Click "Download Standalone HTML Report" with cryptographic timestamp and SHA-256 audit stamp, or "Open as New HTML Page".

### 2. 🔍 National Flagship Schemes Explorer (`schemes.html`)
- Complete repository of Central Sector and Centrally Sponsored Schemes.
- Detailed implementation drilldown:
  - **Village-Level:** Community tap pipelines (JJM), Gram Sadak road links (PMGSY), PMAY-G housing subsidies.
  - **City & District-Level:** Urban drainage, secondary healthcare hospitals, school smart-classrooms.
- Documents required, eligibility criteria, application steps, and DBT direct transfer modalities.

### 3. 🗺️ Interactive Geospatial India HeatMap (`map.html`)
- Interactive Leaflet.js map with state and district boundary polygon overlays.
- Computes **Lag Severity Scores** using poverty indices, project delay rates, and saturation levels.
- Classifies geographic units into:
  - 🔴 **Critical Need Tier** (Lag Score > 55)
  - 🟡 **Moderate Lag Tier** (Lag Score 35-55)
  - 🟢 **Well Saturated Tier** (Lag Score < 35)

### 4. ⚡ Scheme Overlap & Convergence Engine (`overlap.html`)
- Cross-references schemes across different departments that serve similar citizen segments.
- Detects overlaps between:
  - *Poshan Abhiyaan* (Women & Child Dev) & *PM-POSHAN / Mid-Day Meal* (School Education).
  - *Jal Jeevan Mission* (Jal Shakti) & *AMRUT 2.0* (Housing & Urban Affairs).
  - *PM-KISAN* (Agriculture) & *PM-KMY* (Farmer Pension).
- Highlights estimated duplicate beneficiaries and quantifiable budgetary savings (in ₹ Crores) upon administrative convergence.

### 5. 💰 DBT Fund Utilization & Direct Transfer Integrity (`beneficiaries.html`)
- Department-wise budget allocation, released funds, and ground expenditure metrics.
- Direct Benefit Transfer (DBT) integrity dashboard:
  - 98.6% Aadhaar Biometric Seeding Rate.
  - 99.4% Direct Bank Account Transfer Success Rate.
  - 14.2 Lakh Ghost Beneficiaries Purged.
  - ₹28,450 Cr Public Leakage Prevented.

### 6. 📸 "Show Me The Proof" Citizen Grievance & Live Tracker (`complaints.html`)
- **Citizens:** Report damaged roads, broken water supply lines, or dilapidated schools with photo proof.
- **Live 5-Step Status Stepper (Food-Delivery Style):**
  1. *Step 1:* Grievance Lodged & Photo Geo-Tagged
  2. *Step 2:* Central / District Admin Review & Verification
  3. *Step 3:* Work Order Forwarded to Local Municipality / ULB
  4. *Step 4:* On-Ground Municipal Field Work in Progress
  5. *Step 5:* Resolution Verified with "After" Photo Proof
- **Admin Disapproval with Reason Code:**
  - If rejected, admin selects an official reason (e.g. *Private Property / Outside Public Municipal Boundary*) and enters justification remarks.
  - The reasoning is displayed inside the citizen's tracking modal and account.
- **Resolution Verification:**
  - Once repaired, the Nodal Officer uploads the "After" photo and records the verified scheme fund deployed.

### 7. 📰 Future Updates & Gazette Notifications (`updates.html`)
- Track upcoming flagship policies, digital infrastructure rollouts, and renewable energy corridors.
- Search and filter gazette notices by category (Upcoming Schemes, Digital Infra, Green Energy, Agritech).

### 8. 📥 National Open Data Repository (`data.html`)
- Download 7 Master Clean Datasets in Excel (`.xlsx`) or CSV:
  - `projects.xlsx` / `projects_clean.csv` (362+ initiatives)
  - `schemes.xlsx` / `schemes_clean.csv` (100+ schemes)
  - `departments.xlsx` / `departments_clean.csv` (7 ministries)
  - `beneficiaries.xlsx` / `beneficiaries_clean.csv` (94.2 Cr reach)
  - `financials.xlsx` / `financials_clean.csv` (₹14.8 Lakh Cr outlay)
  - `locations_clean.csv` (700+ districts and villages)
  - `data_sources_clean.csv` (Provenance metadata)
- 1-Click **"Download All Master Datasets (ZIP)"** button.

---

## 🔒 Privacy & Security Architecture

1. **Multi-Tenant Data Isolation:**
   - Every complaint record stores `user_id` and `citizen_email`.
   - SQL queries on `/api/complaints` filter strictly:
     ```sql
     SELECT * FROM complaints WHERE user_id = ? OR citizen_email = ? ORDER BY date_submitted DESC
     ```
   - Regular citizens can only see and track tickets filed under their own account.
2. **Access-Denied Interception:**
   - If Citizen B tries to search or track Citizen A's ticket ID:
     > 🔒 *Access Denied: Ticket is private to another citizen. For privacy protection, you can only track your own registered grievances.*
3. **Role-Based Permissions (RBAC):**
   - Approval, rejection, and resolution actions are restricted to Nodal Administrators (`role === 'admin'`). Unauthorized citizen requests return `403 Forbidden`.
4. **Public Data Anonymization:**
   - Public inspection lists display only resolved issues with citizen personal names masked as `"Citizen (Verified)"`.

---

## 💻 Tech Stack

- **Frontend:** Pure Vanilla HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid, Glassmorphism, Micro-Animations), Vanilla JavaScript (ES6+).
- **Backend:** Python 3.10+ with Flask REST API framework.
- **Database:** Relational SQLite (`ekbharat.db`) with foreign keys, indexes, and full integrity constraints.
- **Mapping & Charts:** Leaflet.js GIS map engine and Chart.js 4.4+.
- **Typography & Standards:** Plus Jakarta Sans & Merriweather (Google Fonts), GIGW 3.0, WCAG 2.1 AA compliant.

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Python 3.10 or higher installed.

### 2. Run the Application
In your terminal, navigate to the project root and execute:

```bash
# Step 1: Install Python dependencies
pip install -r requirements.txt

# Step 2: Initialize Database (if needed)
python database.py

# Step 3: Start the Web Server
python app.py
```

### 3. Open in Browser
Visit **`http://127.0.0.1:5000`** in any web browser.

---

## 👥 Available User Accounts & Roles

You can sign in with **any personal Gmail or custom email address** on the Login page (an individual citizen account is created automatically), or use one of the pre-configured demo profiles:

| Account | Email | Password | Role | Features & Access |
| :--- | :--- | :--- | :--- | :--- |
| **👨‍🌾 Rahul Sharma** | `rahul.sharma@ekbharat.gov.in` | `citizen123` | Citizen | Farmer beneficiary from Varanasi, UP. Views 3 personal UP tickets. |
| **👩‍⚕️ Priya Patel** | `priya.patel@ekbharat.gov.in` | `citizen123` | Citizen | Healthcare worker from Mehsana, GJ. Views 2 personal Gujarat tickets. |
| **🏛️ Dr. Rajesh Varma** | `admin.nodal@ekbharat.gov.in` | `admin123` | Nodal Officer (Admin) | Central Nodal Officer (NITI Aayog). Full district queue moderation, approval/rejection forms, resolution proof upload. |
| **👤 Your Custom Email** | `yourname@gmail.com` | *(Any)* | Citizen | Your own private profile, clean grievance queue, and personal welfare hub. |

---

## 📜 Compliance & Standards

- **GIGW 3.0:** Compliant with *Guidelines for Indian Government Websites 3.0*.
- **WCAG 2.1 AA:** Accessible typography resizer (`A-`, `A`, `A+`), high-contrast color palette, and full keyboard navigation.
- **NDSAP / OGD:** Open Government Data standard compliance with cryptographic SHA-256 data lineage.
- **CPGRAMS:** Centralized Public Grievance Redress And Monitoring System workflow compliance.

---
*© 2026 EkBhaarat. Designed & Developed for Transparent Governance & Citizen Empowerment.*
