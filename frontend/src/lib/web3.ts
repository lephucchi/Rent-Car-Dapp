import { ethers } from "ethers";

// Default contract address (will be updated after deployment)
let CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let CONTRACT_ABI: any[] = [];

// Load contract info from deployed contract
const loadContractInfo = async () => {
  try {
    const response = await fetch("/src/contracts/CarRental.json");
    const contractData = await response.json();
    CONTRACT_ADDRESS = contractData.address;
    CONTRACT_ABI = contractData.abi;
    return contractData;
  } catch (error) {
    console.warn("Could not load contract info:", error);
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

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;

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

      // Load contract info and initialize contract
      await loadContractInfo();
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.signer,
      );

      return {
        address,
        balance: ethers.formatEther(balance),
        network: "Localhost",
      };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }

  async listCar(carData: {
    make: string;
    model: string;
    year: number;
    pricePerDay: string;
    location: string;
    imageUrl: string;
  }) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    const priceInWei = ethers.parseEther(carData.pricePerDay);

    const tx = await this.contract.listCar(
      carData.make,
      carData.model,
      carData.year,
      priceInWei,
      carData.location,
      carData.imageUrl,
    );

    const receipt = await tx.wait();
    return receipt;
  }

  async rentCar(
    carId: string,
    startDate: Date,
    endDate: Date,
    totalPrice: number,
  ) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);
    const priceInWei = ethers.parseEther(totalPrice.toString());

    const tx = await this.contract.rentCar(
      carId,
      startTimestamp,
      endTimestamp,
      { value: priceInWei },
    );

    const receipt = await tx.wait();
    return receipt;
  }

  async getAllCars() {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    const cars = await this.contract.getAllCars();
    return cars.map((car: any) => ({
      id: car.id.toString(),
      owner: car.owner,
      make: car.make,
      model: car.model,
      year: Number(car.year),
      pricePerDay: parseFloat(ethers.formatEther(car.pricePerDay)),
      location: car.location,
      image: car.imageUrl,
      available: car.available,
      rating: 4.5,
      features: ["Smart Contract", "Blockchain Secure"],
      description: `${car.make} ${car.model} available for rent`,
    }));
  }

  async getAvailableCars() {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    const cars = await this.contract.getAvailableCars();
    return cars.map((car: any) => ({
      id: car.id.toString(),
      owner: car.owner,
      make: car.make,
      model: car.model,
      year: Number(car.year),
      pricePerDay: parseFloat(ethers.formatEther(car.pricePerDay)),
      location: car.location,
      image: car.imageUrl,
      available: car.available,
      rating: 4.5,
      features: ["Smart Contract", "Blockchain Secure"],
      description: `${car.make} ${car.model} available for rent`,
    }));
  }

  async getUserCars(address: string) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    const cars = await this.contract.getUserCars(address);
    return cars.map((car: any) => ({
      id: car.id.toString(),
      owner: car.owner,
      make: car.make,
      model: car.model,
      year: Number(car.year),
      pricePerDay: parseFloat(ethers.formatEther(car.pricePerDay)),
      location: car.location,
      image: car.imageUrl,
      available: car.available,
      rating: 4.5,
      features: ["Smart Contract", "Blockchain Secure"],
      description: `${car.make} ${car.model}`,
    }));
  }

  async getActiveRentals() {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    const rentals = await this.contract.getActiveRentals();
    const activeRentals = [];

    for (const rental of rentals) {
      const car = await this.contract.getCar(rental.carId);

      activeRentals.push({
        id: rental.id.toString(),
        carId: rental.carId.toString(),
        car: {
          id: car.id.toString(),
          owner: car.owner,
          make: car.make,
          model: car.model,
          year: Number(car.year),
          pricePerDay: parseFloat(ethers.formatEther(car.pricePerDay)),
          location: car.location,
          image: car.imageUrl,
          available: car.available,
          rating: 4.5,
          features: ["Smart Contract", "Blockchain Secure"],
          description: `${car.make} ${car.model}`,
        },
        renter: rental.renter,
        owner: rental.owner,
        startDate: new Date(Number(rental.startDate) * 1000).toISOString(),
        endDate: new Date(Number(rental.endDate) * 1000).toISOString(),
        duration: Math.ceil(
          (Number(rental.endDate) - Number(rental.startDate)) / 86400,
        ),
        totalPrice: parseFloat(ethers.formatEther(rental.totalPrice)),
        status: "active",
        txHash: "0x" + Math.random().toString(16).substr(2, 64),
      });
    }

    return activeRentals;
  }
}

export const web3Service = new Web3Service();

export const isMetaMaskInstalled = () => {
  return typeof window !== "undefined" && Boolean(window.ethereum?.isMetaMask);
};
