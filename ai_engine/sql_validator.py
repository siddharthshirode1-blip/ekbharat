"""
Strict SQL Security Parser and Validator.
Enforces READ-ONLY query execution and blocks injection or data-modifying queries.
"""

import re
import logging

logger = logging.getLogger(__name__)

# List of prohibited SQL keywords and dangerous phrases
FORBIDDEN_KEYWORDS = [
    r"\bINSERT\b",
    r"\bUPDATE\b",
    r"\bDELETE\b",
    r"\bDROP\b",
    r"\bALTER\b",
    r"\bTRUNCATE\b",
    r"\bGRANT\b",
    r"\bREVOKE\b",
    r"\bCREATE\b",
    r"\bREPLACE\b",
    r"\bEXEC\b",
    r"\bEXECUTE\b",
    r"\bCALL\b",
    r"\bLOCK\b",
    r"\bUNLOCK\b",
    r"\bRENAME\b",
    r"\bSET\b",
    r"\bINTO\s+OUTFILE\b",
    r"\bINTO\s+DUMPFILE\b",
    r"\bLOAD\s+DATA\b",
    r"\bSHUTDOWN\b",
]

# Allowed starting expressions for valid analytical queries
ALLOWED_STARTS = (r"^\s*SELECT\b", r"^\s*WITH\b", r"^\s*EXPLAIN\b")


def strip_sql_comments(sql_query: str) -> str:
    """Removes single-line and multi-line SQL comments."""
    # Remove /* ... */ comments
    sql = re.sub(r"/\*.*?\*/", "", sql_query, flags=re.DOTALL)
    # Remove -- and # single line comments
    sql = re.sub(r"(--|#).*$", "", sql, flags=re.MULTILINE)
    return sql.strip()


def validate_sql(sql_query: str) -> bool:
    """
    Validates that a SQL query is strictly safe and READ-ONLY.

    Args:
        sql_query: The SQL query string to inspect.

    Returns:
        True if the query passes all security checks.

    Raises:
        ValueError: If the query contains prohibited keywords, attempts multi-statement execution,
                    or is not a standard SELECT / CTE query.
    """
    if not sql_query or not sql_query.strip():
        raise ValueError("Security Violation: SQL query cannot be empty.")

    # 1. Clean query of comments
    cleaned = strip_sql_comments(sql_query)
    if not cleaned:
        raise ValueError("Security Violation: Query contains no executable SQL statements.")

    # 2. Prevent multi-statement execution (e.g. 'SELECT 1; DROP TABLE projects;')
    # Allow a single trailing semicolon, but disallow intermediate semicolons
    statements = [stmt.strip() for stmt in cleaned.split(";") if stmt.strip()]
    if len(statements) > 1:
        raise ValueError("Security Violation: Multi-statement execution (semicolon chained queries) is strictly prohibited.")

    executable_sql = statements[0]

    # 3. Check that the statement begins with an allowed read-only construct
    if not any(re.match(pattern, executable_sql, re.IGNORECASE) for pattern in ALLOWED_STARTS):
        raise ValueError("Security Violation: Only READ-ONLY statements (SELECT, WITH) are permitted.")

    # 4. Check for forbidden mutating keywords
    for pattern in FORBIDDEN_KEYWORDS:
        match = re.search(pattern, executable_sql, re.IGNORECASE)
        if match:
            forbidden_word = match.group(0).upper()
            raise ValueError(f"Security Violation: Query contains prohibited keyword '{forbidden_word}'. Only READ-ONLY SELECT queries are permitted.")

    return True
