"""
Automated Robust ETL Pipeline for Government AI Data Intelligence Platform.
Extracts Excel files from data/raw/, cleans and deduplicates, maps foreign keys,
and loads relational datasets into the MySQL 'government_ai' database.
"""

import os
import sys
import json
import logging
from datetime import datetime
import pandas as pd
from sqlalchemy import text
from dotenv import load_dotenv

# Ensure root directory is on python path so we can import ai_engine
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ai_engine.db_connector import get_db_engine

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("ETL_PIPELINE")

RAW_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "raw"))
PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "processed"))
VALIDATION_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "validation"))

os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(VALIDATION_DIR, exist_ok=True)


def locate_file(standard_name: str, fallback_candidates: list) -> str:
    """Finds file either by standard name or fallback candidate name in data/raw or workspace root."""
    paths_to_check = [
        os.path.join(RAW_DIR, standard_name),
        os.path.join(RAW_DIR, fallback_candidates[0] if fallback_candidates else standard_name),
    ]
    # Also check workspace root
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    paths_to_check.append(os.path.join(root_dir, standard_name))
    if fallback_candidates:
        for c in fallback_candidates:
            paths_to_check.append(os.path.join(root_dir, c))

    for p in paths_to_check:
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f"Could not locate raw data file for {standard_name}. Checked: {paths_to_check}")


def parse_date(val):
    """Safely converts timestamps or strings to YYYY-MM-DD or None."""
    if pd.isna(val) or val is None or str(val).strip() in ("", "NaT", "nan", "None"):
        return None
    try:
        dt = pd.to_datetime(val)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return None


def standardize_status(status_str: str) -> str:
    """Normalizes project status into standardized categories."""
    if pd.isna(status_str) or not status_str:
        return "UNKNOWN"
    s = str(status_str).strip().upper()
    if "COMPLET" in s:
        return "COMPLETED"
    if "ONGOING" in s or "PROGRESS" in s or "ACTIVE" in s:
        return "ONGOING"
    if "DELAY" in s:
        return "DELAYED"
    if "PLAN" in s or "SANCTION" in s or "PROPOSE" in s:
        return "PLANNED"
    if "CANCEL" in s or "TERMINAT" in s:
        return "CANCELLED"
    return s[:50]


def run_etl():
    """Main ETL orchestration function."""
    logger.info("=" * 70)
    logger.info("STARTING GOVERNMENT AI DATA ETL PIPELINE")
    logger.info("=" * 70)

    engine = get_db_engine()
    summary_report = {
        "execution_timestamp": datetime.now().isoformat(),
        "tables_loaded": {},
        "status": "in_progress"
    }

    with engine.begin() as conn:
        logger.info("Verifying database schema connection...")
        conn.execute(text("CREATE DATABASE IF NOT EXISTS government_ai;"))
        conn.execute(text("USE government_ai;"))

        # Clean existing records in reverse dependency order
        logger.info("Cleaning existing table records for fresh ETL load...")
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        for tbl in ["financials", "beneficiaries", "projects", "schemes", "locations", "departments", "data_sources"]:
            conn.execute(text(f"TRUNCATE TABLE {tbl};"))
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))

        # ----------------------------------------------------------------------
        # 1. DATA SOURCES
        # ----------------------------------------------------------------------
        logger.info("--> [1/7] Ingesting Data Sources...")
        src_file = locate_file("source.xlsx", ["Gov_Projects_Source_Metadata.xlsx"])
        df_src = pd.read_excel(src_file)
        logger.info(f"Loaded {len(df_src)} raw records from {os.path.basename(src_file)}")

        df_src_clean = df_src.drop_duplicates(subset=["source_id"]).copy()
        for col in ["source_updated_date", "downloaded_date"]:
            if col in df_src_clean.columns:
                df_src_clean[col] = df_src_clean[col].apply(lambda x: str(x) if pd.notna(x) else None)

        # Select only required columns
        valid_src_cols = [
            "source_id", "dataset_name", "ministry_name", "department_name",
            "official_source_url", "data_period", "source_updated_date",
            "downloaded_date", "original_file_name", "file_format", "description", "notes"
        ]
        df_src_clean = df_src_clean[[c for c in valid_src_cols if c in df_src_clean.columns]]
        df_src_clean.to_sql("data_sources", con=conn, if_exists="append", index=False)
        df_src_clean.to_csv(os.path.join(PROCESSED_DIR, "data_sources_clean.csv"), index=False)
        logger.info(f"Loaded {len(df_src_clean)} unique data sources into MySQL.")
        summary_report["tables_loaded"]["data_sources"] = len(df_src_clean)

        # ----------------------------------------------------------------------
        # 2. DEPARTMENTS
        # ----------------------------------------------------------------------
        logger.info("--> [2/7] Ingesting Departments...")
        dept_file = locate_file("departments.xlsx", ["Gov_Departments_Master_Data.xlsx"])
        df_dept = pd.read_excel(dept_file)
        logger.info(f"Loaded {len(df_dept)} raw records from {os.path.basename(dept_file)}")

        df_dept_clean = df_dept.drop_duplicates(subset=["department_name"]).copy()
        # Drop raw department_id string if present to allow MySQL auto-increment integer PK
        # Use pd.api.types.is_string_dtype for reliable detection in all pandas versions
        if "department_id" in df_dept_clean.columns and (
            pd.api.types.is_string_dtype(df_dept_clean["department_id"])
            or df_dept_clean["department_id"].apply(lambda x: isinstance(x, str)).any()
        ):
            raw_dept_code_map = dict(zip(df_dept_clean["department_id"], df_dept_clean["department_name"]))
            df_dept_clean_insert = df_dept_clean.drop(columns=["department_id"])
        else:
            raw_dept_code_map = {}
            df_dept_clean_insert = df_dept_clean

        df_dept_clean_insert.to_sql("departments", con=conn, if_exists="append", index=False)
        df_dept_clean.to_csv(os.path.join(PROCESSED_DIR, "departments_clean.csv"), index=False)

        # Retrieve DB assigned integer IDs
        dept_records = conn.execute(text("SELECT department_id, department_name, department_code FROM departments;")).fetchall()
        dept_name_to_id = {row[1]: row[0] for row in dept_records}
        dept_code_to_id = {row[2]: row[0] for row in dept_records if row[2]}
        logger.info(f"Loaded {len(dept_records)} departments into MySQL.")
        summary_report["tables_loaded"]["departments"] = len(dept_records)

        # ----------------------------------------------------------------------
        # 3. LOCATIONS (Dynamically extracted from projects.xlsx)
        # ----------------------------------------------------------------------
        logger.info("--> [3/7] Dynamically Extracting Locations from Projects...")
        proj_file = locate_file("projects.xlsx", ["Comprehensive_Gov_Projects_Data (1).xlsx"])
        df_prj_raw = pd.read_excel(proj_file)
        logger.info(f"Loaded {len(df_prj_raw)} raw projects to parse locations.")

        loc_cols = ["state", "district", "taluka", "village"]
        df_locs = df_prj_raw[loc_cols + [c for c in ["latitude", "longitude", "pincode"] if c in df_prj_raw.columns]].copy()
        df_locs = df_locs.dropna(subset=["state", "district"]).drop_duplicates(subset=loc_cols)
        df_locs["taluka"] = df_locs["taluka"].fillna("Not Specified")
        df_locs["village"] = df_locs["village"].fillna("Not Specified")

        df_locs.to_sql("locations", con=conn, if_exists="append", index=False)
        pd.DataFrame(df_locs).to_csv(os.path.join(PROCESSED_DIR, "locations_clean.csv"), index=False)

        loc_records = conn.execute(text("SELECT location_id, state, district, taluka, village FROM locations;")).fetchall()
        loc_key_to_id = {(r[1], r[2], r[3], r[4]): r[0] for r in loc_records}
        logger.info(f"Extracted and populated {len(loc_records)} unique geographic locations.")
        summary_report["tables_loaded"]["locations"] = len(loc_records)

        # ----------------------------------------------------------------------
        # 4. SCHEMES
        # ----------------------------------------------------------------------
        logger.info("--> [4/7] Ingesting Schemes with Flexible Department Mapping...")
        sch_file = locate_file("schemes.xlsx", ["Gov_Schemes_Master_Data.xlsx"])
        df_sch = pd.read_excel(sch_file)
        logger.info(f"Loaded {len(df_sch)} raw schemes from {os.path.basename(sch_file)}")

        df_sch_clean = df_sch.drop_duplicates(subset=["scheme_name"]).copy()
        raw_sch_id_to_name = dict(zip(df_sch_clean["scheme_id"], df_sch_clean["scheme_name"]))

        # Map department_id to integer FK
        mapped_dept_ids = []
        for idx, row in df_sch_clean.iterrows():
            d_val = row.get("department_name") or row.get("department_id") or row.get("department_code")
            dep_id = None
            if d_val in dept_name_to_id:
                dep_id = dept_name_to_id[d_val]
            elif d_val in dept_code_to_id:
                dep_id = dept_code_to_id[d_val]
            elif d_val in raw_dept_code_map and raw_dept_code_map[d_val] in dept_name_to_id:
                dep_id = dept_name_to_id[raw_dept_code_map[d_val]]
            mapped_dept_ids.append(dep_id)

        df_sch_clean["department_id"] = mapped_dept_ids
        df_sch_insert = df_sch_clean.drop(columns=["scheme_id", "start_date", "end_date"], errors="ignore")
        df_sch_insert.to_sql("schemes", con=conn, if_exists="append", index=False)
        pd.DataFrame(df_sch_clean).to_csv(os.path.join(PROCESSED_DIR, "schemes_clean.csv"), index=False)

        sch_records = conn.execute(text("SELECT scheme_id, scheme_name, scheme_code FROM schemes;")).fetchall()
        sch_name_to_id = {r[1]: r[0] for r in sch_records}
        sch_code_to_id = {r[2]: r[0] for r in sch_records if r[2]}
        logger.info(f"Populated {len(sch_records)} schemes linked to departments.")
        summary_report["tables_loaded"]["schemes"] = len(sch_records)

        # ----------------------------------------------------------------------
        # 5. PROJECTS
        # ----------------------------------------------------------------------
        logger.info("--> [5/7] Ingesting Projects with Foreign Key Resolution...")
        df_projects = df_prj_raw.copy()

        # Map department_id
        df_projects["department_id"] = df_projects["department_name"].map(dept_name_to_id)

        # Map scheme_id (try scheme_name then scheme_code)
        df_projects["scheme_id"] = df_projects["scheme_name"].map(sch_name_to_id)
        missing_sch = df_projects["scheme_id"].isna()
        if missing_sch.any() and "scheme_code" in df_projects.columns:
            df_projects.loc[missing_sch, "scheme_id"] = df_projects.loc[missing_sch, "scheme_code"].map(sch_code_to_id)

        # Map location_id
        def get_loc_id(row):
            key = (
                str(row.get("state", "")),
                str(row.get("district", "")),
                str(row.get("taluka", "Not Specified")),
                str(row.get("village", "Not Specified"))
            )
            return loc_key_to_id.get(key)

        df_projects["location_id"] = df_projects.apply(get_loc_id, axis=1)

        # Status standardization
        df_projects["original_status"] = df_projects["status"]
        df_projects["status"] = df_projects["status"].apply(standardize_status)

        # Dates formatting
        for dcol in ["start_date", "expected_completion_date", "actual_completion_date", "last_updated"]:
            if dcol in df_projects.columns:
                df_projects[dcol] = df_projects[dcol].apply(parse_date)

        # Retain original raw project_id (e.g. 'PRJ-00001') for mapping financials & beneficiaries
        raw_prj_ids = df_projects["project_id"].copy()

        proj_insert_cols = [
            "project_code", "project_name", "department_id", "scheme_id",
            "location_id", "status", "original_status", "start_date",
            "expected_completion_date", "actual_completion_date", "last_updated", "source_id"
        ]
        df_projects_insert = df_projects[[c for c in proj_insert_cols if c in df_projects.columns]].copy()
        df_projects_insert.to_sql("projects", con=conn, if_exists="append", index=False)
        pd.DataFrame(df_projects).to_csv(os.path.join(PROCESSED_DIR, "projects_clean.csv"), index=False)

        # Build mapping from raw project_id string & project_code to DB auto_increment project_id
        db_projects = conn.execute(text("SELECT project_id, project_code, project_name FROM projects;")).fetchall()
        # Link raw project_id (row index alignment)
        raw_prj_id_to_db_id = {}
        for idx, r_id in enumerate(raw_prj_ids):
            if idx < len(db_projects):
                raw_prj_id_to_db_id[r_id] = db_projects[idx][0]

        logger.info(f"Populated {len(db_projects)} projects with full foreign keys.")
        summary_report["tables_loaded"]["projects"] = len(db_projects)

        # ----------------------------------------------------------------------
        # 6. BENEFICIARIES
        # ----------------------------------------------------------------------
        logger.info("--> [6/7] Ingesting Beneficiaries...")
        ben_file = locate_file("beneficiaries.xlsx", ["Gov_Beneficiaries_Master_Data.xlsx"])
        df_ben = pd.read_excel(ben_file)
        logger.info(f"Loaded {len(df_ben)} raw beneficiary records from {os.path.basename(ben_file)}")

        df_ben_clean = df_ben.copy()
        # Map project_id (raw 'PRJ-00001' -> DB integer project_id)
        df_ben_clean["db_project_id"] = df_ben_clean["project_id"].map(raw_prj_id_to_db_id)

        # Map scheme_id (raw 'SCH-001' -> scheme_name -> DB integer scheme_id)
        df_ben_clean["db_scheme_id"] = df_ben_clean["scheme_id"].map(
            lambda s: sch_name_to_id.get(raw_sch_id_to_name.get(s)) or sch_code_to_id.get(s)
        )

        # Derive location_id from project's location
        prj_to_loc = dict(zip(df_projects["project_id"], df_projects["location_id"]))
        df_ben_clean["db_location_id"] = df_ben_clean["project_id"].map(prj_to_loc)

        ben_insert_df = pd.DataFrame({
            "project_id": df_ben_clean["db_project_id"],
            "scheme_id": df_ben_clean["db_scheme_id"],
            "location_id": df_ben_clean["db_location_id"],
            "beneficiary_count": df_ben_clean["beneficiary_count"].fillna(0).astype(int),
            "beneficiary_category": df_ben_clean["beneficiary_category"],
            "financial_year": df_ben_clean["financial_year"],
            "source_id": df_ben_clean["source_id"]
        })

        ben_insert_df.to_sql("beneficiaries", con=conn, if_exists="append", index=False)
        pd.DataFrame(ben_insert_df).to_csv(os.path.join(PROCESSED_DIR, "beneficiaries_clean.csv"), index=False)
        logger.info(f"Populated {len(ben_insert_df)} beneficiary records.")
        summary_report["tables_loaded"]["beneficiaries"] = len(ben_insert_df)

        # ----------------------------------------------------------------------
        # 7. FINANCIALS
        # ----------------------------------------------------------------------
        logger.info("--> [7/7] Ingesting Financials...")
        fin_file = locate_file("financials.xlsx", ["Gov_Financials_Master_Data.xlsx"])
        df_fin = pd.read_excel(fin_file)
        logger.info(f"Loaded {len(df_fin)} raw financial records from {os.path.basename(fin_file)}")

        df_fin_clean = df_fin.copy()
        df_fin_clean["db_project_id"] = df_fin_clean["project_id"].map(raw_prj_id_to_db_id)
        df_fin_clean["db_scheme_id"] = df_fin_clean["scheme_id"].map(
            lambda s: sch_name_to_id.get(raw_sch_id_to_name.get(s)) or sch_code_to_id.get(s)
        )

        fin_insert_df = pd.DataFrame({
            "project_id": df_fin_clean["db_project_id"],
            "scheme_id": df_fin_clean["db_scheme_id"],
            "financial_year": df_fin_clean["financial_year"],
            "budget_allocated": df_fin_clean["budget_allocated"].fillna(0.0),
            "amount_released": df_fin_clean["amount_released"].fillna(0.0),
            "amount_spent": df_fin_clean["amount_spent"].fillna(0.0),
            "source_id": df_fin_clean["source_id"]
        })

        fin_insert_df.to_sql("financials", con=conn, if_exists="append", index=False)
        pd.DataFrame(fin_insert_df).to_csv(os.path.join(PROCESSED_DIR, "financials_clean.csv"), index=False)
        logger.info(f"Populated {len(fin_insert_df)} financial budget records.")
        summary_report["tables_loaded"]["financials"] = len(fin_insert_df)

    summary_report["status"] = "success"
    with open(os.path.join(VALIDATION_DIR, "etl_summary.json"), "w") as f:
        json.dump(summary_report, f, indent=2)

    logger.info("=" * 70)
    logger.info("ETL PIPELINE COMPLETED SUCCESSFULLY!")
    for tbl, count in summary_report["tables_loaded"].items():
        logger.info(f" -> Table '{tbl}': {count} rows inserted.")
    logger.info(f"Validation report saved to: {os.path.join(VALIDATION_DIR, 'etl_summary.json')}")
    logger.info("=" * 70)
    return summary_report


if __name__ == "__main__":
    run_etl()
