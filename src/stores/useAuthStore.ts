import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import type { User, Company, UserRole, AuthState } from '@/types';

const API_URL = 'https://franca-backend-ecaz.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth-token');
    }
    return Promise.reject(error);
  }
);

interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  taxId: string;
  address?: string;
  directorName?: string;
  directorEmail?: string;
  number?: string; // Added this field to match what RegisterPage sends
  phone?: string;  // Keep for backward compatibility
  kybDocs?: Array<{
    documentType: 'NIU' | 'RCCM';
    documentUrl: string;
  }>;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  companyName?: string;
  phone?: string;
  address?: string;
  directorName?: string;
  directorEmail?: string;
  website?: string;
  description?: string;
  yearEstablished?: number;
  avatar?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface AuthStore extends AuthState {
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshCompanyData: () => Promise<Company | null>;
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
  changePassword: (data: ChangePasswordData) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string | null>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// Helper function to transform backend company to frontend Company type
const transformBackendCompany = (backendCompany: any): Company | null => {
  if (!backendCompany) return null;

  return {
    id: backendCompany._id || backendCompany.id,
    _id: backendCompany._id,
    name: backendCompany.name || '',
    taxId: backendCompany.taxId || '',
    email: backendCompany.email || '',
    phone: backendCompany.phone || backendCompany.number || '', // Handle both phone and number
    address: backendCompany.address || 'Douala',
    directorName: backendCompany.directorName || '',
    directorEmail: backendCompany.directorEmail || '',
    status: backendCompany.status || 'PENDING',
    kybDocs: (backendCompany.kybDocs || []).map((doc: any) => ({
      id: doc._id || doc.id,
      type: doc.documentType || doc.type || 'OTHER',
      name: doc.name || `${doc.documentType || 'Document'} - ${new Date(doc.uploadedAt).toLocaleDateString()}`,
      url: doc.documentUrl || doc.url,
      uploadedAt: doc.uploadedAt || new Date().toISOString(),
    })),
    website: backendCompany.website || '',
    description: backendCompany.description || '',
    yearEstablished: backendCompany.yearEstablished || null,
    avatar: backendCompany.avatar || '',
    createdAt: backendCompany.createdAt || new Date().toISOString(),
    updatedAt: backendCompany.updatedAt || new Date().toISOString(),
  };
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // AuthState fields
      user: null,
      company: null,
      token: null,
      isAuthenticated: false,

      // Additional fields
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post('/auth/login', { email, password });
          const data = response.data;

          // Transform company data
          const transformedCompany = transformBackendCompany(data.company);

          set({
            user: data.user,
            company: transformedCompany,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          if (data.token) {
            localStorage.setItem('auth-token', data.token);
          }

          return true;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Login failed',
          });
          return false;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          // Log what we received from RegisterPage
          console.log('Register method received userData:', userData);

          // Prepare data for backend - FIXED: Check for both number and phone fields
          const registrationData = {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            directorName: userData.directorName || userData.name,
            directorEmail: userData.directorEmail || userData.email,
            // First try to use number field, fall back to phone, then empty string
            number: userData.number || userData.phone || '',
            companyName: userData.companyName,
            taxId: userData.taxId,
            address: userData.address || 'Douala',
            kybDocs: userData.kybDocs || [],
          };

          console.log('Sending to backend:', JSON.stringify(registrationData, null, 2));

          const response = await api.post('/auth/register', registrationData);
          const data = response.data;

          // Transform company data
          const transformedCompany = transformBackendCompany(data.company);

          set({
            user: data.user,
            company: transformedCompany,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          if (data.token) {
            localStorage.setItem('auth-token', data.token);
          }

          return true;
        } catch (error: any) {
          // Log the complete error details
          console.error('Registration error - Full details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
            config: {
              url: error.config?.url,
              method: error.config?.method,
              data: error.config?.data
            }
          });

          // Extract error message from response
          let errorMessage = 'Registration failed';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.message) {
            errorMessage = error.message;
          }

          set({
            isLoading: false,
            error: errorMessage,
          });

          return false;
        }
      },

      fetchProfile: async () => {
        const token = get().token || localStorage.getItem('auth-token');

        if (!token) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          const response = await api.get('/auth/profile');
          const data = response.data;

          // Transform company data
          const transformedCompany = transformBackendCompany(data.company);

          set({
            user: data.user,
            company: transformedCompany,
            token: token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Profile fetch error:', error);

          // Only logout if it's an authentication error
          if (error.response?.status === 401) {
            get().logout();
          } else {
            set({
              isLoading: false,
              error: error.response?.data?.message || error.message || 'Failed to fetch profile'
            });
          }
        }
      },

      refreshCompanyData: async () => {
        const token = get().token || localStorage.getItem('auth-token');

        if (!token) {
          console.error('No token found for refresh');
          return null;
        }

        set({ isLoading: true });

        try {
          console.log('Refreshing company data...');
          const response = await api.get('/auth/profile');
          const data = response.data;

          // Transform company data
          const transformedCompany = transformBackendCompany(data.company);

          console.log('Refreshed company data:', transformedCompany);

          set({
            user: data.user,
            company: transformedCompany,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return transformedCompany;
        } catch (error: any) {
          console.error('Failed to refresh company data:', error);

          if (error.response?.status === 401) {
            get().logout();
          } else {
            set({
              isLoading: false,
              error: error.response?.data?.message || error.message || 'Failed to refresh company data'
            });
          }

          return null;
        }
      },

      // Update profile method
      updateProfile: async (data: UpdateProfileData) => {
        const { company } = get();

        if (!company?.id) {
          set({ error: 'Company ID not found' });
          return false;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await api.put(`/companies/${company.id}`, {
            name: data.companyName,
            phone: data.phone,
            address: data.address,
            directorName: data.directorName,
            directorEmail: data.directorEmail,
            website: data.website,
            description: data.description,
            yearEstablished: data.yearEstablished,
            avatar: data.avatar,
          });

          // Refresh company data
          await get().refreshCompanyData();

          set({ isLoading: false });
          return true;
        } catch (error: any) {
          console.error('Profile update error:', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to update profile',
          });
          return false;
        }
      },

      // Change password method
      changePassword: async (data: ChangePasswordData) => {
        set({ isLoading: true, error: null });

        try {
          await api.post('/auth/change-password', {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          });

          set({ isLoading: false });
          return true;
        } catch (error: any) {
          console.error('Password change error:', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to change password',
          });
          return false;
        }
      },

      // Upload avatar method
      uploadAvatar: async (file: File): Promise<string | null> => {
        set({ isLoading: true, error: null });

        try {
          // Upload to Cloudinary directly from frontend
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'blisssz');
          formData.append('folder', 'timber-platform/avatars');

          const cloudinaryResponse = await axios.post(
            'https://api.cloudinary.com/v1_1/dsewg9nlw/image/upload',
            formData
          );

          const avatarUrl = cloudinaryResponse.data.secure_url;

          // Update user's avatar in your backend
          const response = await api.put('/auth/avatar', { avatarUrl });

          // Update local state
          set((state) => ({
            user: state.user ? { ...state.user, avatar: avatarUrl } : null,
            isLoading: false,
          }));

          return avatarUrl;
        } catch (error: any) {
          console.error('Avatar upload error:', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Failed to upload avatar',
          });
          return null;
        }
      },

      initialize: async () => {
        const token = localStorage.getItem('auth-token');
        const { user, isAuthenticated } = get();

        // If we have a token but no user, fetch profile
        if (token && !user && !isAuthenticated) {
          await get().fetchProfile();
        } else if (!token) {
          // No token, ensure we're not in a loading state
          set({ isLoading: false });
        }
      },

      logout: () => {
        localStorage.removeItem('auth-token');
        set({
          user: null,
          company: null,
          token: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        company: state.company,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useCompany = () => useAuthStore((state) => state.company);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useUserRole = (): UserRole | null => useAuthStore((state) => state.user?.role || null);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useRefreshCompanyData = () => useAuthStore((state) => state.refreshCompanyData);
export const useUpdateProfile = () => useAuthStore((state) => state.updateProfile);
export const useChangePassword = () => useAuthStore((state) => state.changePassword);
export const useUploadAvatar = () => useAuthStore((state) => state.uploadAvatar);

// Hook for auth initialization
export const useAuthInitializer = () => {
  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const refreshCompanyData = useAuthStore((state) => state.refreshCompanyData);

  return { initialize, isLoading, isAuthenticated, refreshCompanyData };
};

// For debugging
if (process.env.NODE_ENV === 'development') {
  (window as any).useAuthStore = useAuthStore;
}