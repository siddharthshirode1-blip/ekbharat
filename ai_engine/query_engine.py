"""
Autonomous Data Intelligence & Natural Language Query Engine for Cross-Departmental Government Datasets.
Translates everyday English questions into verified MySQL queries, executes them safely,
synthesizes human-readable insights with data provenance citations, and recommends frontend visualizations.
"""

import os
import re
import json
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

from .db_connector import execute_query
from .sql_validator import validate_sql

load_dotenv()
logger = logging.getLogger(__name__)

# Complete Schema Definition & Metadata Context injected into LLM System Prompt
SYSTEM_SCHEMA_PROMPT = """
You are the Text-to-SQL AI Engine for the "Government AI Data Intelligence Platform".
Your database is MySQL (database name: `government_ai`).

### DATABASE SCHEMA & TABLES:
1. `data_sources` (source_id VARCHAR(100) PK, dataset_name, ministry_name, department_name, official_source_url, data_period, source_updated_date, downloaded_date, original_file_name, file_format, description, notes)
2. `departments` (department_id INT AUTO_INCREMENT PK, department_name VARCHAR(200) UNIQUE, department_code, ministry_name)
3. `schemes` (scheme_id INT AUTO_INCREMENT PK, scheme_name, scheme_code, department_id INT FK->departments, scheme_type, description, source_id VARCHAR(100) FK->data_sources)
4. `locations` (location_id INT AUTO_INCREMENT PK, state, district, taluka, village, pincode, latitude DECIMAL, longitude DECIMAL, UNIQUE(state, district, taluka, village))
5. `projects` (project_id INT AUTO_INCREMENT PK, project_code, project_name, department_id INT FK->departments, scheme_id INT FK->schemes, location_id INT FK->locations, status ('PLANNED','ONGOING','COMPLETED','DELAYED','CANCELLED'), original_status, start_date DATE, expected_completion_date DATE, actual_completion_date DATE, last_updated DATE, source_id VARCHAR(100) FK->data_sources)
6. `beneficiaries` (beneficiary_record_id INT AUTO_INCREMENT PK, project_id INT FK->projects, scheme_id INT FK->schemes, location_id INT FK->locations, beneficiary_count INT, beneficiary_category, financial_year, source_id VARCHAR(100) FK->data_sources)
7. `financials` (financial_id INT AUTO_INCREMENT PK, project_id INT FK->projects, scheme_id INT FK->schemes, financial_year, budget_allocated DECIMAL, amount_released DECIMAL, amount_spent DECIMAL, source_id VARCHAR(100) FK->data_sources)

### CRITICAL RULES:
1. ONLY generate a single valid MySQL SELECT query. Do NOT generate INSERT, UPDATE, DELETE, DROP, or ALTER.
2. Join `data_sources` on `source_id` to fetch `data_period` and `source_updated_date` when provenance/citation is needed.
3. Cross-department queries: To find villages with multiple ministries/departments active, JOIN `projects` p with `locations` l and GROUP BY `l.village` or `l.location_id` HAVING COUNT(DISTINCT p.department_id) > 1.
4. Output ONLY the raw SQL query inside ```sql ... ``` code block or as plain text. No conversational banter before or after.
"""


class GovernmentAIEngine:
    """
    Main Autonomous Data Intelligence & Natural Language Query Engine.
    """

    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "gemini").lower()
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        self._gemini_client = None
        self._openai_client = None

        self._init_clients()

    def _init_clients(self):
        """Initializes API clients based on availability."""
        if self.gemini_key and self.provider == "gemini":
            try:
                from google import genai
                self._gemini_client = genai.Client(api_key=self.gemini_key)
                logger.info(f"Initialized Google GenAI client with model {self.gemini_model}")
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI: {e}")

        if self.openai_key and (self.provider == "openai" or not self._gemini_client):
            try:
                from openai import OpenAI
                self._openai_client = OpenAI(api_key=self.openai_key)
                logger.info(f"Initialized OpenAI client with model {self.openai_model}")
            except Exception as e:
                logger.warning(f"Could not initialize OpenAI client: {e}")

    def generate_sql(self, user_question: str) -> str:
        """
        Translates a natural language question into a verified MySQL SELECT statement.
        """
        prompt = f"{SYSTEM_SCHEMA_PROMPT}\n\nUser Question: {user_question}\nGenerate MySQL Query:"

        # Try Gemini
        if self._gemini_client:
            try:
                response = self._gemini_client.models.generate_content(
                    model=self.gemini_model,
                    contents=prompt,
                )
                raw_sql = self._extract_sql(response.text)
                if raw_sql:
                    return raw_sql
            except Exception as e:
                logger.warning(f"Gemini SQL generation error: {e}. Checking fallback.")

        # Try OpenAI
        if self._openai_client:
            try:
                response = self._openai_client.chat.completions.create(
                    model=self.openai_model,
                    messages=[
                        {"role": "system", "content": SYSTEM_SCHEMA_PROMPT},
                        {"role": "user", "content": f"Generate MySQL Query for: {user_question}"}
                    ],
                    temperature=0.0
                )
                raw_sql = self._extract_sql(response.choices[0].message.content)
                if raw_sql:
                    return raw_sql
            except Exception as e:
                logger.warning(f"OpenAI SQL generation error: {e}")

        # Intelligent Heuristic / Rule-based Fallback (Works offline without API key)
        return self._rule_based_sql_generator(user_question)

    def _extract_sql(self, text: str) -> str:
        """Extracts SQL query from LLM markdown response."""
        match = re.search(r"```(?:sql)?\s*(.*?)\s*```", text, flags=re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()
        cleaned = text.strip()
        if cleaned.upper().startswith("SELECT") or cleaned.upper().startswith("WITH"):
            return cleaned
        return cleaned

    def _rule_based_sql_generator(self, question: str) -> str:
        """
        Intelligent pattern-based SQL generator for common cross-departmental,
        financial, geographic, and beneficiary queries.
        """
        q = question.lower()

        # Cross department overlap / simultaneous projects
        if any(w in q for w in ["both road and water", "cross-department", "multiple department", "overlap", "active simultaneously"]):
            return (
                "SELECT l.village, "
                "COUNT(DISTINCT p.department_id) AS department_count, "
                "GROUP_CONCAT(DISTINCT d.department_name SEPARATOR ', ') AS active_departments "
                "FROM projects p "
                "JOIN locations l ON p.location_id = l.location_id "
                "JOIN departments d ON p.department_id = d.department_id "
                "GROUP BY l.village "
                "HAVING COUNT(DISTINCT p.department_id) > 1 "
                "ORDER BY department_count DESC LIMIT 20;"
            )

        # Beneficiaries by scheme / category
        if "beneficiar" in q or "bpl" in q:
            return (
                "SELECT s.scheme_name, b.beneficiary_category, "
                "SUM(b.beneficiary_count) AS total_beneficiaries, "
                "ds.data_period, ds.source_updated_date "
                "FROM beneficiaries b "
                "JOIN schemes s ON b.scheme_id = s.scheme_id "
                "LEFT JOIN data_sources ds ON b.source_id = ds.source_id "
                "GROUP BY s.scheme_name, b.beneficiary_category, ds.data_period, ds.source_updated_date "
                "ORDER BY total_beneficiaries DESC LIMIT 10;"
            )

        # Budget / expenditure by department / ministry
        if any(w in q for w in ["budget", "spent", "expenditure", "allocated", "released"]):
            return (
                "SELECT d.department_name, "
                "SUM(f.budget_allocated) AS total_allocated, "
                "SUM(f.amount_released) AS total_released, "
                "SUM(f.amount_spent) AS total_spent, "
                "ROUND((SUM(f.amount_spent) / NULLIF(SUM(f.budget_allocated), 0)) * 100, 2) AS utilization_rate_pct "
                "FROM financials f "
                "JOIN schemes s ON f.scheme_id = s.scheme_id "
                "JOIN departments d ON s.department_id = d.department_id "
                "GROUP BY d.department_name "
                "ORDER BY total_allocated DESC;"
            )

        # Projects status summary
        if "status" in q or "progress" in q or "completed" in q or "ongoing" in q:
            return (
                "SELECT p.status, COUNT(*) AS project_count "
                "FROM projects p "
                "GROUP BY p.status "
                "ORDER BY project_count DESC;"
            )

        # Default: Project count by department
        return (
            "SELECT d.department_name, COUNT(p.project_id) AS total_projects "
            "FROM departments d "
            "LEFT JOIN projects p ON d.department_id = p.department_id "
            "GROUP BY d.department_name "
            "ORDER BY total_projects DESC;"
        )

    def synthesize_response(self, user_question: str, generated_sql: str, data: List[Dict[str, Any]]) -> str:
        """
        Synthesizes a plain English explanation of query results with data provenance citations.
        """
        if not data:
            return "No records were found in the database matching your criteria."

        # Prompt for LLM synthesis
        synthesis_prompt = f"""
        User Question: {user_question}
        Executed SQL: {generated_sql}
        Query Results (First 10 rows): {json.dumps(data[:10], default=str)}
        Total rows returned: {len(data)}

        Instructions:
        1. Provide a direct, professional, plain English answer to the question based ONLY on the data.
        2. Explicitly cite the data period and source updated dates if present in the data or schema.
        3. Clarify that these figures represent official recorded administrative metrics.
        """

        # Try Gemini
        if self._gemini_client:
            try:
                res = self._gemini_client.models.generate_content(
                    model=self.gemini_model,
                    contents=synthesis_prompt,
                )
                if res.text:
                    return res.text.strip()
            except Exception as e:
                logger.warning(f"Gemini synthesis error: {e}")

        # Try OpenAI
        if self._openai_client:
            try:
                res = self._openai_client.chat.completions.create(
                    model=self.openai_model,
                    messages=[{"role": "user", "content": synthesis_prompt}],
                    temperature=0.3
                )
                return res.choices[0].message.content.strip()
            except Exception as e:
                logger.warning(f"OpenAI synthesis error: {e}")

        # Fallback offline synthesizer
        return self._offline_synthesize(user_question, data)

    def _offline_synthesize(self, user_question: str, data: List[Dict[str, Any]]) -> str:
        """Heuristic response synthesizer with provenance awareness."""
        count = len(data)
        sample = data[0]

        # Extract provenance if available in rows
        provenance = []
        if "data_period" in sample and sample["data_period"]:
            provenance.append(f"Reporting Period: {sample['data_period']}")
        if "source_updated_date" in sample and sample["source_updated_date"]:
            provenance.append(f"Official Source As-Of Date: {sample['source_updated_date']}")

        provenance_str = f" [Data Provenance: {', '.join(provenance)}]" if provenance else ""

        if count == 1:
            details = ", ".join([f"{k}: {v}" for k, v in sample.items()])
            return f"Query returned 1 result for '{user_question}': {details}.{provenance_str}"

        # Multiple rows summary
        keys = list(sample.keys())
        first_col = keys[0]
        second_col = keys[1] if len(keys) > 1 else keys[0]
        top_items = [f"{row.get(first_col)} ({row.get(second_col)})" for row in data[:3]]
        summary = f"Identified {count} matching records for '{user_question}'. Leading entries include: {'; '.join(top_items)}."
        return summary + provenance_str

    def recommend_visualization(self, data: List[Dict[str, Any]]) -> str:
        """
        Determines the most effective visualization type for frontend rendering:
        'kpi_card' | 'bar_chart' | 'line_chart' | 'map' | 'table'
        """
        if not data:
            return "table"

        sample = data[0]
        col_names = [c.lower() for c in sample.keys()]
        row_count = len(data)

        # 1. Geographic map detection
        if any("latitude" in c or "lat" == c for c in col_names) and any("longitude" in c or "lng" == c or "lon" in c for c in col_names):
            return "map"

        # 2. KPI Card (Single row with 1-3 metric values)
        if row_count == 1:
            numeric_cols = [k for k, v in sample.items() if isinstance(v, (int, float))]
            if len(numeric_cols) in (1, 2, 3):
                return "kpi_card"

        # 3. Time Series Line Chart
        time_indicators = ["year", "date", "month", "quarter", "fy", "financial_year"]
        if any(t in c for t in time_indicators for c in col_names):
            has_numeric = any(isinstance(v, (int, float)) for v in sample.values())
            if has_numeric and row_count >= 2:
                return "line_chart"

        # 4. Bar Chart (Categorical breakdown with 2-25 items)
        if 2 <= row_count <= 25:
            has_text = any(isinstance(v, str) for v in sample.values())
            has_numeric = any(isinstance(v, (int, float)) for v in sample.values())
            if has_text and has_numeric:
                return "bar_chart"

        # 5. Default Table
        return "table"

    def process_question(self, user_question: str) -> Dict[str, Any]:
        """
        End-to-End Query Pipeline:
        Natural Language -> Verified SQL -> MySQL Execution -> Synthesized Answer + Viz Type
        """
        logger.info(f"Processing user question: '{user_question}'")

        # 1. Generate SQL
        sql_query = self.generate_sql(user_question)
        logger.info(f"Generated SQL: {sql_query}")

        # 2. Validate SQL for security (read-only enforcement)
        try:
            validate_sql(sql_query)
        except ValueError as val_err:
            logger.error(f"SQL validation rejected query: {val_err}")
            return {
                "status": "error",
                "error_type": "SecurityValidationError",
                "user_question": user_question,
                "generated_sql": sql_query,
                "message": str(val_err)
            }

        # 3. Execute against MySQL
        try:
            data_rows = execute_query(sql_query)
        except Exception as exec_err:
            logger.error(f"Database execution failed: {exec_err}")
            return {
                "status": "error",
                "error_type": "DatabaseExecutionError",
                "user_question": user_question,
                "generated_sql": sql_query,
                "message": str(exec_err)
            }

        # 4. Synthesize human response with provenance
        summary_text = self.synthesize_response(user_question, sql_query, data_rows)

        # 5. Determine recommended frontend visualization
        recommended_viz = self.recommend_visualization(data_rows)

        return {
            "status": "success",
            "user_question": user_question,
            "generated_sql": sql_query,
            "data": data_rows,
            "summary_text": summary_text,
            "recommended_viz": recommended_viz
        }
