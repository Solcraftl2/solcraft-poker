# api/config/database.py
"""Database configuration for SolCraft L2 backend using PostgreSQL."""
import os
import logging
from typing import Optional

import psycopg2
from psycopg2.extras import RealDictCursor

logger = logging.getLogger(__name__)

class DatabaseConfig:
    """Simple PostgreSQL connection manager."""

    def __init__(self):
        # Connection URL can be provided via DATABASE_URL or POSTGRES_URL
        self.database_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
        self._connection: Optional[psycopg2.extensions.connection] = None

        if not self.database_url:
            raise ValueError("DATABASE_URL or POSTGRES_URL environment variable is required")
    
    @property
    def connection(self) -> psycopg2.extensions.connection:
        """Return a PostgreSQL connection, creating it if necessary."""
        if self._connection is None or self._connection.closed:
            try:
                self._connection = psycopg2.connect(self.database_url, cursor_factory=RealDictCursor)
                logger.info("PostgreSQL connection established")
            except Exception as e:
                logger.error(f"Failed to connect to PostgreSQL: {str(e)}")
                raise

        return self._connection
    
    def test_connection(self) -> bool:
        """Test database connection by performing a simple query."""
        try:
            with self.connection.cursor() as cur:
                cur.execute("SELECT 1;")
                cur.fetchone()
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {str(e)}")
            return False

# Global database instance
db_config = DatabaseConfig()

def get_db_connection() -> psycopg2.extensions.connection:
    """Get a PostgreSQL connection instance."""
    return db_config.connection

