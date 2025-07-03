# api/config/database.py
"""
Database configuration for SolCraft L2 backend.
"""
import os
from supabase import create_client, Client
from typing import Optional
import logging

logger = logging.getLogger(__name__)

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

