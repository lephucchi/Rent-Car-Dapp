import { ethers } from "ethers";
import type { 
  ContractInfo as ContractData, 
  CarInfo, 
  RentalInfo, 
  TimeInfo, 
  InspectionInfo, 
  ContractStatus 
} from "../types";

// Re-export types for convenience
export type { ContractData as ContractInfo, CarInfo, RentalInfo, TimeInfo, InspectionInfo };
export { ContractStatus } from "../types";

// Default contract address (will be updated after deployment)
let CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Car Rental Contract ABI (updated for our contract)
const CONTRACT_ABI = [
  "function activateContract() external payable",
  "function returnCar() external",
  "function inspectCar(bool _isDamaged, uint256 _compensationAmount) external",
  "function finalizeContract() external",
  "function cancelContract() external",
  "function getCarInfo() external view returns (string memory, string memory, uint256)",
  "function getRentalInfo() external view returns (uint256, uint256, uint256, uint256, uint256)",
  "function getTimeInfo() external view returns (uint256, uint256, uint256)",
  "function getContractBalance() external view returns (uint256)",
  "function getInspectionInfo() external view returns (bool, uint256)",
  "function lessor() external view returns (address)",
  "function lessee() external view returns (address)",
  "function inspector() external view returns (address)",
  "function status() external view returns (uint8)",
  "function pricePerDay() external view returns (uint256)",
  "function rentalDuration() external view returns (uint256)",
  "function depositAmount() external view returns (uint256)",
  "function latePenaltyRate() external view returns (uint256)",
  "function earlyDepreciationRate() external view returns (uint256)",
  "function startTime() external view returns (uint256)",
  "function dueTime() external view returns (uint256)",
  "function returnTime() external view returns (uint256)",
  "function isDamaged() external view returns (bool)",
  "function compensationAmount() external view returns (uint256)",
  "function DEFAULT_INSPECTOR() external view returns (address)",
  "event ContractInitiated(address lessor, uint256 timestamp)",
  "event ContractActivated(address lessee, uint256 timestamp)",
  "event CarReturned(address lessee, uint256 timestamp)",
  "event InspectionCompleted(bool isDamaged, uint256 compensation)",
  "event ContractFinalized(uint256 totalAmount)",
  "event ContractCanceled(address user, uint256 timestamp)",
  "event InspectionRequested(address contractAddress, address lessee, uint256 timestamp)"
];

// Load contract address from deployed contract
const loadContractInfo = async (): Promise<ContractData | null> => {
  try {
    const response = await fetch("/contract-address.json");
    const contractData: ContractData = await response.json();
    CONTRACT_ADDRESS = contractData.address;
    return contractData;
  } catch (error) {
    console.warn("Could not load contract address, using default:", error);
    return null;
  }
};

interface EthereumProvider {
  isMetaMask?: boolean;
  request?: (args: any) => Promise<any>;
  [key: string]: any;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Extended contract information for UI display
export interface ContractDetails {
  lessor: string;
  lessee: string;
  inspector: string;
  status: ContractStatus;
  car: CarInfo;
  rental: RentalInfo;
  timeInfo: TimeInfo;
  inspectionInfo: InspectionInfo;
  balance: string;
}

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum as any);
      } catch (error) {
        console.warn("Failed to initialize provider:", error);
        this.provider = null;
      }
    }
  }

  async connectWallet() {
    // Check for MetaMask
    if (typeof window === "undefined") {
      throw new Error("This application requires a browser environment");
    }

    if (!window.ethereum) {
      throw new Error("MetaMask not found. Please install MetaMask extension from https://metamask.io/");
    }

    if (!this.provider) {
      this.provider = new ethers.BrowserProvider(window.ethereum as any);
    }

    try {
      // Request account access
      await window.ethereum.request?.({ method: "eth_requestAccounts" });

      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);

      // Load contract info
      await loadContractInfo();

      return {
        address,
        balance: ethers.formatEther(balance),
        network: await this.getNetworkName(),
      };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }

  private async getNetworkName(): Promise<string> {
    if (!this.provider) return "Unknown";
    const network = await this.provider.getNetwork();
    const chainId = Number(network.chainId);
    
    switch (chainId) {
      case 1: return "Ethereum Mainnet";
      case 5: return "Goerli Testnet";
      case 11155111: return "Sepolia Testnet";
      case 80001: return "Mumbai Testnet";
      case 1337: return "Localhost";
      default: return `Chain ID: ${chainId}`;
    }
  }

  async getContract(contractAddress?: string): Promise<ethers.Contract> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    const address = contractAddress || CONTRACT_ADDRESS;
    return new ethers.Contract(address, CONTRACT_ABI, this.signer);
  }

  // Contract interaction methods
  async activateContract(contractAddress: string, depositAmount: string) {
    const contract = await this.getContract(contractAddress);
    const tx = await contract.activateContract({
      value: ethers.parseEther(depositAmount)
    });
    return await tx.wait();
  }

  async returnCar(contractAddress: string) {
    const contract = await this.getContract(contractAddress);
    const tx = await contract.returnCar();
    return await tx.wait();
  }

  async inspectCar(contractAddress: string, isDamaged: boolean, compensationAmount: string) {
    const contract = await this.getContract(contractAddress);
    const compensation = isDamaged ? ethers.parseEther(compensationAmount) : 0;
    const tx = await contract.inspectCar(isDamaged, compensation);
    return await tx.wait();
  }

  async finalizeContract(contractAddress: string) {
    const contract = await this.getContract(contractAddress);
    const tx = await contract.finalizeContract();
    return await tx.wait();
  }

  async cancelContract(contractAddress: string) {
    const contract = await this.getContract(contractAddress);
    const tx = await contract.cancelContract();
    return await tx.wait();
  }

  // Read-only methods
  async getContractDetails(contractAddress?: string): Promise<ContractDetails> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    const address = contractAddress || CONTRACT_ADDRESS;
    const contract = new ethers.Contract(address, CONTRACT_ABI, this.provider);

    // Get all contract information
    const [
      lessor,
      lessee,
      inspector,
      status,
      carInfo,
      rentalInfo,
      timeInfo,
      inspectionInfo,
      balance
    ] = await Promise.all([
      contract.lessor(),
      contract.lessee(),
      contract.inspector(),
      contract.status(),
      contract.getCarInfo(),
      contract.getRentalInfo(),
      contract.getTimeInfo(),
      contract.getInspectionInfo(),
      this.provider.getBalance(address)
    ]);

    return {
      lessor,
      lessee,
      inspector,
      status: Number(status),
      car: {
        make: carInfo[0],
        model: carInfo[1],
        year: Number(carInfo[2])
      },
      rental: {
        pricePerDay: ethers.formatEther(rentalInfo[0]),
        rentalDuration: Number(rentalInfo[1]),
        depositAmount: ethers.formatEther(rentalInfo[2]),
        latePenaltyRate: ethers.formatEther(rentalInfo[3]),
        earlyDepreciationRate: ethers.formatEther(rentalInfo[4])
      },
      timeInfo: {
        startTime: Number(timeInfo[0]),
        dueTime: Number(timeInfo[1]),
        returnTime: Number(timeInfo[2])
      },
      inspectionInfo: {
        isDamaged: inspectionInfo[0],
        compensationAmount: ethers.formatEther(inspectionInfo[1])
      },
      balance: ethers.formatEther(balance)
    };
  }

  async getWalletAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }
    return await this.signer.getAddress();
  }

  async getContractAddress(): Promise<string> {
    await loadContractInfo();
    return CONTRACT_ADDRESS;
  }

  // Alias method for backward compatibility
  async getContractInfo(contractAddress?: string): Promise<ContractDetails> {
    return await this.getContractDetails(contractAddress);
  }

  // Event listening
  subscribeToEvents(contractAddress: string, callback: (event: any) => void) {
    if (!this.provider) return;

    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.provider);
    
    // Listen to all events
    contract.on("*", (event) => {
      callback(event);
    });

    return () => {
      contract.removeAllListeners();
    };
  }
}

// Singleton instance
export const web3Service = new Web3Service();
