const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  address: string;
  wallet_address?: string;
  user_type: 'renter' | 'lessor' | 'insurance' | 'admin';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  wallet_address?: string;
  user_type: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }
    
    return data;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async register(userData: RegisterData): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse<{ user: User }>(response);
  }

  async login(credentials: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials),
    });

    const result = await this.handleResponse<AuthResponse>(response);
    
    if (result.success && result.data.token) {
      this.token = result.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return result;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  async updateProfile(updateData: Partial<User>): Promise<ApiResponse<User>> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return this.handleResponse<User>(response);
  }

  async linkWallet(walletAddress: string): Promise<ApiResponse<User>> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/link-wallet`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ wallet_address: walletAddress }),
    });

    return this.handleResponse<User>(response);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    return this.handleResponse<null>(response);
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    const result = await this.handleResponse<{ token: string }>(response);
    
    if (result.success && result.data.token) {
      this.token = result.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return result;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
}

export const authService = new AuthService();
