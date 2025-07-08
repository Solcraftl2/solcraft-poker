# api/config/__init__.py
# Inizializzazione del package config

from .database import get_db_connection, db_config

__all__ = ['get_db_connection', 'db_config']

