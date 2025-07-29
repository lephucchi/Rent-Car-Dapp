const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({
        error: 'An unexpected error occurred'
      }));
      throw new Error(errorData.error || errorData.detail || 'Request failed');
    }
    return response.json();
  }

  async getContractStatus(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/contract/status`, {
      headers: { 'Content-Type': 'application/json' }
    });
    return this.handleResponse<any>(response);
  }

  async getHardhatAccounts(): Promise<{ accounts: any[] }> {
    const response = await fetch(`${API_BASE_URL}/contract/accounts`, {
      headers: { 'Content-Type': 'application/json' }
    });
    return this.handleResponse<{ accounts: any[] }>(response);
  }

  async startRental(renter_address: string, private_key: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/contract/start-rental`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ renter_address, private_key })
    });
    return this.handleResponse<any>(response);
  }

  async endRental(owner_address: string, private_key: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/contract/end-rental`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner_address, private_key })
    });
    return this.handleResponse<any>(response);
  }

  async getAccountBalance(address: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/contract/balance/${address}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    return this.handleResponse<any>(response);
  }

  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return this.handleResponse<{ status: string; service: string; version: string }>(response);
  }
}

export const apiService = new ApiService();
