"""
Firebase Admin Service for SolCraft Poker
Handles all database operations with Firebase Firestore
"""

import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    logging.warning("Firebase Admin SDK not available. Using mock implementation.")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class User:
    user_id: str
    wallet_address: str
    username: str
    email: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    profile: Optional[Dict] = None
    preferences: Optional[Dict] = None
    stats: Optional[Dict] = None

@dataclass
class Tournament:
    tournament_id: str
    organizer: str
    name: str
    description: str
    buy_in: float
    max_players: int
    current_players: int
    start_time: datetime
    status: str
    prize_pool: float
    created_at: Optional[datetime] = None
    metadata: Optional[Dict] = None
    blockchain: Optional[Dict] = None

class FirebaseService:
    """Firebase Firestore service for SolCraft Poker"""
    
    def __init__(self):
        self.db = None
        self.initialized = False
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        if not FIREBASE_AVAILABLE:
            logger.warning("Firebase SDK not available. Using mock mode.")
            return
        
        try:
            # Check if Firebase is already initialized
            if firebase_admin._apps:
                self.db = firestore.client()
                self.initialized = True
                logger.info("Firebase already initialized")
                return
            
            # Try to initialize from environment variable
            firebase_config_path = os.getenv('FIREBASE_CONFIG_PATH')
            if firebase_config_path and os.path.exists(firebase_config_path):
                cred = credentials.Certificate(firebase_config_path)
                firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                self.initialized = True
                logger.info(f"Firebase initialized from config: {firebase_config_path}")
                return
            
            # Try to initialize from JSON string
            firebase_config_json = os.getenv('FIREBASE_CONFIG_JSON')
            if firebase_config_json:
                config_dict = json.loads(firebase_config_json)
                cred = credentials.Certificate(config_dict)
                firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                self.initialized = True
                logger.info("Firebase initialized from JSON config")
                return
            
            # Try default credentials
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)
            self.db = firestore.client()
            self.initialized = True
            logger.info("Firebase initialized with default credentials")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            self.initialized = False
    
    def is_connected(self) -> bool:
        """Check if Firebase is properly connected"""
        return self.initialized and self.db is not None
    
    # User Management
    async def create_user(self, user: User) -> bool:
        """Create a new user in Firestore"""
        if not self.is_connected():
            logger.warning("Firebase not connected. Using mock response.")
            return True
        
        try:
            user_data = {
                'user_id': user.user_id,
                'wallet_address': user.wallet_address,
                'username': user.username,
                'email': user.email,
                'created_at': user.created_at or datetime.now(timezone.utc),
                'last_login': user.last_login,
                'profile': user.profile or {
                    'avatar_url': '',
                    'bio': '',
                    'tier': 'Bronze',
                    'total_invested': 0,
                    'lifetime_roi': 0,
                    'active_investments': 0
                },
                'preferences': user.preferences or {
                    'notifications': True,
                    'email_updates': True,
                    'privacy_mode': False
                },
                'stats': user.stats or {
                    'tournaments_joined': 0,
                    'tournaments_won': 0,
                    'total_winnings': 0,
                    'current_streak': 0
                }
            }
            
            self.db.collection('users').document(user.user_id).set(user_data)
            logger.info(f"User created: {user.user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return False
    
    async def get_user(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        if not self.is_connected():
            # Mock user data
            return {
                'user_id': user_id,
                'wallet_address': '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
                'username': f'user_{user_id[:8]}',
                'email': None,
                'created_at': datetime.now(timezone.utc),
                'profile': {
                    'tier': 'Bronze',
                    'total_invested': 0,
                    'lifetime_roi': 0,
                    'active_investments': 0
                }
            }
        
        try:
            doc = self.db.collection('users').document(user_id).get()
            if doc.exists:
                return doc.to_dict()
            return None
            
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            return None
    
    async def update_user_login(self, user_id: str) -> bool:
        """Update user's last login timestamp"""
        if not self.is_connected():
            return True
        
        try:
            self.db.collection('users').document(user_id).update({
                'last_login': datetime.now(timezone.utc)
            })
            return True
            
        except Exception as e:
            logger.error(f"Error updating user login: {e}")
            return False
    
    # Tournament Management
    async def create_tournament(self, tournament: Tournament) -> bool:
        """Create a new tournament"""
        if not self.is_connected():
            logger.warning("Firebase not connected. Using mock response.")
            return True
        
        try:
            tournament_data = {
                'tournament_id': tournament.tournament_id,
                'organizer': tournament.organizer,
                'name': tournament.name,
                'description': tournament.description,
                'buy_in': tournament.buy_in,
                'max_players': tournament.max_players,
                'current_players': tournament.current_players,
                'start_time': tournament.start_time,
                'status': tournament.status,
                'prize_pool': tournament.prize_pool,
                'created_at': tournament.created_at or datetime.now(timezone.utc),
                'metadata': tournament.metadata or {},
                'blockchain': tournament.blockchain or {}
            }
            
            self.db.collection('tournaments').document(tournament.tournament_id).set(tournament_data)
            logger.info(f"Tournament created: {tournament.tournament_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating tournament: {e}")
            return False
    
    async def get_tournaments(self, status: Optional[str] = None, limit: int = 50) -> List[Dict]:
        """Get tournaments with optional status filter"""
        if not self.is_connected():
            # Mock tournament data
            mock_tournaments = [
                {
                    'tournament_id': '1',
                    'name': 'Solana Summer Showdown',
                    'organizer': 'Solana Poker Club',
                    'buy_in': 100,
                    'prize_pool': 10000,
                    'max_players': 200,
                    'current_players': 50,
                    'status': 'registration_open',
                    'start_time': datetime.now(timezone.utc),
                    'metadata': {'ai_risk_level': 'Medium'}
                },
                {
                    'tournament_id': '2',
                    'name': 'Crypto Poker Masters',
                    'organizer': 'Decentralized Poker Arena',
                    'buy_in': 500,
                    'prize_pool': 50000,
                    'max_players': 100,
                    'current_players': 20,
                    'status': 'registration_open',
                    'start_time': datetime.now(timezone.utc),
                    'metadata': {'ai_risk_level': 'High'}
                }
            ]
            
            if status:
                return [t for t in mock_tournaments if t['status'] == status]
            return mock_tournaments
        
        try:
            query = self.db.collection('tournaments')
            
            if status:
                query = query.where('status', '==', status)
            
            query = query.limit(limit)
            docs = query.stream()
            
            tournaments = []
            for doc in docs:
                tournament_data = doc.to_dict()
                tournaments.append(tournament_data)
            
            return tournaments
            
        except Exception as e:
            logger.error(f"Error getting tournaments: {e}")
            return []
    
    async def join_tournament(self, tournament_id: str, user_id: str, wallet_address: str, investment_amount: float) -> bool:
        """Join a tournament"""
        if not self.is_connected():
            return True
        
        try:
            # Create participation record
            participation_data = {
                'participation_id': f"{tournament_id}_{user_id}",
                'tournament_id': tournament_id,
                'user_id': user_id,
                'wallet_address': wallet_address,
                'joined_at': datetime.now(timezone.utc),
                'investment_amount': investment_amount,
                'status': 'registered'
            }
            
            self.db.collection('tournament_participants').add(participation_data)
            
            # Update tournament current_players count
            tournament_ref = self.db.collection('tournaments').document(tournament_id)
            tournament_ref.update({
                'current_players': firestore.Increment(1)
            })
            
            logger.info(f"User {user_id} joined tournament {tournament_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error joining tournament: {e}")
            return False
    
    # Analytics
    async def get_platform_analytics(self) -> Dict:
        """Get platform analytics"""
        if not self.is_connected():
            # Mock analytics data
            return {
                'tournaments': {
                    'total': 5,
                    'active': 4,
                    'total_prize_pool': 75000
                },
                'staking': {
                    'total_pools': 3,
                    'total_staked': 21000,
                    'active_stakers': 225
                },
                'governance': {
                    'total_proposals': 4,
                    'active_proposals': 2
                },
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
        
        try:
            # Get latest analytics document
            analytics_docs = self.db.collection('platform_analytics').order_by('date', direction=firestore.Query.DESCENDING).limit(1).stream()
            
            for doc in analytics_docs:
                return doc.to_dict()
            
            # If no analytics found, return empty data
            return {
                'tournaments': {'total': 0, 'active': 0, 'total_prize_pool': 0},
                'staking': {'total_pools': 0, 'total_staked': 0, 'active_stakers': 0},
                'governance': {'total_proposals': 0, 'active_proposals': 0},
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting analytics: {e}")
            return {}
    
    async def update_analytics(self, analytics_data: Dict) -> bool:
        """Update platform analytics"""
        if not self.is_connected():
            return True
        
        try:
            analytics_data['date'] = datetime.now(timezone.utc)
            self.db.collection('platform_analytics').add(analytics_data)
            logger.info("Analytics updated")
            return True
            
        except Exception as e:
            logger.error(f"Error updating analytics: {e}")
            return False

# Global Firebase service instance
firebase_service = FirebaseService()

# Export functions for easy import
async def get_user(user_id: str) -> Optional[Dict]:
    return await firebase_service.get_user(user_id)

async def create_user(user: User) -> bool:
    return await firebase_service.create_user(user)

async def get_tournaments(status: Optional[str] = None, limit: int = 50) -> List[Dict]:
    return await firebase_service.get_tournaments(status, limit)

async def create_tournament(tournament: Tournament) -> bool:
    return await firebase_service.create_tournament(tournament)

async def join_tournament(tournament_id: str, user_id: str, wallet_address: str, investment_amount: float) -> bool:
    return await firebase_service.join_tournament(tournament_id, user_id, wallet_address, investment_amount)

async def get_platform_analytics() -> Dict:
    return await firebase_service.get_platform_analytics()

async def update_analytics(analytics_data: Dict) -> bool:
    return await firebase_service.update_analytics(analytics_data)

