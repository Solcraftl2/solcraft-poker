"""
Firebase Service - Real Implementation
Handles all Firebase Firestore operations for SolCraft Poker
"""

import os
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        self.db = None
        self.initialize_firebase()
    
    def initialize_firebase(self):
        """Initialize Firebase Admin SDK with real credentials"""
        try:
            # Path to the Firebase credentials file
            config_path = os.path.join(os.path.dirname(__file__), '../../../firebase_config.json')
            
            if not os.path.exists(config_path):
                logger.warning("Firebase credentials file not found. Using development mode.")
                # Initialize with project ID only for development
                if not firebase_admin._apps:
                    firebase_admin.initialize_app(options={
                        'projectId': 'solcraft-poker-vercel'
                    })
                self.db = firestore.client()
                return
            
            # Initialize Firebase Admin SDK with credentials
            if not firebase_admin._apps:
                cred = credentials.Certificate(config_path)
                firebase_admin.initialize_app(cred)
            
            # Initialize Firestore client
            self.db = firestore.client()
            logger.info("Firebase initialized successfully with real credentials")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            # Fallback to development mode
            logger.warning("Falling back to development mode")
            if not firebase_admin._apps:
                firebase_admin.initialize_app(options={
                    'projectId': 'solcraft-poker-vercel'
                })
            self.db = firestore.client()
    
    # User Management
    async def create_user(self, user_data: Dict[str, Any]) -> str:
        """Create a new user in Firestore"""
        try:
            user_data['created_at'] = datetime.now(timezone.utc)
            user_data['updated_at'] = datetime.now(timezone.utc)
            
            doc_ref = self.db.collection('users').document()
            doc_ref.set(user_data)
            
            logger.info(f"User created successfully: {doc_ref.id}")
            return doc_ref.id
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                user_data = doc.to_dict()
                user_data['id'] = doc.id
                return user_data
            return None
            
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            raise
    
    async def get_user_by_wallet(self, wallet_address: str) -> Optional[Dict[str, Any]]:
        """Get user by wallet address"""
        try:
            query = self.db.collection('users').where(
                filter=FieldFilter('wallet_address', '==', wallet_address)
            ).limit(1)
            
            docs = query.stream()
            for doc in docs:
                user_data = doc.to_dict()
                user_data['id'] = doc.id
                return user_data
            return None
            
        except Exception as e:
            logger.error(f"Error getting user by wallet {wallet_address}: {e}")
            raise
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user data"""
        try:
            update_data['updated_at'] = datetime.now(timezone.utc)
            
            doc_ref = self.db.collection('users').document(user_id)
            doc_ref.update(update_data)
            
            logger.info(f"User updated successfully: {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {e}")
            raise
    
    # Tournament Management
    async def create_tournament(self, tournament_data: Dict[str, Any]) -> str:
        """Create a new tournament"""
        try:
            tournament_data['created_at'] = datetime.now(timezone.utc)
            tournament_data['updated_at'] = datetime.now(timezone.utc)
            tournament_data['status'] = 'upcoming'
            tournament_data['participants'] = []
            
            doc_ref = self.db.collection('tournaments').document()
            doc_ref.set(tournament_data)
            
            logger.info(f"Tournament created successfully: {doc_ref.id}")
            return doc_ref.id
            
        except Exception as e:
            logger.error(f"Error creating tournament: {e}")
            raise
    
    async def get_tournaments(self, status: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Get tournaments with optional status filter"""
        try:
            query = self.db.collection('tournaments')
            
            if status:
                query = query.where(filter=FieldFilter('status', '==', status))
            
            query = query.order_by('created_at', direction=firestore.Query.DESCENDING).limit(limit)
            
            tournaments = []
            docs = query.stream()
            for doc in docs:
                tournament_data = doc.to_dict()
                tournament_data['id'] = doc.id
                tournaments.append(tournament_data)
            
            return tournaments
            
        except Exception as e:
            logger.error(f"Error getting tournaments: {e}")
            raise
    
    async def get_tournament(self, tournament_id: str) -> Optional[Dict[str, Any]]:
        """Get tournament by ID"""
        try:
            doc_ref = self.db.collection('tournaments').document(tournament_id)
            doc = doc_ref.get()
            
            if doc.exists:
                tournament_data = doc.to_dict()
                tournament_data['id'] = doc.id
                return tournament_data
            return None
            
        except Exception as e:
            logger.error(f"Error getting tournament {tournament_id}: {e}")
            raise
    
    async def join_tournament(self, tournament_id: str, user_id: str) -> bool:
        """Add user to tournament participants"""
        try:
            doc_ref = self.db.collection('tournaments').document(tournament_id)
            
            # Use transaction to ensure consistency
            @firestore.transactional
            def update_in_transaction(transaction):
                tournament_doc = doc_ref.get(transaction=transaction)
                if not tournament_doc.exists:
                    raise ValueError("Tournament not found")
                
                tournament_data = tournament_doc.to_dict()
                participants = tournament_data.get('participants', [])
                
                if user_id not in participants:
                    participants.append(user_id)
                    transaction.update(doc_ref, {
                        'participants': participants,
                        'updated_at': datetime.now(timezone.utc)
                    })
                    return True
                return False
            
            transaction = self.db.transaction()
            result = update_in_transaction(transaction)
            
            if result:
                logger.info(f"User {user_id} joined tournament {tournament_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error joining tournament {tournament_id}: {e}")
            raise
    
    # Game Management
    async def create_game(self, game_data: Dict[str, Any]) -> str:
        """Create a new poker game"""
        try:
            game_data['created_at'] = datetime.now(timezone.utc)
            game_data['updated_at'] = datetime.now(timezone.utc)
            game_data['status'] = 'waiting'
            
            doc_ref = self.db.collection('games').document()
            doc_ref.set(game_data)
            
            logger.info(f"Game created successfully: {doc_ref.id}")
            return doc_ref.id
            
        except Exception as e:
            logger.error(f"Error creating game: {e}")
            raise
    
    async def get_active_games(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get active games, optionally filtered by user"""
        try:
            query = self.db.collection('games').where(
                filter=FieldFilter('status', 'in', ['waiting', 'playing'])
            )
            
            if user_id:
                query = query.where(filter=FieldFilter('players', 'array_contains', user_id))
            
            games = []
            docs = query.stream()
            for doc in docs:
                game_data = doc.to_dict()
                game_data['id'] = doc.id
                games.append(game_data)
            
            return games
            
        except Exception as e:
            logger.error(f"Error getting active games: {e}")
            raise
    
    # Transaction Management
    async def create_transaction(self, transaction_data: Dict[str, Any]) -> str:
        """Create a blockchain transaction record"""
        try:
            transaction_data['created_at'] = datetime.now(timezone.utc)
            transaction_data['status'] = 'pending'
            
            doc_ref = self.db.collection('transactions').document()
            doc_ref.set(transaction_data)
            
            logger.info(f"Transaction created successfully: {doc_ref.id}")
            return doc_ref.id
            
        except Exception as e:
            logger.error(f"Error creating transaction: {e}")
            raise
    
    async def update_transaction_status(self, transaction_id: str, status: str, tx_hash: Optional[str] = None) -> bool:
        """Update transaction status"""
        try:
            update_data = {
                'status': status,
                'updated_at': datetime.now(timezone.utc)
            }
            
            if tx_hash:
                update_data['tx_hash'] = tx_hash
            
            doc_ref = self.db.collection('transactions').document(transaction_id)
            doc_ref.update(update_data)
            
            logger.info(f"Transaction {transaction_id} status updated to {status}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating transaction {transaction_id}: {e}")
            raise
    
    # Leaderboard Management
    async def update_leaderboard(self, user_id: str, stats: Dict[str, Any]) -> bool:
        """Update user leaderboard stats"""
        try:
            stats['updated_at'] = datetime.now(timezone.utc)
            stats['user_id'] = user_id
            
            doc_ref = self.db.collection('leaderboards').document(user_id)
            doc_ref.set(stats, merge=True)
            
            logger.info(f"Leaderboard updated for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating leaderboard for user {user_id}: {e}")
            raise
    
    async def get_leaderboard(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get leaderboard rankings"""
        try:
            query = self.db.collection('leaderboards').order_by(
                'total_winnings', direction=firestore.Query.DESCENDING
            ).limit(limit)
            
            leaderboard = []
            docs = query.stream()
            for doc in docs:
                stats = doc.to_dict()
                stats['id'] = doc.id
                leaderboard.append(stats)
            
            return leaderboard
            
        except Exception as e:
            logger.error(f"Error getting leaderboard: {e}")
            raise

# Global instance
firebase_service = FirebaseService()

