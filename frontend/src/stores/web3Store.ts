import { create } from "zustand";
import { isMetaMaskInstalled, web3Service } from "../lib/web3";

interface Car {
  id: string;
  owner: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  location: string;
  image: string;
  available: boolean;
  rating: number;
  features: string[];
  description: string;
}

interface Web3State {
  // Connection
  isConnected: boolean;
  address: string | null;
  balance: string;
  network: string;
  isMetaMaskInstalled: boolean;

  // Data
  cars: Car[];
  userCars: Car[];
  activeRentals: any[];

  // UI
  isLoading: boolean;
  error: string | null;

  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  listCar: (carData: any) => Promise<void>;
  rentCar: (
    carId: string,
    startDate: Date,
    endDate: Date,
    totalPrice: number,
  ) => Promise<void>;
  loadCars: () => Promise<void>;
  loadUserCars: () => Promise<void>;
  loadActiveRentals: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useWeb3Store = create<Web3State>((set, get) => ({
  // Initial state
  isConnected: false,
  address: null,
  balance: "0",
  network: "",
  isMetaMaskInstalled: isMetaMaskInstalled(),
  cars: [],
  userCars: [],
  activeRentals: [],
  isLoading: false,
  error: null,

  connectWallet: async () => {
    set({ isLoading: true, error: null });

    try {
      if (!get().isMetaMaskInstalled) {
        throw new Error("MetaMask is not installed");
      }

      const { address, balance, network } = await web3Service.connectWallet();

      set({
        isConnected: true,
        address,
        balance,
        network,
        isLoading: false,
      });

      // Load data after connection
      await get().loadCars();
      await get().loadUserCars();
      await get().loadActiveRentals();
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  disconnectWallet: () => {
    set({
      isConnected: false,
      address: null,
      balance: "0",
      network: "",
      cars: [],
      userCars: [],
      activeRentals: [],
      error: null,
    });
  },

  listCar: async (carData) => {
    set({ isLoading: true, error: null });

    try {
      if (!get().isConnected) {
        throw new Error("Please connect your wallet first");
      }

      await web3Service.listCar(carData);

      // Reload data
      await get().loadCars();
      await get().loadUserCars();

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  rentCar: async (carId, startDate, endDate, totalPrice) => {
    set({ isLoading: true, error: null });

    try {
      if (!get().isConnected) {
        throw new Error("Please connect your wallet first");
      }

      await web3Service.rentCar(carId, startDate, endDate, totalPrice);

      // Reload data
      await get().loadCars();
      await get().loadActiveRentals();

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  loadCars: async () => {
    try {
      const cars = await web3Service.getAvailableCars();
      set({ cars });
    } catch (error) {
      console.error("Error loading cars:", error);
    }
  },

  loadUserCars: async () => {
    try {
      const { address } = get();
      if (!address) return;

      const userCars = await web3Service.getUserCars(address);
      set({ userCars });
    } catch (error) {
      console.error("Error loading user cars:", error);
    }
  },

  loadActiveRentals: async () => {
    try {
      const activeRentals = await web3Service.getActiveRentals();
      set({ activeRentals });
    } catch (error) {
      console.error("Error loading active rentals:", error);
    }
  },

  setError: (error) => {
    set({ error });
  },
}));
