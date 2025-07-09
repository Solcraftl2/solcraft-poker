"""
Firebase Service - Development Mode
Handles all Firebase Firestore operations for SolCraft Poker in development mode
"""

import os
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import uuid

logger = logging.getLogger(__name__)

class FirebaseServiceDev:
    """Development Firebase service with in-memory storage"""
    
    def __init__(self):
        # In-memory storage for development
        self.users = {}
        self.tournaments = {}
        self.games = {}
        self.transactions = {}
        self.leaderboards = {}
        logger.info("Firebase Development Service initialized")
    
    # User Management
    async def create_user(self, user_data: Dict[str, Any]) -> str:
        """Create a new user in memory"""
        try:
            user_id = str(uuid.uuid4())
            user_data['id'] = user_id
            user_data['created_at'] = datetime.now(timezone.utc)
            user_data['updated_at'] = datetime.now(timezone.utc)
            
            self.users[user_id] = user_data
            
            logger.info(f"User created successfully: {user_id}")
            return user_id
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            return self.users.get(user_id)
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            raise
    
    async def get_user_by_wallet(self, wallet_address: str) -> Optional[Dict[str, Any]]:
        """Get user by wallet address"""
        try:
            for user in self.users.values():
                if user.get('wallet_address') == wallet_address:
                    return user
            return None
        except Exception as e:
            logger.error(f"Error getting user by wallet {wallet_address}: {e}")
            raise
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user data"""
        try:
            if user_id in self.users:
                self.users[user_id].update(update_data)
                self.users[user_id]['updated_at'] = datetime.now(timezone.utc)
                logger.info(f"User updated successfully: {user_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {e}")
            raise
    
    # Tournament Management
    async def create_tournament(self, tournament_data: Dict[str, Any]) -> str:
        """Create a new tournament"""
        try:
            tournament_id = str(uuid.uuid4())
            tournament_data['id'] = tournament_id
            tournament_data['created_at'] = datetime.now(timezone.utc)
            tournament_data['updated_at'] = datetime.now(timezone.utc)
            tournament_data['status'] = 'upcoming'
            tournament_data['participants'] = []
            
            self.tournaments[tournament_id] = tournament_data
            
            logger.info(f"Tournament created successfully: {tournament_id}")
            return tournament_id
            
        except Exception as e:
            logger.error(f"Error creating tournament: {e}")
            raise
    
    async def get_tournaments(self, status: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Get tournaments with optional status filter"""
        try:
            tournaments = list(self.tournaments.values())
            
            if status:
                tournaments = [t for t in tournaments if t.get('status') == status]
            
            # Sort by created_at descending
            tournaments.sort(key=lambda x: x.get('created_at', datetime.min), reverse=True)
            
            return tournaments[:limit]
            
        except Exception as e:
            logger.error(f"Error getting tournaments: {e}")
            raise
    
    async def get_tournament(self, tournament_id: str) -> Optional[Dict[str, Any]]:
        """Get tournament by ID"""
        try:
            return self.tournaments.get(tournament_id)
        except Exception as e:
            logger.error(f"Error getting tournament {tournament_id}: {e}")
            raise
    
    async def join_tournament(self, tournament_id: str, user_id: str) -> bool:
        """Add user to tournament participants"""
        try:
            if tournament_id in self.tournaments:
                tournament = self.tournaments[tournament_id]
                participants = tournament.get('participants', [])
                
                if user_id not in participants:
                    participants.append(user_id)
                    tournament['participants'] = participants
                    tournament['updated_at'] = datetime.now(timezone.utc)
                    logger.info(f"User {user_id} joined tournament {tournament_id}")
                    return True
            return False
        except Exception as e:
            logger.error(f"Error joining tournament {tournament_id}: {e}")
            raise
    
    # Game Management
    async def create_game(self, game_data: Dict[str, Any]) -> str:
        """Create a new poker game"""
        try:
            game_id = str(uuid.uuid4())
            game_data['id'] = game_id
            game_data['created_at'] = datetime.now(timezone.utc)
            game_data['updated_at'] = datetime.now(timezone.utc)
            game_data['status'] = 'waiting'
            
            self.games[game_id] = game_data
            
            logger.info(f"Game created successfully: {game_id}")
            return game_id
            
        except Exception as e:
            logger.error(f"Error creating game: {e}")
            raise
    
    async def get_active_games(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get active games, optionally filtered by user"""
        try:
            games = [g for g in self.games.values() if g.get('status') in ['waiting', 'playing']]
            
            if user_id:
                games = [g for g in games if user_id in g.get('players', [])]
            
            return games
            
        except Exception as e:
            logger.error(f"Error getting active games: {e}")
            raise
    
    # Transaction Management
    async def create_transaction(self, transaction_data: Dict[str, Any]) -> str:
        """Create a blockchain transaction record"""
        try:
            transaction_id = str(uuid.uuid4())
            transaction_data['id'] = transaction_id
            transaction_data['created_at'] = datetime.now(timezone.utc)
            transaction_data['status'] = 'pending'
            
            self.transactions[transaction_id] = transaction_data
            
            logger.info(f"Transaction created successfully: {transaction_id}")
            return transaction_id
            
        except Exception as e:
            logger.error(f"Error creating transaction: {e}")
            raise
    
    async def update_transaction_status(self, transaction_id: str, status: str, tx_hash: Optional[str] = None) -> bool:
        """Update transaction status"""
        try:
            if transaction_id in self.transactions:
                self.transactions[transaction_id]['status'] = status
                self.transactions[transaction_id]['updated_at'] = datetime.now(timezone.utc)
                
                if tx_hash:
                    self.transactions[transaction_id]['tx_hash'] = tx_hash
                
                logger.info(f"Transaction {transaction_id} status updated to {status}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error updating transaction {transaction_id}: {e}")
            raise
    
    # Leaderboard Management
    async def update_leaderboard(self, user_id: str, stats: Dict[str, Any]) -> bool:
        """Update user leaderboard stats"""
        try:
            stats['updated_at'] = datetime.now(timezone.utc)
            stats['user_id'] = user_id
            
            self.leaderboards[user_id] = stats
            
            logger.info(f"Leaderboard updated for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating leaderboard for user {user_id}: {e}")
            raise
    
    async def get_leaderboard(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get leaderboard rankings"""
        try:
            leaderboard = list(self.leaderboards.values())
            
            # Sort by total_winnings descending
            leaderboard.sort(key=lambda x: x.get('total_winnings', 0), reverse=True)
            
            return leaderboard[:limit]
            
        except Exception as e:
            logger.error(f"Error getting leaderboard: {e}")
            raise

# Global instance
firebase_service = FirebaseServiceDev()

