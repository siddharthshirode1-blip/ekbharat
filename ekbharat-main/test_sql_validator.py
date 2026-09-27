"""
Unit Tests for SQL Security Validator and AI Engine Components.
"""

import unittest
from ai_engine.sql_validator import validate_sql

class TestSQLValidator(unittest.TestCase):
    def test_valid_select(self):
        sql = "SELECT p.project_name, p.status FROM projects p WHERE p.status = 'COMPLETED';"
        self.assertTrue(validate_sql(sql))

    def test_valid_cte(self):
        sql = "WITH top_villages AS (SELECT village FROM locations) SELECT * FROM top_villages LIMIT 10;"
        self.assertTrue(validate_sql(sql))

    def test_reject_drop(self):
        with self.assertRaises(ValueError):
            validate_sql("DROP TABLE projects;")

    def test_reject_insert(self):
        with self.assertRaises(ValueError):
            validate_sql("INSERT INTO projects (project_name) VALUES ('Test');")

    def test_reject_delete(self):
        with self.assertRaises(ValueError):
            validate_sql("DELETE FROM projects WHERE project_id = 1;")

    def test_reject_update(self):
        with self.assertRaises(ValueError):
            validate_sql("UPDATE projects SET status = 'CANCELLED';")

    def test_reject_multi_statement(self):
        with self.assertRaises(ValueError):
            validate_sql("SELECT * FROM locations; DROP TABLE locations;")

    def test_reject_alter(self):
        with self.assertRaises(ValueError):
            validate_sql("ALTER TABLE locations ADD COLUMN test VARCHAR(10);")

    def test_reject_empty(self):
        with self.assertRaises(ValueError):
            validate_sql("")

if __name__ == "__main__":
    unittest.main()
