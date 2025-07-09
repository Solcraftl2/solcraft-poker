# api/config/database.py
"""
Database configuration for SolCraft L2 backend - Firebase Integration.
"""
import os
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, firestore, auth
from google.cloud.firestore import Client as FirestoreClient

logger = logging.getLogger(__name__)

class FirebaseConfig:
    def __init__(self):
        self.project_id = os.getenv("FIREBASE_PROJECT_ID")
        self.private_key_id = os.getenv("FIREBASE_PRIVATE_KEY_ID")
        self.private_key = os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n')
        self.client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
        self.client_id = os.getenv("FIREBASE_CLIENT_ID")
        self.auth_uri = os.getenv("FIREBASE_AUTH_URI", "https://accounts.google.com/o/oauth2/auth")
        self.token_uri = os.getenv("FIREBASE_TOKEN_URI", "https://oauth2.googleapis.com/token")
        self.client_cert_url = os.getenv("FIREBASE_CLIENT_CERT_URL")
        
        self._db: Optional[FirestoreClient] = None
        self._app = None
        
        # Validate required environment variables
        required_vars = [
            "FIREBASE_PROJECT_ID", "FIREBASE_PRIVATE_KEY_ID", 
            "FIREBASE_PRIVATE_KEY", "FIREBASE_CLIENT_EMAIL", "FIREBASE_CLIENT_ID"
        ]
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        if missing_vars:
            logger.warning(f"Missing Firebase environment variables: {missing_vars}")
            logger.info("Using Firebase emulator or default credentials")
    
    @property
    def db(self) -> FirestoreClient:
        """Get Firestore client instance."""
        if self._db is None:
            try:
                if not firebase_admin._apps:
                    # Try to initialize with service account credentials
                    if self.private_key and self.client_email:
                        cred_dict = {
                            "type": "service_account",
                            "project_id": self.project_id,
                            "private_key_id": self.private_key_id,
                            "private_key": self.private_key,
                            "client_email": self.client_email,
                            "client_id": self.client_id,
                            "auth_uri": self.auth_uri,
                            "token_uri": self.token_uri,
                            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                            "client_x509_cert_url": self.client_cert_url
                        }
                        
                        cred = credentials.Certificate(cred_dict)
                        self._app = firebase_admin.initialize_app(cred)
                    else:
                        # Use default credentials (for local development)
                        self._app = firebase_admin.initialize_app()
                else:
                    self._app = firebase_admin.get_app()
                
                self._db = firestore.client()
                logger.info("Firebase Firestore client initialized successfully")
                
            except Exception as e:
                logger.error(f"Failed to initialize Firebase client: {str(e)}")
                # Fallback to mock database for development
                logger.warning("Using mock database for development")
                self._db = MockFirestoreClient()
        
        return self._db
    
    def test_connection(self) -> bool:
        """Test database connection."""
        try:
            # Test connection with a simple query
            collections = self.db.collections()
            list(collections)  # Force evaluation
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {str(e)}")
            return False

class MockFirestoreClient:
    """Mock Firestore client for development without credentials."""
    
    def __init__(self):
        self._data: Dict[str, Dict[str, Any]] = {
            "tournaments": {},
            "users": {},
            "investments": {},
            "staking_pools": {},
            "governance_proposals": {}
        }
    
    def collection(self, collection_name: str):
        return MockCollection(collection_name, self._data.get(collection_name, {}))
    
    def collections(self):
        return [MockCollection(name, data) for name, data in self._data.items()]

class MockCollection:
    """Mock Firestore collection for development."""
    
    def __init__(self, name: str, data: Dict[str, Any]):
        self.name = name
        self._data = data
    
    def document(self, doc_id: str):
        return MockDocument(doc_id, self._data.get(doc_id, {}))
    
    def add(self, data: Dict[str, Any]):
        doc_id = f"mock_{len(self._data) + 1}"
        data["id"] = doc_id
        data["created_at"] = datetime.now()
        self._data[doc_id] = data
        return MockDocument(doc_id, data), doc_id
    
    def get(self):
        return [MockDocument(doc_id, data) for doc_id, data in self._data.items()]
    
    def where(self, field: str, op: str, value: Any):
        filtered_data = {}
        for doc_id, data in self._data.items():
            if field in data:
                if op == "==" and data[field] == value:
                    filtered_data[doc_id] = data
                elif op == ">" and data[field] > value:
                    filtered_data[doc_id] = data
                elif op == "<" and data[field] < value:
                    filtered_data[doc_id] = data
        
        return MockCollection(f"{self.name}_filtered", filtered_data)
    
    def limit(self, count: int):
        limited_data = dict(list(self._data.items())[:count])
        return MockCollection(f"{self.name}_limited", limited_data)
    
    def order_by(self, field: str, direction: str = "asc"):
        # Simple ordering implementation
        return self

class MockDocument:
    """Mock Firestore document for development."""
    
    def __init__(self, doc_id: str, data: Dict[str, Any]):
        self.id = doc_id
        self._data = data
    
    def get(self):
        return self
    
    def set(self, data: Dict[str, Any]):
        self._data.update(data)
        return self
    
    def update(self, data: Dict[str, Any]):
        self._data.update(data)
        return self
    
    def delete(self):
        self._data.clear()
        return self
    
    def to_dict(self):
        return self._data.copy()
    
    @property
    def exists(self):
        return bool(self._data)

# Global database instance
db_config = FirebaseConfig()

def get_firestore_client() -> FirestoreClient:
    """Get the Firestore client instance."""
    return db_config.db

def get_firebase_auth():
    """Get Firebase Auth instance."""
    return auth

