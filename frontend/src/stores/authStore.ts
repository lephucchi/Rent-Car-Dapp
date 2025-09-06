import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type User, type LoginData, type RegisterData } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginData) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  linkWallet: (walletAddress: string) => Promise<void>;
  updateProfile: (updateData: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.login(credentials);
          
          if (response.success) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.register(userData);
          
          if (response.success) {
            set({ isLoading: false });
            // Note: User needs to verify email before they can login
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          
          await authService.logout();
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Even if logout request fails, clear local state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      loadUser: async () => {
        try {
          if (!authService.isAuthenticated()) {
            set({ isAuthenticated: false, user: null });
            return;
          }

          set({ isLoading: true, error: null });
          
          const response = await authService.getProfile();
          
          if (response.success) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Failed to load user');
          }
        } catch (error) {
          // If loading user fails, likely token is invalid
          authService.clearToken();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load user',
          });
        }
      },

      linkWallet: async (walletAddress: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.linkWallet(walletAddress);
          
          if (response.success) {
            set({
              user: response.data,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Failed to link wallet');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to link wallet',
            isLoading: false,
          });
          throw error;
        }
      },

      updateProfile: async (updateData: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.updateProfile(updateData);
          
          if (response.success) {
            set({
              user: response.data,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Failed to update profile');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update profile',
            isLoading: false,
          });
          throw error;
        }
      },

      initialize: async () => {
        const token = authService.getToken();
        if (token && authService.isAuthenticated()) {
          try {
            const response = await authService.getProfile();
            if (response.success) {
              set({
                user: response.data,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              // Token invalid, clear it
              authService.clearToken();
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } catch (error) {
            // Token invalid, clear it
            authService.clearToken();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
