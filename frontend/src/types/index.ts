export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  metamaskId?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ContractInfo {
  address: string;
  network: string;
  deployedAt: string;
  inspector: string;
  abi: string[];
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

export interface TimeInfo {
  startTime: number;
  dueTime: number;
  returnTime: number;
}

export interface InspectionInfo {
  isDamaged: boolean;
  compensationAmount: string;
}

export enum ContractStatus {
  Pending = 0,
  Active = 1,
  Returned = 2,
  Completed = 3,
  Canceled = 4
}
