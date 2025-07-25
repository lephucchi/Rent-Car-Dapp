export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  role: 'user' | 'admin' | 'inspector';
  metamask_address?: string;
<<<<<<< HEAD
  wallet_address?: string;
=======
>>>>>>> 9de822a7dc7f1a07bfeedfd155dfa26991a02ea5
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  token_type: string;
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
