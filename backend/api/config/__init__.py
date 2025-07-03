# api/config/__init__.py
# Inizializzazione del package config

from .database import get_supabase_client, db_config

__all__ = ['get_supabase_client', 'db_config']

