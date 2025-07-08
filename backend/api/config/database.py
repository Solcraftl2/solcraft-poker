# api/config/database.py
"""
Database configuration for SolCraft L2 backend.

This module now exposes a generic PostgreSQL connection helper using
``psycopg2`` instead of the Supabase client that was previously used.
The connection string is read from ``DATABASE_URL`` or ``POSTGRES_URL``
environment variables.
"""
import os
import logging
from typing import Optional

import psycopg2
from psycopg2.extensions import connection as PGConnection

logger = logging.getLogger(__name__)


class DatabaseConfig:
    """Simple container for a reusable PostgreSQL connection."""

    def __init__(self) -> None:
        # Connection string priority: DATABASE_URL, POSTGRES_URL, POSTGRES_URL_NON_POOLING
        self.database_url = (
            os.getenv("DATABASE_URL")
            or os.getenv("POSTGRES_URL")
            or os.getenv("POSTGRES_URL_NON_POOLING")
        )
        if not self.database_url:
            raise ValueError(
                "DATABASE_URL or POSTGRES_URL environment variable is required"
            )

        self._connection: Optional[PGConnection] = None

    @property
    def connection(self) -> PGConnection:
        """Return a psycopg2 connection, initializing it if necessary."""
        if self._connection is None or self._connection.closed != 0:
            try:
                self._connection = psycopg2.connect(self.database_url)
                self._connection.autocommit = True
                logger.info("PostgreSQL connection initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize PostgreSQL connection: {str(e)}")
                raise

        return self._connection

    def test_connection(self) -> bool:
        """Test the database connection with a simple query."""
        try:
            with self.connection.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {str(e)}")
            return False


# Global database instance
db_config = DatabaseConfig()


def get_db_connection() -> PGConnection:
    """Get the PostgreSQL connection instance."""
    return db_config.connection

