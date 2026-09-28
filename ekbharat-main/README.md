# 🇮🇳 EkBhaarat - Unified Government AI & Data Intelligence Platform

An open and intelligent platform that connects data across multiple government ministries (Education, Healthcare, Rural Development, Water & Sanitation, Infrastructure, and more) into a single unified system.

With **EkBhaarat**, officials and citizens can ask questions in plain English or Hindi, see interactive charts and maps, find overlapping government schemes, track fund utilization, and download open datasets in Excel or CSV.

---

## 🌟 Key Features

* 💬 **AI Query Studio:** Ask questions like *"Which districts have maximum funds spent on healthcare?"* and instantly get charts, tables, and AI explanations.
* 🗺️ **Interactive India Geospatial Map:** Live map showing state and district development indices, active schemes, and regional performance.
* 🔍 **Scheme Overlap Detector:** Identifies duplicate or overlapping initiatives across different ministries to prevent wasted funds.
* 💰 **Funds & DBT Tracking:** Real-time visibility into budget allocations, fund releases, and beneficiary reach across India.
* 📸 **Citizen Grievance & Proof Verification:** Citizens can submit complaints with photos of issues (e.g. broken roads or water supply). Admins can inspect and upload proof of resolution.
* 📥 **National Open Data Portal:** Free download of all clean Master Excel (`.xlsx`) and CSV datasets for citizens, researchers, and administrators.
* 🔒 **Role-Based Access (Admin & Citizen):**
  * **Citizens:** Explore data, query the AI, view maps, submit complaints, and download all datasets.
  * **Admins:** Sanction new schemes, register new project initiatives, and verify citizen complaints (with immutable audit history).

---

## 🏗️ How It Works (Architecture in Simple Terms)

```
[ Excel / CSV Master Datasets ]
               │
               ▼
[ Clean SQLite / MySQL Database ]
               │
               ▼
[ AI Engine (Natural Language -> Verified SQL) ]
               │
               ▼
[ Interactive Web Portal: Charts, Maps, Tables & Open Data ]
```

1. **Data Layer:** Combines data from 7+ central ministries (Schemes, Projects, Financials, Beneficiaries, Locations).
2. **AI Engine:** Converts user questions into secure, read-only SQL queries and produces instant Chart.js visualizations and summary reports.
3. **Web Dashboard:** A clean, accessible web interface compliant with Indian Government Web Guidelines (GIGW 3.0).

---

## 🚀 Quick Setup & Installation

### Step 1: Clone the Repository & Open Folder
```bash
git clone https://github.com/<your-username>/ekbharat.git
cd ekbharat
```

### Step 2: Install Dependencies
Make sure you have **Python 3.10+** installed. Then run:
```bash
pip install -r requirements.txt
```

### Step 3: (Optional) Set Up API Keys in `.env`
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Inside `.env`, configure your settings:
```env
# Database Settings
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=government_ai

# AI API Key (Optional: Has built-in offline smart fallback if omitted)
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 4: Run the Application
```bash
python app.py
```
Open your browser and visit:
👉 **`http://127.0.0.1:5000`**

---

## 👥 Demo Accounts

| Role | Username / Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Citizen (User)** | `rajesh.sharma@ekbharat.gov.in` | `Citizen@123` | AI Studio, Maps, Complaints, Open Data Downloads |
| **Citizen (User)** | `priya.patel@ekbharat.gov.in` | `Citizen@123` | AI Studio, Maps, Complaints, Open Data Downloads |
| **Administrator** | `admin@ekbharat.gov.in` | `Admin@2026` | Full Access + Master Data Ingestion & Resolution |

*(You can also click **Create Account** on the login page to register your own account).*

---

## 📊 Available Open Datasets

All datasets can be downloaded directly from the **Open Data Portal** (`data.html`):

| Dataset Name | Formats | Description |
| :--- | :--- | :--- |
| **National Infrastructure Projects** | `.xlsx`, `.csv` | 360+ road, railway, energy, and urban development projects |
| **Central Government Schemes** | `.xlsx`, `.csv` | 100+ welfare schemes across 7 ministries |
| **Direct Benefit Transfers (DBT)** | `.xlsx`, `.csv` | Beneficiary counts and categories across all states |
| **Ministry Financial Allocations** | `.xlsx`, `.csv` | Budgets allocated, funds released, and amounts spent |
| **Ministry & Department Master** | `.xlsx`, `.csv` | Central ministries and nodal departments |
| **Geospatial & District Directory**| `.csv` | State, district, taluka, and village coordinates |

---

## 🛡️ Security & Privacy

* **No Sensitive Data Stored:** Passwords and keys are never hard-coded in source files.
* **SQL Injection Protection:** The AI engine uses a strict read-only SQL validator (`ai_engine/sql_validator.py`) that blocks destructive operations like `DROP`, `DELETE`, `UPDATE`, or `INSERT`.
* **Append-Only Master Data:** Only authorized administrators can sanction new data entries, ensuring historic records remain tamper-proof.

---

## 💻 Tech Stack

* **Backend:** Python (Flask, SQLite3 / MySQL connector)
* **AI Engine:** Google Gemini API / Local Smart NLP Engine
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6+)
* **Mapping & Charts:** Leaflet.js, Chart.js, GeoJSON
* **Design:** High-contrast accessibility standards (GIGW 3.0), Dynamic text resizing (`A-`, `A`, `A+`)

---

## 📄 License

This project is created for public demonstration and open governance research. Distributed under the **MIT License**.
