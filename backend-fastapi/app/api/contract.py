"""
Smart Contract API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import logging

from app.services.web3_service import web3_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contract", tags=["Smart Contract"])

@router.get("/status")
async def get_contract_status() -> Dict[str, Any]:
    """Get contract connection status and basic info"""
    try:
        if not web3_service.is_connected():
            return {
                "connected": False,
                "error": "Not connected to blockchain or contract not loaded"
            }
        
        contract_details = web3_service.get_contract_details()
        rental_state = web3_service.get_rental_state()
        total_cost = web3_service.calculate_total_cost()
        
        return {
            "connected": True,
            "contract_address": contract_details.get("address"),
            "car_model": contract_details.get("car_model"),
            "rental_fee_per_minute": contract_details.get("rental_fee_per_minute"),
            "rental_duration_minutes": contract_details.get("rental_duration_minutes"),
            "insurance_deposit": contract_details.get("insurance_deposit"),
            "owner": contract_details.get("owner"),
            "current_renter": contract_details.get("renter"),
            "rental_state": rental_state,
            "total_cost_wei": total_cost,
            "total_cost_eth": web3_service.w3.from_wei(total_cost, 'ether') if total_cost else None
        }
    except Exception as e:
        logger.error(f"Error getting contract status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/accounts")
async def get_hardhat_accounts() -> Dict[str, Any]:
    """Get default Hardhat development accounts for testing"""
    try:
        accounts = web3_service.get_hardhat_accounts()
        
        # Add current balances
        for account in accounts:
            balance = web3_service.get_account_balance(account["address"])
            account["balance_eth"] = balance
            
        return {"accounts": accounts}
    except Exception as e:
        logger.error(f"Error getting accounts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/start-rental")
async def start_rental(renter_address: str, private_key: str) -> Dict[str, Any]:
    """Start a rental using the provided renter account"""
    try:
        if not web3_service.is_connected():
            raise HTTPException(status_code=503, detail="Not connected to blockchain")
            
        # Check current state
        current_state = web3_service.get_rental_state()
        if current_state != "Available":
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot start rental. Current state: {current_state}"
            )
        
        result = web3_service.start_rental(renter_address, private_key)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return {
            "success": True,
            "message": "Rental started successfully",
            "transaction_hash": result["tx_hash"],
            "gas_used": result["gas_used"],
            "total_cost_wei": result["total_cost_wei"],
            "total_cost_eth": result["total_cost_eth"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting rental: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/end-rental")
async def end_rental(owner_address: str, private_key: str) -> Dict[str, Any]:
    """End a rental using the owner account"""
    try:
        if not web3_service.is_connected():
            raise HTTPException(status_code=503, detail="Not connected to blockchain")
            
        # Check current state
        current_state = web3_service.get_rental_state()
        if current_state != "Rented":
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot end rental. Current state: {current_state}"
            )
        
        result = web3_service.end_rental(owner_address, private_key)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return {
            "success": True,
            "message": "Rental ended successfully",
            "transaction_hash": result["tx_hash"],
            "gas_used": result["gas_used"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending rental: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/balance/{address}")
async def get_account_balance(address: str) -> Dict[str, Any]:
    """Get ETH balance for a specific address"""
    try:
        balance = web3_service.get_account_balance(address)
        
        if balance is None:
            raise HTTPException(status_code=400, detail="Invalid address or connection error")
            
        return {
            "address": address,
            "balance_eth": balance,
            "balance_wei": web3_service.w3.to_wei(balance, 'ether')
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting balance: {e}")
        raise HTTPException(status_code=500, detail=str(e))
