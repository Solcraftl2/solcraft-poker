"""
User API Routes - Real Implementation
Handles user registration, authentication, and profile management
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import logging
from ..services.firebase_service_real import firebase_service_real as firebase_service
from ..services.blockchain_service_simple import blockchain_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    wallet_address: str
    display_name: Optional[str] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    wallet_address: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    total_winnings: float = 0.0
    tournaments_played: int = 0
    tournaments_won: int = 0
    created_at: str
    updated_at: str

@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if user already exists by wallet address
        existing_user = await firebase_service.get_user_by_wallet(user_data.wallet_address)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this wallet address already exists"
            )
        
        # Verify wallet address on blockchain
        is_valid = await blockchain_service.verify_wallet_address(user_data.wallet_address)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid wallet address"
            )
        
        # Create user data
        user_dict = user_data.dict()
        user_dict.update({
            'total_winnings': 0.0,
            'tournaments_played': 0,
            'tournaments_won': 0,
            'is_active': True
        })
        
        # Create user in Firebase
        user_id = await firebase_service.create_user(user_dict)
        
        # Get created user
        created_user = await firebase_service.get_user(user_id)
        if not created_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve created user"
            )
        
        logger.info(f"User registered successfully: {user_id}")
        return UserResponse(**created_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/profile/{user_id}", response_model=UserResponse)
async def get_user_profile(user_id: str):
    """Get user profile by ID"""
    try:
        user = await firebase_service.get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(**user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/wallet/{wallet_address}", response_model=UserResponse)
async def get_user_by_wallet(wallet_address: str):
    """Get user by wallet address"""
    try:
        user = await firebase_service.get_user_by_wallet(wallet_address)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(**user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user by wallet: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/profile/{user_id}", response_model=UserResponse)
async def update_user_profile(user_id: str, update_data: UserUpdate):
    """Update user profile"""
    try:
        # Check if user exists
        existing_user = await firebase_service.get_user(user_id)
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update user data
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        if update_dict:
            success = await firebase_service.update_user(user_id, update_dict)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update user"
                )
        
        # Get updated user
        updated_user = await firebase_service.get_user(user_id)
        return UserResponse(**updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/{user_id}/stats")
async def get_user_stats(user_id: str):
    """Get user statistics"""
    try:
        user = await firebase_service.get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user transactions for balance calculation
        transactions = await firebase_service.get_user_transactions(user_id, limit=100)
        
        # Calculate current balance
        balance = 0.0
        for transaction in transactions:
            if transaction.get('type') == 'deposit':
                balance += transaction.get('amount', 0)
            elif transaction.get('type') == 'withdrawal':
                balance -= transaction.get('amount', 0)
            elif transaction.get('type') == 'winnings':
                balance += transaction.get('amount', 0)
        
        stats = {
            'user_id': user_id,
            'current_balance': balance,
            'total_winnings': user.get('total_winnings', 0.0),
            'tournaments_played': user.get('tournaments_played', 0),
            'tournaments_won': user.get('tournaments_won', 0),
            'win_rate': (user.get('tournaments_won', 0) / max(user.get('tournaments_played', 1), 1)) * 100,
            'recent_transactions': transactions[:5]
        }
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

