import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import type { WoodItem, WoodGrade, WoodFilterOptions, PaginatedResponse } from '@/types';

const API_URL = 'https://franca-backend-ecaz.onrender.com/api';
const CLOUDINARY_CLOUD_NAME = 'dsewg9nlw';
const CLOUDINARY_UPLOAD_PRESET = 'blisssz';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Create axios instance for API
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

// Interface that matches your BACKEND schema
interface BackendWoodData {
    species: string;
    dimensions: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    price: number;
    stock: number; // Note: 'stock' not 'stockLevel'
    images: Array<{
        url: string;
        alt?: string;
    }>;
    description?: string;
    category?: string;
}

// Frontend form data interface (transformed)
interface WoodFormData {
    species: string;
    origin?: string; // Will be mapped to category
    grade: WoodGrade;
    price: number;
    stockLevel: number; // Maps to 'stock' in backend
    dimensions: string; // Will be parsed to dimensions object
    description?: string;
}

interface WoodStore {
    // State
    woodItems: WoodItem[];
    selectedWood: WoodItem | null;
    isLoading: boolean;
    error: string | null;
    uploadProgress: number;
    totalPages: number;
    currentPage: number;
    filters: WoodFilterOptions;

    // Actions
    fetchWoodItems: (page?: number, filters?: WoodFilterOptions) => Promise<void>;
    fetchWoodItemById: (id: string) => Promise<WoodItem | null>;
    createWoodItem: (woodData: WoodFormData, images: File[]) => Promise<boolean>;
    updateWoodItem: (id: string, woodData: Partial<WoodFormData>, newImages?: File[]) => Promise<boolean>;
    deleteWoodItem: (id: string) => Promise<boolean>;
    uploadImagesToCloudinary: (files: File[]) => Promise<Array<{ url: string; alt?: string }>>;
    setFilters: (filters: WoodFilterOptions) => void;
    clearError: () => void;
    clearSelectedWood: () => void;
}

// Helper function to parse dimensions string to object
const parseDimensions = (dimensionsStr: string): { length: number; width: number; height: number; unit: string } => {
    // Expected format: "250cm x 35cm x 35cm" or "250x35x35"
    const match = dimensionsStr.match(/(\d+)(?:cm)?\s*x\s*(\d+)(?:cm)?\s*x\s*(\d+)(?:cm)?/i);
    if (match) {
        return {
            length: parseInt(match[1]),
            width: parseInt(match[2]),
            height: parseInt(match[3]),
            unit: 'cm'
        };
    }
    // Default fallback
    return { length: 0, width: 0, height: 0, unit: 'cm' };
};

// Helper function to transform backend wood item to frontend WoodItem
const transformBackendWood = (backendWood: any): WoodItem => {
    const dimensions = backendWood.dimensions || {};
    const images = backendWood.images?.map((img: any) => img.url) || [];

    // Calculate volume in CBM (cubic meters)
    const volumeCBM = (dimensions.length * dimensions.width * dimensions.height) / 1000000;

    return {
        id: backendWood._id,
        species: backendWood.species,
        origin: backendWood.category || 'Cameroon',
        grade: backendWood.grade || 'A',
        volume: volumeCBM,
        price: backendWood.price,
        images: images,
        status: backendWood.stock > 10 ? 'AVAILABLE' : backendWood.stock > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK',
        stockLevel: backendWood.stock,
        dimensions: `${dimensions.length}${dimensions.unit} x ${dimensions.width}${dimensions.unit} x ${dimensions.height}${dimensions.unit}`,
        description: backendWood.description,
        createdAt: backendWood.createdAt,
        updatedAt: backendWood.updatedAt,
    };
};

export const useWoodStore = create<WoodStore>((set, get) => ({
    woodItems: [],
    selectedWood: null,
    isLoading: false,
    error: null,
    uploadProgress: 0,
    totalPages: 1,
    currentPage: 1,
    filters: {},

    clearError: () => set({ error: null }),

    setFilters: (filters: WoodFilterOptions) => {
        set({ filters });
        get().fetchWoodItems(1, filters);
    },

    uploadImagesToCloudinary: async (files: File[]): Promise<Array<{ url: string; alt?: string }>> => {
        const uploadedImages: Array<{ url: string; alt?: string }> = [];

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                formData.append('folder', 'timber-platform/woods');

                const response = await axios.post(CLOUDINARY_URL, formData, {
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            set({ uploadProgress: percentCompleted });
                        }
                    },
                });

                uploadedImages.push({
                    url: response.data.secure_url,
                    alt: file.name.split('.')[0] // Use filename as alt text
                });
            } catch (error: any) {
                set({ error: `Failed to upload image: ${error.message}` });
                throw error;
            }
        }

        set({ uploadProgress: 0 });
        return uploadedImages;
    },

    fetchWoodItems: async (page: number = 1, filters?: WoodFilterOptions) => {
        set({ isLoading: true, error: null });

        try {
            const currentFilters = filters || get().filters;
            const params = new URLSearchParams({
                page: page.toString(),
                ...(currentFilters.species && { species: currentFilters.species }),
                ...(currentFilters.origin && { category: currentFilters.origin }), // Map origin to category
                ...(currentFilters.grade && { grade: currentFilters.grade }),
                ...(currentFilters.minPrice && { minPrice: currentFilters.minPrice.toString() }),
                ...(currentFilters.maxPrice && { maxPrice: currentFilters.maxPrice.toString() }),
                ...(currentFilters.status && { status: currentFilters.status }),
            });

            const response = await api.get(`/woods?${params}`);

            // Handle both array response and paginated response
            let backendItems = [];
            let totalPages = 1;
            let currentPage = 1;

            if (Array.isArray(response.data)) {
                backendItems = response.data;
            } else if (response.data.items) {
                backendItems = response.data.items;
                totalPages = response.data.totalPages || 1;
                currentPage = response.data.page || 1;
            }

            // Transform backend items to frontend format
            const transformedItems = backendItems.map(transformBackendWood);

            set({
                woodItems: transformedItems,
                totalPages,
                currentPage,
                isLoading: false,
            });

            console.log('Fetched wood items:', transformedItems); // Debug log
        } catch (error: any) {
            console.error('Fetch error:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch wood items',
            });
        }
    },

    fetchWoodItemById: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
            const response = await api.get(`/woods/${id}`);
            const backendWood = response.data;

            // Transform to frontend format
            const transformedWood = transformBackendWood(backendWood);

            set({
                selectedWood: transformedWood,
                isLoading: false,
            });

            return transformedWood;
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch wood item',
            });
            return null;
        }
    },

    createWoodItem: async (woodData: WoodFormData, images: File[]) => {
        set({ isLoading: true, error: null });

        try {
            // First upload images to Cloudinary
            const uploadedImages = await get().uploadImagesToCloudinary(images);

            // Parse dimensions string to object
            const dimensionsObj = parseDimensions(woodData.dimensions);

            // Prepare data for backend
            const backendData = {
                species: woodData.species,
                dimensions: dimensionsObj,
                price: woodData.price,
                stock: woodData.stockLevel, // Map stockLevel to stock
                images: uploadedImages,
                description: woodData.description,
                category: woodData.origin || 'Cameroon', // Map origin to category
            };

            // Create wood item
            const response = await api.post('/woods', backendData);

            // Transform and add to local state
            const newWood = transformBackendWood(response.data);
            set((state) => ({
                woodItems: [...state.woodItems, newWood],
                isLoading: false,
            }));

            toast.success('Wood item created successfully');
            return true;
        } catch (error: any) {
            console.error('Create error:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to create wood item',
            });
            toast.error('Failed to create wood item');
            return false;
        }
    },

    updateWoodItem: async (id: string, woodData: Partial<WoodFormData>, newImages?: File[]) => {
        set({ isLoading: true, error: null });

        try {
            const updateData: any = {};

            // Map frontend fields to backend fields
            if (woodData.species) updateData.species = woodData.species;
            if (woodData.price) updateData.price = woodData.price;
            if (woodData.stockLevel !== undefined) updateData.stock = woodData.stockLevel;
            if (woodData.description) updateData.description = woodData.description;
            if (woodData.origin) updateData.category = woodData.origin;

            // Handle dimensions if provided
            if (woodData.dimensions) {
                updateData.dimensions = parseDimensions(woodData.dimensions);
            }

            // Upload new images if provided
            if (newImages && newImages.length > 0) {
                const uploadedImages = await get().uploadImagesToCloudinary(newImages);
                updateData.images = uploadedImages;
            }

            // Update wood item
            const response = await api.put(`/woods/${id}`, updateData);

            // Transform updated wood
            const updatedWood = transformBackendWood(response.data);

            // Update state
            set((state) => ({
                woodItems: state.woodItems.map(item =>
                    item.id === id ? updatedWood : item
                ),
                selectedWood: state.selectedWood?.id === id ? updatedWood : state.selectedWood,
                isLoading: false,
            }));

            toast.success('Wood item updated successfully');
            return true;
        } catch (error: any) {
            console.error('Update error:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to update wood item',
            });
            toast.error('Failed to update wood item');
            return false;
        }
    },

    deleteWoodItem: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
            await api.delete(`/woods/${id}`);

            // Remove from state
            set((state) => ({
                woodItems: state.woodItems.filter(item => item.id !== id),
                selectedWood: state.selectedWood?.id === id ? null : state.selectedWood,
                isLoading: false,
            }));

            toast.success('Wood item deleted successfully');
            return true;
        } catch (error: any) {
            console.error('Delete error:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to delete wood item',
            });
            toast.error('Failed to delete wood item');
            return false;
        }
    },

    clearSelectedWood: () => {
        set({ selectedWood: null });
    },
}));

// Helper hooks
export const useWoodItems = () => useWoodStore((state) => state.woodItems);
export const useSelectedWood = () => useWoodStore((state) => state.selectedWood);
export const useWoodLoading = () => useWoodStore((state) => state.isLoading);
export const useWoodError = () => useWoodStore((state) => state.error);
export const useUploadProgress = () => useWoodStore((state) => state.uploadProgress);
export const useWoodFilters = () => useWoodStore((state) => state.filters);
export const useWoodPagination = () => ({
    currentPage: useWoodStore((state) => state.currentPage),
    totalPages: useWoodStore((state) => state.totalPages),
});

// For debugging - add to window in development
if (process.env.NODE_ENV === 'development') {
    (window as any).useWoodStore = useWoodStore;
}