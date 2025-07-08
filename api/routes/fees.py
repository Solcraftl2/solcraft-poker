"""
Fees API routes for SolCraft Poker
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum

from models.fee import (
    Fee, FeeCreate, FeeUpdate, FeeResponse, FeeListResponse,
    FeeType, FeeStatus, FeeCalculation
)
from services.firebase_service import FirebaseService
from services.auth_service import get_current_user

router = APIRouter()
firebase_service = FirebaseService()

@router.get("/", response_model=FeeListResponse)
async def get_fees(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    fee_type: Optional[FeeType] = None,
    status: Optional[FeeStatus] = None,
    player_id: Optional[str] = None,
    tournament_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
):
    """Get list of fees with pagination and filters"""
    try:
        fees_data = await firebase_service.get_fees(
            page=page,
            per_page=per_page,
            fee_type=fee_type,
            status=status,
            player_id=player_id,
            tournament_id=tournament_id,
            date_from=date_from,
            date_to=date_to
        )
        return fees_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch fees: {str(e)}")

@router.get("/{fee_id}", response_model=FeeResponse)
async def get_fee(fee_id: str):
    """Get fee by ID"""
    try:
        fee = await firebase_service.get_fee(fee_id)
        if not fee:
            raise HTTPException(status_code=404, detail="Fee not found")
        return fee
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch fee: {str(e)}")

@router.post("/", response_model=FeeResponse)
async def create_fee(
    fee_data: FeeCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new fee record (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Create fee
        fee = await firebase_service.create_fee(fee_data)
        return fee
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create fee: {str(e)}")

@router.put("/{fee_id}", response_model=FeeResponse)
async def update_fee(
    fee_id: str,
    fee_data: FeeUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update fee information (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Check if fee exists
        existing_fee = await firebase_service.get_fee(fee_id)
        if not existing_fee:
            raise HTTPException(status_code=404, detail="Fee not found")
        
        # Update fee
        updated_fee = await firebase_service.update_fee(fee_id, fee_data)
        return updated_fee
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update fee: {str(e)}")

@router.delete("/{fee_id}")
async def delete_fee(
    fee_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a fee record (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Delete fee
        await firebase_service.delete_fee(fee_id)
        return {"message": "Fee deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete fee: {str(e)}")

@router.post("/calculate")
async def calculate_fee(calculation_data: FeeCalculation):
    """Calculate fee for a given scenario"""
    try:
        calculated_fee = await firebase_service.calculate_fee(calculation_data)
        return {
            "calculation": calculation_data,
            "result": calculated_fee
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate fee: {str(e)}")

@router.get("/player/{player_id}/summary")
async def get_player_fee_summary(
    player_id: str,
    period: str = Query("month", regex="^(day|week|month|year|all)$")
):
    """Get fee summary for a specific player"""
    try:
        summary = await firebase_service.get_player_fee_summary(player_id, period)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch player fee summary: {str(e)}")

@router.get("/tournament/{tournament_id}/summary")
async def get_tournament_fee_summary(tournament_id: str):
    """Get fee summary for a specific tournament"""
    try:
        summary = await firebase_service.get_tournament_fee_summary(tournament_id)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tournament fee summary: {str(e)}")

@router.get("/types/config")
async def get_fee_configuration():
    """Get current fee configuration and rates"""
    try:
        config = await firebase_service.get_fee_configuration()
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch fee configuration: {str(e)}")

@router.put("/types/config")
async def update_fee_configuration(
    config: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Update fee configuration (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Update configuration
        updated_config = await firebase_service.update_fee_configuration(config)
        return {"message": "Fee configuration updated successfully", "config": updated_config}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update fee configuration: {str(e)}")

@router.get("/analytics/revenue")
async def get_fee_revenue_analytics(
    period: str = Query("month", regex="^(day|week|month|quarter|year)$"),
    fee_type: Optional[FeeType] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get fee revenue analytics (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        analytics = await firebase_service.get_fee_revenue_analytics(period, fee_type)
        return analytics
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch fee analytics: {str(e)}")

@router.post("/batch/process")
async def process_batch_fees(
    batch_data: List[FeeCreate],
    current_user: dict = Depends(get_current_user)
):
    """Process multiple fees in batch (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Process batch
        results = await firebase_service.process_batch_fees(batch_data)
        return {
            "message": f"Processed {len(results['successful'])} fees successfully",
            "successful": results['successful'],
            "failed": results['failed']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process batch fees: {str(e)}")

@router.get("/pending/approval")
async def get_pending_fees(
    current_user: dict = Depends(get_current_user)
):
    """Get fees pending approval (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        pending_fees = await firebase_service.get_pending_fees()
        return {"pending_fees": pending_fees, "count": len(pending_fees)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch pending fees: {str(e)}")

@router.post("/{fee_id}/approve")
async def approve_fee(
    fee_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Approve a pending fee (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Approve fee
        await firebase_service.approve_fee(fee_id, current_user["uid"])
        return {"message": "Fee approved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to approve fee: {str(e)}")

@router.post("/{fee_id}/reject")
async def reject_fee(
    fee_id: str,
    reason: str,
    current_user: dict = Depends(get_current_user)
):
    """Reject a pending fee (admin only)"""
    try:
        # Check if user has admin privileges
        if not await firebase_service.is_admin(current_user["uid"]):
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Reject fee
        await firebase_service.reject_fee(fee_id, reason, current_user["uid"])
        return {"message": "Fee rejected successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reject fee: {str(e)}")

