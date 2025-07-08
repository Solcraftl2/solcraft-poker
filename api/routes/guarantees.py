"""
Guarantees API routes for SolCraft Poker
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum

from models.guarantee import (
    Guarantee, GuaranteeCreate, GuaranteeUpdate, GuaranteeResponse,
    GuaranteeListResponse, GuaranteeStatus, GuaranteeType
)
from services.firebase_service import FirebaseService
from services.auth_service import get_current_user

router = APIRouter()
firebase_service = FirebaseService()

@router.get("/", response_model=GuaranteeListResponse)
async def get_guarantees(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    guarantee_type: Optional[GuaranteeType] = None,
    status: Optional[GuaranteeStatus] = None,
    tournament_id: Optional[str] = None,
    active_only: bool = False
):
    """Get list of guarantees with pagination and filters"""
    try:
        guarantees_data = await firebase_service.get_guarantees(
            page=page,
            per_page=per_page,
            guarantee_type=guarantee_type,
            status=status,
            tournament_id=tournament_id,
            active_only=active_only
        )
        return guarantees_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch guarantees: {str(e)}")

@router.get("/{guarantee_id}", response_model=GuaranteeResponse)
async def get_guarantee(guarantee_id: str):
    """Get guarantee by ID"""
    try:
        guarantee = await firebase_service.get_guarantee(guarantee_id)
        if not guarantee:
            raise HTTPException(status_code=404, detail="Guarantee not found")
        return guarantee
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch guarantee: {str(e)}")

@router.post("/", response_model=GuaranteeResponse)
async def create_guarantee(
    guarantee_data: GuaranteeCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new guarantee (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Create guarantee
        guarantee = await firebase_service.create_guarantee(guarantee_data, current_user["uid"])
        return guarantee
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create guarantee: {str(e)}")

@router.put("/{guarantee_id}", response_model=GuaranteeResponse)
async def update_guarantee(
    guarantee_id: str,
    guarantee_data: GuaranteeUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update guarantee information (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Check if guarantee exists
        existing_guarantee = await firebase_service.get_guarantee(guarantee_id)
        if not existing_guarantee:
            raise HTTPException(status_code=404, detail="Guarantee not found")
        
        # Update guarantee
        updated_guarantee = await firebase_service.update_guarantee(guarantee_id, guarantee_data)
        return updated_guarantee
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update guarantee: {str(e)}")

@router.delete("/{guarantee_id}")
async def cancel_guarantee(
    guarantee_id: str,
    reason: str,
    current_user: dict = Depends(get_current_user)
):
    """Cancel a guarantee (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Cancel guarantee
        await firebase_service.cancel_guarantee(guarantee_id, reason, current_user["uid"])
        return {"message": "Guarantee cancelled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel guarantee: {str(e)}")

@router.get("/tournament/{tournament_id}/active")
async def get_tournament_guarantees(tournament_id: str):
    """Get active guarantees for a specific tournament"""
    try:
        guarantees = await firebase_service.get_tournament_guarantees(tournament_id)
        return {
            "tournament_id": tournament_id,
            "guarantees": guarantees,
            "count": len(guarantees)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tournament guarantees: {str(e)}")

@router.post("/{guarantee_id}/activate")
async def activate_guarantee(
    guarantee_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Activate a guarantee (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Activate guarantee
        await firebase_service.activate_guarantee(guarantee_id, current_user["uid"])
        return {"message": "Guarantee activated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to activate guarantee: {str(e)}")

@router.post("/{guarantee_id}/fulfill")
async def fulfill_guarantee(
    guarantee_id: str,
    fulfillment_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Fulfill a guarantee (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Fulfill guarantee
        result = await firebase_service.fulfill_guarantee(guarantee_id, fulfillment_data, current_user["uid"])
        return {"message": "Guarantee fulfilled successfully", "result": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fulfill guarantee: {str(e)}")

@router.get("/{guarantee_id}/status")
async def get_guarantee_status(guarantee_id: str):
    """Get detailed status of a guarantee"""
    try:
        status = await firebase_service.get_guarantee_status(guarantee_id)
        if not status:
            raise HTTPException(status_code=404, detail="Guarantee status not found")
        return status
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch guarantee status: {str(e)}")

@router.get("/analytics/performance")
async def get_guarantee_analytics(
    period: str = Query("month", regex="^(day|week|month|quarter|year)$"),
    guarantee_type: Optional[GuaranteeType] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get guarantee performance analytics (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        analytics = await firebase_service.get_guarantee_analytics(period, guarantee_type)
        return analytics
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch guarantee analytics: {str(e)}")

@router.get("/types/config")
async def get_guarantee_configuration():
    """Get current guarantee configuration and rules"""
    try:
        config = await firebase_service.get_guarantee_configuration()
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch guarantee configuration: {str(e)}")

@router.put("/types/config")
async def update_guarantee_configuration(
    config: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Update guarantee configuration (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Update configuration
        updated_config = await firebase_service.update_guarantee_configuration(config)
        return {"message": "Guarantee configuration updated successfully", "config": updated_config}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update guarantee configuration: {str(e)}")

@router.get("/expiring/soon")
async def get_expiring_guarantees(
    days_ahead: int = Query(7, ge=1, le=30),
    current_user: dict = Depends(get_current_user)
):
    """Get guarantees expiring soon (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        expiring_guarantees = await firebase_service.get_expiring_guarantees(days_ahead)
        return {
            "expiring_guarantees": expiring_guarantees,
            "count": len(expiring_guarantees),
            "days_ahead": days_ahead
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch expiring guarantees: {str(e)}")

@router.post("/batch/create")
async def create_batch_guarantees(
    batch_data: List[GuaranteeCreate],
    current_user: dict = Depends(get_current_user)
):
    """Create multiple guarantees in batch (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Create batch
        results = await firebase_service.create_batch_guarantees(batch_data, current_user["uid"])
        return {
            "message": f"Created {len(results['successful'])} guarantees successfully",
            "successful": results['successful'],
            "failed": results['failed']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create batch guarantees: {str(e)}")

@router.get("/history/{guarantee_id}")
async def get_guarantee_history(guarantee_id: str):
    """Get guarantee history and audit trail"""
    try:
        history = await firebase_service.get_guarantee_history(guarantee_id)
        return {"guarantee_id": guarantee_id, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch guarantee history: {str(e)}")

@router.post("/{guarantee_id}/extend")
async def extend_guarantee(
    guarantee_id: str,
    extension_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Extend a guarantee duration (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Extend guarantee
        result = await firebase_service.extend_guarantee(guarantee_id, extension_data, current_user["uid"])
        return {"message": "Guarantee extended successfully", "result": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extend guarantee: {str(e)}")

