# api/config/database.py
"""
Database configuration for SolCraft L2 backend.
"""
import os
import logging
from typing import Optional
import psycopg2
from psycopg2.extras import register_uuid
import traceback
from supabase import create_client, Client

logger = logging.getLogger(__name__)

# PostgreSQL environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
POSTGRES_URL = os.getenv("POSTGRES_URL")
POSTGRES_URL_NON_POOLING = os.getenv("POSTGRES_URL_NON_POOLING")

# Register UUID adapter for psycopg2
register_uuid()

class DatabaseConfig:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self._client: Optional[Client] = None
        
        if not self.supabase_url:
            raise ValueError("SUPABASE_URL environment variable is required")
        
        if not self.supabase_key:
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY environment variable is required")
    
    @property
    def client(self) -> Client:
        """Get Supabase client instance."""
        if self._client is None:
            try:
                self._client = create_client(self.supabase_url, self.supabase_key)
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {str(e)}")
                raise
        
        return self._client
    
    def test_connection(self) -> bool:
        """Test database connection."""
        try:
            # Test connection with a simple query
            response = self.client.table("tournaments").select("id").limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {str(e)}")
            return False

# Global database instance
db_config = DatabaseConfig()

def get_supabase_client() -> Client:
    """Get the Supabase client instance."""
    return db_config.client


def get_db_connection():
    """Create a PostgreSQL connection using environment variables."""
    logger.info("Tentativo di connessione al database PostgreSQL...")

    try:
        connection_string = None
        connection_type = None

        if POSTGRES_URL_NON_POOLING:
            connection_string = POSTGRES_URL_NON_POOLING
            connection_type = "POSTGRES_URL_NON_POOLING"
        elif POSTGRES_URL:
            connection_string = POSTGRES_URL
            connection_type = "POSTGRES_URL"
        elif DATABASE_URL:
            connection_string = DATABASE_URL
            connection_type = "DATABASE_URL"

        if not connection_string:
            logger.error("Nessuna stringa di connessione disponibile")
            return None

        if connection_string.startswith("postgresql://"):
            connection_string = "postgres://" + connection_string[14:]

        if "?" not in connection_string:
            connection_string += "?sslmode=disable"
        elif "sslmode=" not in connection_string:
            connection_string += "&sslmode=disable"
        else:
            import re
            connection_string = re.sub(r"sslmode=\w+", "sslmode=disable", connection_string)

        logger.info(f"Tentativo di connessione con: {connection_type} - {connection_string[:20]}...")

        conn = psycopg2.connect(
            connection_string,
            connect_timeout=60,
            application_name="solcraft-backend",
        )
        conn.autocommit = True
        logger.info("Connessione al database riuscita")
        return conn
    except Exception as e:
        logger.error(f"Errore connessione al database: {str(e)}")
        logger.error(traceback.format_exc())
        return None


