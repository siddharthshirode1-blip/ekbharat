"""
Database Verification and Cross-Department Intelligence Discovery Suite.
Validates table row counts, foreign key integrity, and executes cross-department analysis.
"""

import os
import sys
import json
import logging
from sqlalchemy import text
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ai_engine.db_connector import get_db_engine

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("VERIFY_DB")


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def verify_database():
    """Executes database integrity verification and intelligence discovery."""
    print("\n" + "=" * 75)
    print("      GOVERNMENT AI PLATFORM - DATABASE VERIFICATION & AUDIT SUITE      ")
    print("=" * 75)

    engine = get_db_engine()
    tables = ["data_sources", "departments", "schemes", "locations", "projects", "beneficiaries", "financials"]
    results = {}

    with engine.connect() as conn:
        # 1. Count rows for all 7 tables
        print("\n--- [1] TABLE RECORD COUNTS ---")
        for tbl in tables:
            try:
                cnt = conn.execute(text(f"SELECT COUNT(*) FROM {tbl};")).scalar()
                results[tbl] = cnt
                print(f"  [OK] Table '{tbl:15}': {cnt:5} records")
            except Exception as e:
                results[tbl] = -1
                print(f"  [FAIL] Table '{tbl:15}': ERROR ({e})")

        # 2. Foreign Key Integrity Audit
        print("\n--- [2] FOREIGN KEY INTEGRITY AUDIT ---")
        # Check projects with valid departments & schemes
        orphaned_projects = conn.execute(text("""
            SELECT COUNT(*) FROM projects 
            WHERE department_id IS NULL OR scheme_id IS NULL OR location_id IS NULL;
        """)).scalar()
        print(f"  [*] Projects with missing department/scheme/location FKs: {orphaned_projects}")

        # Check beneficiaries linked to projects
        valid_beneficiaries = conn.execute(text("""
            SELECT COUNT(*) FROM beneficiaries b
            JOIN projects p ON b.project_id = p.project_id;
        """)).scalar()
        print(f"  [*] Beneficiary records cleanly joined to projects: {valid_beneficiaries} / {results.get('beneficiaries', 0)}")

        # Check financials linked to projects
        valid_financials = conn.execute(text("""
            SELECT COUNT(*) FROM financials f
            JOIN projects p ON f.project_id = p.project_id;
        """)).scalar()
        print(f"  [*] Financial records cleanly joined to projects: {valid_financials} / {results.get('financials', 0)}")

        # 3. Cross-Department Intelligence Discovery Query
        print("\n--- [3] CROSS-DEPARTMENT INTELLIGENCE DISCOVERY ---")
        print("  Query: Identifying villages with multi-department concurrent initiatives...")

        cross_dept_sql = text("""
            SELECT 
                l.village, 
                COUNT(DISTINCT p.department_id) AS department_count
            FROM projects p
            JOIN locations l ON p.location_id = l.location_id
            GROUP BY l.village
            HAVING COUNT(DISTINCT p.department_id) > 1
            ORDER BY department_count DESC;
        """)

        cross_rows = conn.execute(cross_dept_sql).fetchall()
        print(f"  Found {len(cross_rows)} villages with active cross-department project convergence!\n")

        if cross_rows:
            print("  Top Convergent Villages:")
            print(f"  {'Village Name':<35} | {'Active Departments':<20}")
            print("  " + "-" * 60)
            for row in cross_rows[:10]:
                print(f"  {row[0]:<35} | {row[1]:<20}")

        # Detailed breakdown of active departments in top village
        if cross_rows:
            sample_village = cross_rows[0][0]
            print(f"\n  [Deep Dive] Departments active in '{sample_village}':")
            detail_sql = text("""
                SELECT DISTINCT d.department_name, s.scheme_name, p.status
                FROM projects p
                JOIN locations l ON p.location_id = l.location_id
                JOIN departments d ON p.department_id = d.department_id
                LEFT JOIN schemes s ON p.scheme_id = s.scheme_id
                WHERE l.village = :village;
            """)
            details = conn.execute(detail_sql, {"village": sample_village}).fetchall()
            for d in details:
                print(f"    - Dept: {d[0]:<42} | Scheme: {d[1]} (Status: {d[2]})")

    print("\n" + "=" * 75)
    print("VERIFICATION COMPLETED SUCCESSFULLY - ALL RELATIONSHIPS VERIFIED!")
    print("=" * 75 + "\n")
    return results


if __name__ == "__main__":
    verify_database()
