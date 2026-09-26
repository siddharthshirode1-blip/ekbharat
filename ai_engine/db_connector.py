"""
Database connection manager with UNIX socket support and automatic TCP fallback.
Handles MySQL connections for both SQLAlchemy and direct PyMySQL operations.
"""

import os
import logging
from decimal import Decimal
from datetime import date, datetime
import pymysql
from pymysql.cursors import DictCursor
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


class DatabaseConnector:
    """
    Manages robust MySQL database connections with socket & TCP fallback capabilities.
    """

    def __init__(self):
        self.host = os.getenv("DB_HOST", "127.0.0.1")
        self.port = int(os.getenv("DB_PORT", "3306"))
        self.user = os.getenv("DB_USER", "root")
        self.password = os.getenv("DB_PASSWORD", "root")
        self.db_name = os.getenv("DB_NAME", "government_ai")
        self.unix_socket = os.getenv("DB_SOCKET", "/var/run/mysqld/mysqld.sock")
        self._engine = None

    def get_raw_connection(self):
        """
        Creates a raw PyMySQL connection.
        Attempts UNIX socket connection first (if on Linux/Unix), then falls back to TCP host.
        """
        # Try UNIX socket if configured and exists on the filesystem
        if self.unix_socket and os.path.exists(self.unix_socket):
            try:
                conn = pymysql.connect(
                    user=self.user,
                    password=self.password,
                    database=self.db_name,
                    unix_socket=self.unix_socket,
                    charset="utf8mb4",
                    cursorclass=DictCursor,
                    autocommit=True
                )
                logger.info(f"Connected to MySQL via UNIX socket: {self.unix_socket}")
                return conn
            except Exception as e:
                logger.warning(f"UNIX socket connection failed ({e}). Falling back to TCP host {self.host}:{self.port}")

        # Fallback to standard TCP host
        try:
            conn = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.db_name,
                charset="utf8mb4",
                cursorclass=DictCursor,
                autocommit=True
            )
            logger.info(f"Connected to MySQL via TCP ({self.host}:{self.port}/{self.db_name})")
            return conn
        except pymysql.MySQLError as err:
            logger.error(f"MySQL connection error on {self.host}:{self.port}: {err}")
            raise

    def get_engine(self) -> Engine:
        """
        Creates and caches an SQLAlchemy Engine with socket fallback to TCP.
        """
        if self._engine is not None:
            return self._engine

        import urllib.parse

        # URL encode password for URI safety (especially for passwords with '@', ':', '/', etc.)
        encoded_password = urllib.parse.quote_plus(self.password)

        # Try socket if exists
        if self.unix_socket and os.path.exists(self.unix_socket):
            try:
                uri = f"mysql+pymysql://{self.user}:{encoded_password}@/{self.db_name}?unix_socket={self.unix_socket}&charset=utf8mb4"
                engine = create_engine(uri, pool_pre_ping=True, pool_recycle=3600)
                with engine.connect():
                    pass
                logger.info(f"SQLAlchemy engine initialized via UNIX socket ({self.unix_socket})")
                self._engine = engine
                return engine
            except Exception as e:
                logger.warning(f"SQLAlchemy socket initialization failed: {e}. Falling back to TCP.")

        # Fallback to TCP
        uri = f"mysql+pymysql://{self.user}:{encoded_password}@{self.host}:{self.port}/{self.db_name}?charset=utf8mb4"
        engine = create_engine(uri, pool_pre_ping=True, pool_recycle=3600)
        self._engine = engine
        logger.info(f"SQLAlchemy engine initialized via TCP ({self.host}:{self.port})")
        return engine

    def execute_query(self, sql_query: str, params=None) -> list:
        """
        Executes a SQL SELECT query and returns rows formatted as standard Python dicts,
        sanitizing Decimals, Dates, and Datetimes for clean JSON serialization.
        """
        conn = self.get_raw_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_query, params or ())
                rows = cursor.fetchall()

                # Clean types for JSON readiness
                cleaned_rows = []
                for row in rows:
                    cleaned = {}
                    for k, v in row.items():
                        if isinstance(v, Decimal):
                            cleaned[k] = float(v)
                        elif isinstance(v, (date, datetime)):
                            cleaned[k] = v.isoformat()
                        else:
                            cleaned[k] = v
                    cleaned_rows.append(cleaned)
                return cleaned_rows
        finally:
            conn.close()


# Module-level convenience singletons
_default_connector = DatabaseConnector()

def get_db_connection():
    return _default_connector.get_raw_connection()

def get_db_engine() -> Engine:
    return _default_connector.get_engine()

def execute_query(sql_query: str, params=None) -> list:
    return _default_connector.execute_query(sql_query, params)
