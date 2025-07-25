<<<<<<< HEAD
import type { User, AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
=======
import type { User, AuthResponse, ApiError, ContractStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
>>>>>>> 9de822a7dc7f1a07bfeedfd155dfa26991a02ea5

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({
        error: 'An unexpected error occurred'
      }));
      throw new Error(errorData.error || errorData.detail || 'Request failed');
    }
    return response.json();
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    display_name: string;
  }): Promise<AuthResponse> {
<<<<<<< HEAD
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
=======
    const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
>>>>>>> 9de822a7dc7f1a07bfeedfd155dfa26991a02ea5
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        display_name: userData.displayName
      })
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async login(credentials: {
    username_or_email: string;
    password: string;
  }): Promise<AuthResponse> {
<<<<<<< HEAD
    console.log('API: Attempting login with:', { username: credentials.username });
    console.log('API: API_BASE_URL:', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
=======
    const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
>>>>>>> 9de822a7dc7f1a07bfeedfd155dfa26991a02ea5
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username_or_email: credentials.username,
        password: credentials.password
      })
    });
    
    console.log('API: Login response status:', response.status);
    const result = await this.handleResponse<AuthResponse>(response);
    console.log('API: Login result:', result);
    return result;
  }

<<<<<<< HEAD
  async getProfile(): Promise<User> {
    console.log('API: Getting profile...');
    console.log('API: Token from localStorage:', localStorage.getItem('access_token'));
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
=======
  async getProfile(): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
>>>>>>> 9de822a7dc7f1a07bfeedfd155dfa26991a02ea5
      headers: this.getAuthHeaders()
    });
    
    console.log('API: Profile response status:', response.status);
    const result = await this.handleResponse<User>(response);
    console.log('API: Profile result:', result);
    return result;
  }

<<<<<<< HEAD
  async connectMetamask(metamaskAddress: string): Promise<{ message: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/connect-metamask`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ metamask_address: metamaskAddress })
=======
  async connectMetamask(metamask_address: string): Promise<{ message: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/connect-metamask`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ metamask_address })
>>>>>>> 9de822a7dc7f1a07bfeedfd155dfa26991a02ea5
    });
    return this.handleResponse<{ message: string; user: User }>(response);
  }

<<<<<<< HEAD
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<User[]>(response);
  }

  async getContractStatus(): Promise<{ connected: boolean; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/contract/status`);
    return this.handleResponse<{ connected: boolean; error?: string }>(response);
  }

  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
=======
  async getContractStatus(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/contract/status`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  async getHardhatAccounts(): Promise<{ accounts: any[] }> {
    const response = await fetch(`${API_BASE_URL}/contract/accounts`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ accounts: any[] }>(response);
  }

  async startRental(renter_address: string, private_key: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/contract/start-rental`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ renter_address, private_key })
    });
    return this.handleResponse<any>(response);
  }

  async endRental(owner_address: string, private_key: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/contract/end-rental`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ owner_address, private_key })
    });
    return this.handleResponse<any>(response);
  }

  async getAccountBalance(address: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/contract/balance/${address}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
>>>>>>> 9de822a7dc7f1a07bfeedfd155dfa26991a02ea5
    return this.handleResponse<{ status: string; service: string; version: string }>(response);
  }
}

export const apiService = new ApiService();
