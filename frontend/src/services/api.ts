import type { User, AuthResponse, ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: 'An unexpected error occurred'
      }));
      throw new Error(errorData.error || 'Request failed');
    }
    return response.json();
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    displayName: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async login(credentials: {
    username: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials)
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async getProfile(): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ user: User }>(response);
  }

  async connectMetamask(metamaskId: string): Promise<{ message: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/connect-metamask`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ metamaskId })
    });
    return this.handleResponse<{ message: string; user: User }>(response);
  }

  async getPendingInspections(): Promise<{ contracts: string[] }> {
    const response = await fetch(`${API_BASE_URL}/inspections/pending`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ contracts: string[] }>(response);
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return this.handleResponse<{ status: string; timestamp: string }>(response);
  }
}

export const apiService = new ApiService();
