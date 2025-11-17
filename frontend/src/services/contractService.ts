const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface Contract {
  id: string;
  car_id: string;
  lessor_id: string;
  lessee_id?: string;
  damage_assessor_id?: string;
  contract_address?: string;
  transaction_hash?: string;
  rental_fee_per_day: number;
  rental_fee: number;
  deposit: number;
  duration_days: number;
  insurance_fee: number;
  start_time?: string;
  end_time?: string;
  actual_days: number;
  assessed_damage_amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  is_damaged: boolean;
  renter_requested_return: boolean;
  owner_confirmed_return: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  car?: any;
  lessor?: any;
  lessee?: any;
  blockchainStatus?: any;
  events?: ContractEvent[];
}

export interface ContractEvent {
  id: string;
  contract_id: string;
  event_type: string;
  event_data: Record<string, any>;
  transaction_hash: string;
  block_number: number;
  gas_used?: number;
  gas_price?: number;
  created_at: string;
}

export interface CreateContractData {
  car_id: string;
  rental_fee_per_day: number;
  duration_days: number;
  insurance_fee: number;
  damage_assessor_id?: string;
  notes?: string;
}

export interface RentCarData {
  wallet_address: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ContractService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }
    
    return data;
  }

  private getAuthHeaders(): HeadersInit {
    // Always get fresh token from localStorage
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Create a new contract
   */
  async createContract(contractData: CreateContractData): Promise<ApiResponse<{
    contract: Contract;
    deployment: {
      contractAddress: string;
      transactionHash: string;
    };
  }>> {
    const response = await fetch(`${API_BASE_URL}/contracts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(contractData),
    });

    return this.handleResponse(response);
  }

  /**
   * Rent a car (start rental)
   */
  async rentCar(contractId: string, rentData: RentCarData): Promise<ApiResponse<{
    contract: Contract;
    transaction: any;
  }>> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/rent`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(rentData),
    });

    return this.handleResponse(response);
  }

  /**
   * Request return of car
   */
  async requestReturn(contractId: string): Promise<ApiResponse<Contract>> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/request-return`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  /**
   * Confirm return (lessor)
   */
  async confirmReturn(contractId: string): Promise<ApiResponse<Contract>> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/confirm-return`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  /**
   * Report damage
   */
  async reportDamage(contractId: string, description: string): Promise<ApiResponse<Contract>> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/report-damage`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ description }),
    });

    return this.handleResponse(response);
  }

  /**
   * Set actual usage days
   */
  async setActualUsage(contractId: string, actualDays: number): Promise<ApiResponse<Contract>> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/set-usage`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ actual_days: actualDays }),
    });

    return this.handleResponse(response);
  }

  /**
   * Complete rental
   */
  async completeRental(contractId: string, paymentAmount?: string): Promise<ApiResponse<Contract>> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/complete`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ payment_amount: paymentAmount }),
    });

    return this.handleResponse(response);
  }

  /**
   * Cancel contract
   */
  async cancelContract(contractId: string): Promise<ApiResponse<Contract>> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/cancel`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  /**
   * Get contract by ID
   */
  async getContract(contractId: string): Promise<ApiResponse<Contract>> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  /**
   * Get my contracts (as lessor)
   */
  async getMyContracts(limit: number = 10, offset: number = 0): Promise<ApiResponse<Contract[]>> {
    const response = await fetch(
      `${API_BASE_URL}/contracts/my/contracts?limit=${limit}&offset=${offset}`,
      { headers: this.getAuthHeaders() }
    );

    return this.handleResponse(response);
  }

  /**
   * Get my rentals (as lessee)
   */
  async getMyRentals(limit: number = 10, offset: number = 0): Promise<ApiResponse<Contract[]>> {
    const response = await fetch(
      `${API_BASE_URL}/contracts/my/rentals?limit=${limit}&offset=${offset}`,
      { headers: this.getAuthHeaders() }
    );

    return this.handleResponse(response);
  }

  /**
   * Get contract events
   */
  async getContractEvents(contractId: string): Promise<ApiResponse<ContractEvent[]>> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/events`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  /**
   * Get all active contracts
   */
  async getActiveContracts(): Promise<ApiResponse<Contract[]>> {
    const response = await fetch(`${API_BASE_URL}/contracts/active`);
    return this.handleResponse(response);
  }
}

export const contractService = new ContractService();
export default contractService;
