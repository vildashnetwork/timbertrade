import { create } from 'zustand';
import axios from 'axios';
import type { Company, KYBDocument } from '@/types';
import { toast } from 'sonner';

const API_URL = 'https://franca-backend-ecaz.onrender.com/api';
const CLOUDINARY_CLOUD_NAME = 'dsewg9nlw';
const CLOUDINARY_UPLOAD_PRESET = 'blisssz';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

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
            localStorage.removeItem('auth-token');
        }
        return Promise.reject(error);
    }
);

interface CompanyStore {
    // State
    companies: Company[];
    pendingCompanies: Company[];
    selectedCompany: Company | null;
    isLoading: boolean;
    error: string | null;
    uploadProgress: number;

    // Actions
    fetchPendingCompanies: () => Promise<void>;
    fetchAllCompanies: () => Promise<void>;
    fetchCompanyById: (id: string) => Promise<Company | null>;
    approveCompany: (id: string) => Promise<boolean>;
    rejectCompany: (id: string) => Promise<boolean>;
    uploadKYBDocument: (companyId: string, file: File, documentType: string) => Promise<boolean>;
    uploadDocumentToCloudinary: (file: File) => Promise<string>;
    clearError: () => void;
    clearSelectedCompany: () => void;
}

// Helper function to transform backend company to frontend Company type
const transformBackendCompany = (backendCompany: any): Company => {
    if (!backendCompany) return null as any;

    return {
        id: backendCompany._id || backendCompany.id,
        _id: backendCompany._id,
        name: backendCompany.name || '',
        taxId: backendCompany.taxId || '',
        email: backendCompany.email || '',
        phone: backendCompany.phone || '',
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
        createdAt: backendCompany.createdAt || new Date().toISOString(),
        updatedAt: backendCompany.updatedAt || new Date().toISOString(),
    };
};

export const useCompanyStore = create<CompanyStore>((set, get) => ({
    companies: [],
    pendingCompanies: [],
    selectedCompany: null,
    isLoading: false,
    error: null,
    uploadProgress: 0,

    clearError: () => set({ error: null }),

    clearSelectedCompany: () => set({ selectedCompany: null }),

    uploadDocumentToCloudinary: async (file: File): Promise<string> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'timber-platform/kyb-docs');

            const response = await axios.post(CLOUDINARY_URL, formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        set({ uploadProgress: percentCompleted });
                    }
                },
            });

            set({ uploadProgress: 0 });
            return response.data.secure_url;
        } catch (error: any) {
            console.error('Cloudinary upload error:', error);
            set({ error: `Failed to upload document: ${error.message}` });
            throw error;
        }
    },

    uploadKYBDocument: async (companyId: string, file: File, documentType: string) => {
        if (!companyId) {
            set({ error: 'Company ID is required' });
            return false;
        }

        set({ isLoading: true, error: null });

        try {
            // Upload document to Cloudinary
            const documentUrl = await get().uploadDocumentToCloudinary(file);

            // Send document info to backend
            const response = await api.post(`/companies/${companyId}/documents`, {
                documentType,
                documentUrl,
            });

            console.log('Document upload response:', response.data);

            // Update company in state if it's the selected one
            if (get().selectedCompany?.id === companyId) {
                const transformedCompany = transformBackendCompany(response.data.company || response.data);
                set({ selectedCompany: transformedCompany });
            }

            // Refresh companies list
            await get().fetchAllCompanies();
            await get().fetchPendingCompanies();

            set({ isLoading: false });
            toast.success('Document uploaded successfully');
            return true;
        } catch (error: any) {
            console.error('Upload document error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            const errorMessage = error.response?.data?.message || error.message || 'Failed to upload document';
            set({
                isLoading: false,
                error: errorMessage,
            });
            toast.error(errorMessage);
            return false;
        }
    },

    fetchPendingCompanies: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await api.get('/companies/pending');
            const data = response.data;

            const companiesList = Array.isArray(data) ? data : [];
            const transformedCompanies = companiesList.map(transformBackendCompany);

            set({
                pendingCompanies: transformedCompanies,
                isLoading: false,
            });

            console.log('Fetched pending companies:', transformedCompanies);
        } catch (error: any) {
            console.error('Fetch pending companies error:', error);
            if (error.response?.status === 404) {
                set({ isLoading: false, pendingCompanies: [] });
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch pending companies';
                set({
                    isLoading: false,
                    error: errorMessage,
                });
                toast.error(errorMessage);
            }
        }
    },

    fetchAllCompanies: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await api.get('/companies');
            const data = response.data;

            const companiesList = Array.isArray(data) ? data : data.companies || [];
            const transformedCompanies = companiesList.map(transformBackendCompany);

            set({
                companies: transformedCompanies,
                isLoading: false,
            });

            console.log('Fetched all companies:', transformedCompanies);
        } catch (error: any) {
            console.error('Error fetching companies:', error);
            if (error.response?.status === 404) {
                console.log('Companies endpoint not implemented yet');
                set({ isLoading: false, companies: [] });
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch companies';
                set({
                    isLoading: false,
                    error: errorMessage,
                });
                toast.error(errorMessage);
            }
        }
    },

    fetchCompanyById: async (id: string) => {
        // Don't fetch if ID is undefined or invalid
        if (!id || id === 'undefined' || id === 'null') {
            console.error('Invalid company ID:', id);
            set({ error: 'Invalid company ID' });
            return null;
        }

        set({ isLoading: true, error: null });

        try {
            console.log('Fetching company with ID:', id);
            const response = await api.get(`/companies/${id}`);
            const company = response.data;

            const transformedCompany = transformBackendCompany(company);

            set({
                selectedCompany: transformedCompany,
                isLoading: false,
            });

            console.log('Fetched company details:', transformedCompany);
            return transformedCompany;
        } catch (error: any) {
            console.error('Error fetching company:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            if (error.response?.status === 403) {
                console.log('Permission denied fetching company details');
                set({
                    isLoading: false,
                    error: null
                });
                return null;
            }

            if (error.response?.status === 404) {
                set({
                    isLoading: false,
                    error: 'Company not found'
                });
                return null;
            }

            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch company';
            set({
                isLoading: false,
                error: errorMessage,
            });
            return null;
        }
    },

    approveCompany: async (id: string) => {
        if (!id) {
            set({ error: 'Company ID is required' });
            return false;
        }

        set({ isLoading: true, error: null });

        try {
            console.log('Approving company with ID:', id);

            const response = await api.put(`/companies/${id}/status`, {
                status: 'APPROVED',
            });

            console.log('Approve response:', response.data);

            // Update lists
            await get().fetchPendingCompanies();
            await get().fetchAllCompanies();

            if (get().selectedCompany?.id === id) {
                const transformedCompany = transformBackendCompany(response.data.company || response.data);
                set({ selectedCompany: transformedCompany });
            }

            set({ isLoading: false });
            toast.success('Company approved successfully');
            return true;
        } catch (error: any) {
            console.error('Approve company error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            const errorMessage = error.response?.data?.message || error.message || 'Failed to approve company';
            set({
                isLoading: false,
                error: errorMessage,
            });
            toast.error(errorMessage);
            return false;
        }
    },

    rejectCompany: async (id: string) => {
        if (!id) {
            set({ error: 'Company ID is required' });
            return false;
        }

        set({ isLoading: true, error: null });

        try {
            console.log('Suspending company with ID:', id);
            console.log('Request payload:', { status: 'SUSPENDED' });

            const response = await api.put(`/companies/${id}/status`, {
                status: 'SUSPENDED',
            });

            console.log('Suspend response:', response.data);

            // Update lists
            await get().fetchPendingCompanies();
            await get().fetchAllCompanies();

            if (get().selectedCompany?.id === id) {
                const transformedCompany = transformBackendCompany(response.data.company || response.data);
                set({ selectedCompany: transformedCompany });
            }

            set({ isLoading: false });
            toast.success('Company suspended successfully');
            return true;
        } catch (error: any) {
            console.error('Suspend company error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            // Extract the actual error message from the response
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Failed to suspend company';

            console.log('Error message from server:', errorMessage);

            set({
                isLoading: false,
                error: errorMessage,
            });
            toast.error(errorMessage);
            return false;
        }
    },
}));

// Helper hooks
export const usePendingCompanies = () => useCompanyStore((state) => state.pendingCompanies);
export const useCompanies = () => useCompanyStore((state) => state.companies);
export const useSelectedCompany = () => useCompanyStore((state) => state.selectedCompany);
export const useCompanyLoading = () => useCompanyStore((state) => state.isLoading);
export const useCompanyError = () => useCompanyStore((state) => state.error);
export const useUploadProgress = () => useCompanyStore((state) => state.uploadProgress);

// For debugging
if (process.env.NODE_ENV === 'development') {
    (window as any).useCompanyStore = useCompanyStore;
}