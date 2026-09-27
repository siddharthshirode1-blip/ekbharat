# 🏛️ Government AI Data Intelligence Platform

Autonomous Data Intelligence & Natural Language Query Engine for cross-departmental government datasets. Bridges non-technical government officials with relational MySQL data via AI Text-to-SQL translation, SQL security auditing, provenance citation, and frontend visualization routing.

---

## 📌 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        1. DATA ETL & STORAGE LAYER                      │
│  • Parse Excel files in data/raw/                                       │
│  • Clean duplicate source/department records                            │
│  • Dynamically extract unique location combinations                     │
│  • Map text fields to Foreign Keys (department_id, scheme_id, location) │
│  • Populate local MySQL (government_ai)                                 │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        2. SECURITY & VALIDATION LAYER                   │
│  • Parse LLM-generated SQL statements                                   │
│  • Enforce strictly READ-ONLY restrictions (reject INSERT, UPDATE, DROP)│
│  • Block multi-statement chained injections                             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     3. REASONING & RESPONSE LAYER                       │
│  • Injects full schema metadata into LLM system prompts                 │
│  • Converts questions into optimized MySQL SELECT queries               │
│  • Executes verified queries & aggregates data payloads                 │
│  • Synthesizes human explanation with dataset provenance citations     │
│  • Routes structured JSON with recommended visualization types          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
government-ai/
├── data/
│   ├── raw/                 # Contains raw Excel files: projects.xlsx, departments.xlsx, etc.
│   ├── processed/           # Sanitized, deduplicated CSV exports
│   └── validation/          # Automated ETL audit logs and summary metrics
├── scripts/
│   ├── setup_db.sql         # Production MySQL DDL schema for government_ai
│   ├── etl_pipeline.py      # Automated deduplication, FK mapping, and population script
│   └── verify_db.py         # Integrity audit & cross-department intelligence discovery
├── ai_engine/
│   ├── __init__.py          # Package interface
│   ├── db_connector.py      # Connection manager (UNIX socket with TCP fallback)
│   ├── sql_validator.py     # Strict SQL security parser (READ-ONLY SELECT enforcement)
│   └── query_engine.py      # Natural Language -> Verified SQL -> Response & Viz router
├── test_query.py            # CLI test runner for natural language queries
├── test_sql_validator.py    # Unit tests for security validator
├── requirements.txt         # Python library dependencies
├── .env.example             # Template for database & AI credentials
├── .gitignore               # Protects .env credentials and caches
└── README.md                # Comprehensive documentation
```

---

## 💾 Database Schema (`government_ai`)

The relational model breaks departmental silos and connects initiatives across 7 tables:

1. **`data_sources`**: Master dataset register (`source_id` PK, `data_period`, `source_updated_date`, `official_source_url`).
2. **`departments`**: Government ministries & departments (`department_id` INT PK, `department_name` UNIQUE, `department_code`).
3. **`schemes`**: Government schemes (`scheme_id` INT PK, `department_id` FK, `source_id` FK).
4. **`locations`**: Spatial hierarchy (`location_id` INT PK, `state`, `district`, `taluka`, `village`, `latitude`, `longitude`).
5. **`projects`**: Concrete initiatives (`project_id` INT PK, `department_id` FK, `scheme_id` FK, `location_id` FK, `status`, `start_date`, `expected_completion_date`).
6. **`beneficiaries`**: Impact records (`beneficiary_record_id` INT PK, `project_id` FK, `scheme_id` FK, `beneficiary_count`, `beneficiary_category`).
7. **`financials`**: Fiscal allocations (`financial_id` INT PK, `project_id` FK, `scheme_id` FK, `budget_allocated`, `amount_released`, `amount_spent`).

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- Python 3.10+
- MySQL Server 8.0+

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure your credentials:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=government_ai

AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Initialize Database Schema
```bash
mysql -u root -p < scripts/setup_db.sql
```

### 5. Run Automated ETL Pipeline
Cleans and loads all 6 raw datasets into MySQL with full foreign key resolution:
```bash
python scripts/etl_pipeline.py
```

### 6. Verify Database & Cross-Department Overlaps
Executes data audits and demonstrates automated cross-department discovery:
```bash
python scripts/verify_db.py
```

---

## 🤖 Running the AI Query Engine

Run the interactive CLI query runner with natural language questions:

```bash
python test_query.py "Which villages have multiple departments active simultaneously?"
```

### Sample Output Payload:
```json
{
  "status": "success",
  "user_question": "Which villages have multiple departments active simultaneously?",
  "generated_sql": "SELECT l.village, COUNT(DISTINCT p.department_id) AS department_count, GROUP_CONCAT(DISTINCT d.department_name SEPARATOR ', ') AS active_departments FROM projects p JOIN locations l ON p.location_id = l.location_id JOIN departments d ON p.department_id = d.department_id GROUP BY l.village HAVING COUNT(DISTINCT p.department_id) > 1 ORDER BY department_count DESC LIMIT 20;",
  "data": [
    {
      "village": "Village-49",
      "department_count": 5,
      "active_departments": "Department of Agriculture, Department of Health and Family Welfare, Department of Rural Development, Department of School Education and Literacy, Department of Women and Child Development"
    },
    {
      "village": "Village-119",
      "department_count": 4,
      "active_departments": "Department of Drinking Water and Sanitation, Department of Health and Family Welfare, Department of Rural Development, Department of Women and Child Development"
    }
  ],
  "summary_text": "Identified 20 matching records for 'Which villages have multiple departments active simultaneously?'. Leading entries include: Village-49 (5); Village-119 (4); Village-135 (4).",
  "recommended_viz": "bar_chart"
}
```

### Supported Visualization Types:
- `kpi_card`: Single-value or headline aggregate metrics.
- `bar_chart`: Categorical rankings and department comparisons.
- `line_chart`: Time-series trends and financial year tracking.
- `map`: Geographic location points (`latitude`, `longitude`).
- `table`: Multi-attribute tabular data.

---

## 🔒 Security & Validation

Every query generated by an AI model must pass through `ai_engine/sql_validator.py`:
- **Read-Only Enforcement**: Queries must begin with `SELECT` or `WITH`.
- **Prohibited Keywords**: Rejects `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `GRANT`, `EXEC`, etc.
- **Injection Prevention**: Semicolon-chained multi-statements are strictly blocked.

Run unit tests:
```bash
python test_sql_validator.py
```

---

## 📦 Ready to Push to GitHub

```bash
git init
git add .
git commit -m "feat: complete government AI data intelligence platform backend"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```
