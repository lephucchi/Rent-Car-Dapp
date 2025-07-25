import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiService } from "../services/api";
import type { User } from "../types";

interface AuthState {
  // Auth state
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    display_name: string;
  }) => Promise<void>;
  logout: () => void;
  connectMetamask: (metamask_address: string) => Promise<void>;
  loadProfile: () => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (username: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiService.login({ username_or_email: username, password });
          
          // Store token in localStorage
          localStorage.setItem('auth_token', response.access_token);
          
          set({
            isAuthenticated: true,
            user: response.user,
            token: response.access_token,
            isLoading: false
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ 
            error: errorMessage, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiService.register(userData);
          
          // Store token in localStorage
          localStorage.setItem('auth_token', response.access_token);
          
          set({
            isAuthenticated: true,
            user: response.user,
            token: response.access_token,
            isLoading: false
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({ 
            error: errorMessage, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null
        });
      },

      connectMetamask: async (metamask_address: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiService.connectMetamask(metamask_address);
          
          set({
            user: response.user,
            isLoading: false
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to connect Metamask';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      loadProfile: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            return;
          }

          set({ isLoading: true, error: null });
          
          const response = await apiService.getProfile();
          
          set({
            isAuthenticated: true,
            user: response.user,
            token,
            isLoading: false
          });
        } catch (error) {
          // Token might be expired or invalid
          localStorage.removeItem('auth_token');
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: null
          });
        }
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
