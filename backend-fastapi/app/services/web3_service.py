"""
Web3 service for interacting with the FixedRentalContract on Hardhat blockchain
"""
import json
import os
from typing import Dict, Optional, List, Any
from web3 import Web3
from web3.exceptions import ContractLogicError
import logging

logger = logging.getLogger(__name__)

class Web3Service:
    def __init__(self):
        # Connect to local Hardhat blockchain - use env var for container deployment
        blockchain_url = os.getenv('WEB3_PROVIDER_URL', 'http://localhost:8545')
        self.w3 = Web3(Web3.HTTPProvider(blockchain_url))
        
        # Load contract information
        self.contract_address = None
        self.contract_abi = None
        self.contract = None
        
        self._load_contract_info()
        
    def _load_contract_info(self):
        """Load contract address and ABI from deployment files"""
        try:
            # Try multiple possible paths for contract-address.json
            possible_paths = [
                '/app/contract-address.json',  # Docker volume mount
                os.path.join(os.path.dirname(__file__), '../../../frontend/public/contract-address.json'),  # Dev path
                '/app/frontend/public/contract-address.json'  # Alternative mount
            ]
            
            contract_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    contract_path = path
                    break
            
            if contract_path:
                with open(contract_path, 'r') as f:
                    contract_info = json.load(f)
                    self.contract_address = contract_info.get('address')
                    self.contract_abi = contract_info.get('abi')
                    
                if self.contract_address and self.contract_abi:
                    self.contract = self.w3.eth.contract(
                        address=self.contract_address,
                        abi=self.contract_abi
                    )
                    logger.info(f"Contract loaded successfully at {self.contract_address}")
                else:
                    logger.error("Contract address or ABI not found in contract-address.json")
            else:
                logger.error(f"Contract file not found at any of the expected paths: {possible_paths}")
                
        except Exception as e:
            logger.error(f"Error loading contract info: {e}")
    
    def is_connected(self) -> bool:
        """Check if connected to blockchain"""
        try:
            return self.w3.is_connected() and self.contract is not None
        except Exception:
            return False
    
    def get_contract_details(self) -> Dict[str, Any]:
        """Get basic contract information"""
        if not self.contract:
            return {}
            
        try:
            return {
                "car_model": self.contract.functions.assetName().call(),
                "rental_fee_per_minute": self.contract.functions.rentalFeePerMinute().call(),
                "rental_duration_minutes": self.contract.functions.durationMinutes().call(),
                "insurance_deposit": self.contract.functions.insuranceFee().call(),
                "owner": self.contract.functions.lessor().call(),
                "renter": self.contract.functions.lessee().call(),
                "is_rented": self.contract.functions.isRented().call(),
                "address": self.contract_address
            }
        except Exception as e:
            logger.error(f"Error getting contract details: {e}")
            return {}
    
    def get_rental_state(self) -> Optional[str]:
        """Get current rental state"""
        if not self.contract:
            return None
            
        try:
            is_rented = self.contract.functions.isRented().call()
            is_damaged = self.contract.functions.isDamaged().call()
            
            if is_damaged:
                return "Damaged"
            elif is_rented:
                return "Rented"
            else:
                return "Available"
        except Exception as e:
            logger.error(f"Error getting rental state: {e}")
            return None
    
    def calculate_total_cost(self) -> Optional[int]:
        """Calculate total rental cost in wei"""
        if not self.contract:
            return None
            
        try:
            fee_per_minute = self.contract.functions.rentalFeePerMinute().call()
            duration = self.contract.functions.durationMinutes().call()
            insurance = self.contract.functions.insuranceFee().call()
            
            total_rental_fee = fee_per_minute * duration
            total_cost = total_rental_fee + insurance
            
            return total_cost
        except Exception as e:
            logger.error(f"Error calculating total cost: {e}")
            return None
    
    def start_rental(self, renter_address: str, private_key: str) -> Dict[str, Any]:
        """Start a rental (renter pays total cost)"""
        if not self.contract:
            return {"success": False, "error": "Contract not loaded"}
            
        try:
            # Calculate total cost
            total_cost = self.calculate_total_cost()
            if not total_cost:
                return {"success": False, "error": "Could not calculate rental cost"}
            
            # Build transaction
            account = self.w3.eth.account.from_key(private_key)
            nonce = self.w3.eth.get_transaction_count(account.address)
            
            tx = self.contract.functions.startRental().build_transaction({
                'from': account.address,
                'value': total_cost,
                'gas': 300000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce,
            })
            
            # Sign and send transaction
            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            # Wait for confirmation
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                "success": True,
                "tx_hash": tx_hash.hex(),
                "gas_used": receipt.gasUsed,
                "total_cost_wei": total_cost,
                "total_cost_eth": self.w3.from_wei(total_cost, 'ether')
            }
            
        except ContractLogicError as e:
            return {"success": False, "error": f"Contract error: {e}"}
        except Exception as e:
            logger.error(f"Error starting rental: {e}")
            return {"success": False, "error": str(e)}
    
    def end_rental(self, owner_address: str, private_key: str) -> Dict[str, Any]:
        """End a rental (owner calls this)"""
        if not self.contract:
            return {"success": False, "error": "Contract not loaded"}
            
        try:
            account = self.w3.eth.account.from_key(private_key)
            nonce = self.w3.eth.get_transaction_count(account.address)
            
            tx = self.contract.functions.endRental().build_transaction({
                'from': account.address,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce,
            })
            
            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                "success": True,
                "tx_hash": tx_hash.hex(),
                "gas_used": receipt.gasUsed
            }
            
        except ContractLogicError as e:
            return {"success": False, "error": f"Contract error: {e}"}
        except Exception as e:
            logger.error(f"Error ending rental: {e}")
            return {"success": False, "error": str(e)}
    
    def get_account_balance(self, address: str) -> Optional[float]:
        """Get ETH balance for an address"""
        try:
            balance_wei = self.w3.eth.get_balance(address)
            return float(self.w3.from_wei(balance_wei, 'ether'))
        except Exception as e:
            logger.error(f"Error getting balance for {address}: {e}")
            return None
    
    def get_hardhat_accounts(self) -> List[Dict[str, str]]:
        """Get default Hardhat development accounts"""
        # Standard Hardhat accounts with their private keys
        return [
            {
                "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                "private_key": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
                "role": "owner"
            },
            {
                "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 
                "private_key": "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
                "role": "renter"
            },
            {
                "address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
                "private_key": "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
                "role": "user"
            }
        ]

# Global instance
web3_service = Web3Service()
