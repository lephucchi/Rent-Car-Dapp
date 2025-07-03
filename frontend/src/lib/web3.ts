import { ethers } from "ethers";

// Default contract address (will be updated after deployment)
let CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Car Rental Contract ABI (updated for our contract)
const CONTRACT_ABI = [
  "constructor(string memory _make, string memory _model, uint256 _year, uint256 _pricePerDay, uint256 _rentalDuration, uint256 _depositAmount, uint256 _latePenaltyRate, uint256 _earlyDepreciationRate)",
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
const loadContractInfo = async () => {
  try {
    const response = await fetch("/contract-address.json");
    const contractData = await response.json();
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

export enum ContractStatus {
  Pending = 0,
  Active = 1,
  Returned = 2,
  Completed = 3,
  Canceled = 4
}

export interface CarInfo {
  make: string;
  model: string;
  year: number;
}

export interface RentalInfo {
  pricePerDay: string;
  rentalDuration: number;
  depositAmount: string;
  latePenaltyRate: string;
  earlyDepreciationRate: string;
}

export interface ContractInfo {
  lessor: string;
  lessee: string;
  inspector: string;
  status: ContractStatus;
  car: CarInfo;
  rental: RentalInfo;
  startTime: number;
  dueTime: number;
  returnTime: number;
  isDamaged: boolean;
  compensationAmount: string;
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
      this.provider = new ethers.BrowserProvider(window.ethereum as any);
    }
  }

  async connectWallet() {
    if (!this.provider) {
      throw new Error("MetaMask not found. Please install MetaMask.");
    }

    try {
      // Request account access
      if (!window.ethereum) throw new Error("MetaMask not found");
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

  // View functions
  async getContractInfo(contractAddress: string): Promise<ContractInfo> {
    const contract = await this.getContract(contractAddress);
    
    const [carInfo, rentalInfo, timeInfo, inspectionInfo] = await Promise.all([
      contract.getCarInfo(),
      contract.getRentalInfo(),
      contract.getTimeInfo(),
      contract.getInspectionInfo()
    ]);

    const [lessor, lessee, inspector, status, balance] = await Promise.all([
      contract.lessor(),
      contract.lessee(),
      contract.inspector(),
      contract.status(),
      contract.getContractBalance()
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
      startTime: Number(timeInfo[0]),
      dueTime: Number(timeInfo[1]),
      returnTime: Number(timeInfo[2]),
      isDamaged: inspectionInfo[0],
      compensationAmount: ethers.formatEther(inspectionInfo[1]),
      balance: ethers.formatEther(balance)
    };
  }

  async getCarInfo(contractAddress: string): Promise<CarInfo> {
    const contract = await this.getContract(contractAddress);
    const carInfo = await contract.getCarInfo();
    return {
      make: carInfo[0],
      model: carInfo[1],
      year: Number(carInfo[2])
    };
  }

  async getRentalInfo(contractAddress: string): Promise<RentalInfo> {
    const contract = await this.getContract(contractAddress);
    const rentalInfo = await contract.getRentalInfo();
    return {
      pricePerDay: ethers.formatEther(rentalInfo[0]),
      rentalDuration: Number(rentalInfo[1]),
      depositAmount: ethers.formatEther(rentalInfo[2]),
      latePenaltyRate: ethers.formatEther(rentalInfo[3]),
      earlyDepreciationRate: ethers.formatEther(rentalInfo[4])
    };
  }

  // Event listeners
  async listenToContractEvents(contractAddress: string, callback: (event: any) => void) {
    const contract = await this.getContract(contractAddress);
    
    contract.on("ContractActivated", (lessee, timestamp, event) => {
      callback({ type: "ContractActivated", lessee, timestamp, event });
    });

    contract.on("CarReturned", (lessee, timestamp, event) => {
      callback({ type: "CarReturned", lessee, timestamp, event });
    });

    contract.on("InspectionCompleted", (isDamaged, compensation, event) => {
      callback({ type: "InspectionCompleted", isDamaged, compensation, event });
    });

    contract.on("ContractFinalized", (totalAmount, event) => {
      callback({ type: "ContractFinalized", totalAmount, event });
    });

    contract.on("ContractCanceled", (lessee, timestamp, event) => {
      callback({ type: "ContractCanceled", lessee, timestamp, event });
    });
  }

  // Utility methods
  async switchToNetwork(chainId: number) {
    if (!window.ethereum) throw new Error("MetaMask not found");
    
    try {
      await window.ethereum.request!({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, add it
        await this.addNetwork(chainId);
      } else {
        throw error;
      }
    }
  }

  private async addNetwork(chainId: number) {
    const networks: {[key: number]: any} = {
      11155111: {
        chainId: '0xaa36a7',
        chainName: 'Sepolia Testnet',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        blockExplorerUrls: ['https://sepolia.etherscan.io/']
      },
      80001: {
        chainId: '0x13881',
        chainName: 'Mumbai Testnet',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com/']
      }
    };

    if (!networks[chainId]) {
      throw new Error(`Network ${chainId} not supported`);
    }

    if (!window.ethereum?.request) {
      throw new Error("MetaMask request method not available");
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networks[chainId]],
    });
  }
}

export const web3Service = new Web3Service();

export const isMetaMaskInstalled = () => {
  return typeof window !== "undefined" && Boolean(window.ethereum?.isMetaMask);
};
