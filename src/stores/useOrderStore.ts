import { create } from 'zustand';
import axios from 'axios';
import type { Order, OrderStatus } from '@/types';

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
    } else {
        console.warn('No token found in localStorage');
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Authentication error - token expired or invalid');
            // Don't remove token here - let the store handle it
        }
        return Promise.reject(error);
    }
);

interface CreateOrderData {
    items: Array<{
        id: string;
        quantity: number;
    }>;
    shippingAddress: {
        address: string;
        city: string;
        country: string;
    };
}

interface OrderStore {
    // State
    orders: Order[];
    selectedOrder: Order | null;
    isLoading: boolean;
    error: string | null;
    totalPages: number;
    currentPage: number;
    isAuthenticated: boolean;

    // Actions
    fetchMyOrders: (page?: number) => Promise<Order[]>;
    fetchOrderById: (id: string) => Promise<Order | null>;
    fetchAllOrders: (page?: number, status?: OrderStatus) => Promise<Order[]>; // Admin only
    createOrder: (orderData: CreateOrderData) => Promise<Order | null>;
    updateOrderStatus: (id: string, status: OrderStatus) => Promise<boolean>; // Admin only
    clearError: () => void;
    clearSelectedOrder: () => void;
    handleAuthError: () => void;
    logout: () => void;
    checkAuth: () => boolean;
}

// Helper function to transform backend order to frontend Order type
const transformBackendOrder = (backendOrder: any): Order => {
    if (!backendOrder) return null as any;

    // Extract user data - the backend populates the user field
    const userData = backendOrder.user || {};

    // Extract company from user data (if populated)
    const companyData = userData.company || {};

    return {
        id: backendOrder._id || backendOrder.id,
        orderNumber: backendOrder.orderNumber || `ORD-${(backendOrder._id || backendOrder.id || '').slice(-6)}`,
        companyId: userData._id || backendOrder.user,
        // Store the full user object with nested company
        user: {
            _id: userData._id,
            id: userData._id,
            name: userData.name || 'N/A',
            email: userData.email || 'N/A',
            role: userData.role || 'REGISTERED_COMPANY',
            company: {
                id: companyData._id || companyData.id,
                _id: companyData._id,
                name: companyData.name || 'N/A',
                email: companyData.email || userData.email || 'N/A',
                phone: companyData.phone || 'N/A',
                taxId: companyData.taxId || 'N/A',
                address: companyData.address || 'N/A',
                status: companyData.status || 'PENDING',
                kybDocs: companyData.kybDocs || [],
                createdAt: companyData.createdAt,
                updatedAt: companyData.updatedAt
            }
        },
        // Keep company field for backward compatibility
        company: {
            id: companyData._id || companyData.id,
            _id: companyData._id,
            name: companyData.name || 'N/A',
            email: companyData.email || userData.email || 'N/A',
            phone: companyData.phone || 'N/A',
            taxId: companyData.taxId || 'N/A',
            address: companyData.address || 'N/A',
            status: companyData.status || 'PENDING',
            kybDocs: companyData.kybDocs || [],
            createdAt: companyData.createdAt,
            updatedAt: companyData.updatedAt
        },
        items: (backendOrder.items || []).map((item: any, index: number) => {
            const woodItemData = item.woodItem || {};
            return {
                id: item._id || `${backendOrder._id}-item-${index}`,
                woodItemId: woodItemData._id || item.woodItem,
                woodItem: {
                    id: woodItemData._id || woodItemData.id,
                    _id: woodItemData._id,
                    species: item.species || woodItemData.species || 'Unknown',
                    origin: woodItemData.origin || 'Cameroon',
                    grade: woodItemData.grade || 'A',
                    volume: woodItemData.volume || 0,
                    price: item.price || woodItemData.price || 0,
                    images: woodItemData.images || [],
                    status: woodItemData.status || 'AVAILABLE',
                    stockLevel: woodItemData.stock || 0,
                    dimensions: woodItemData.dimensions ?
                        `${woodItemData.dimensions.length}${woodItemData.dimensions.unit} x ${woodItemData.dimensions.width}${woodItemData.dimensions.unit} x ${woodItemData.dimensions.height}${woodItemData.dimensions.unit}`
                        : 'N/A',
                    description: woodItemData.description || '',
                    createdAt: woodItemData.createdAt || new Date().toISOString(),
                    updatedAt: woodItemData.updatedAt || new Date().toISOString(),
                },
                quantity: item.quantity || 0,
                unitPrice: item.price || item.unitPrice || 0,
                totalPrice: (item.price || item.unitPrice || 0) * (item.quantity || 0),
            };
        }),
        totalAmount: backendOrder.totalAmount || 0,
        status: backendOrder.status || 'PENDING',
        shippingAddress: backendOrder.shippingAddress || {
            address: '',
            city: 'Douala',
            country: 'Cameroon'
        },
        paymentStatus: backendOrder.paymentStatus || 'PENDING',
        documents: (backendOrder.documents || []).map((doc: any) => ({
            id: doc._id || doc.id,
            type: doc.type || 'OTHER',
            name: doc.name || 'Document',
            url: doc.url || '',
            uploadedAt: doc.uploadedAt || new Date().toISOString(),
        })),
        notes: backendOrder.notes || '',
        createdAt: backendOrder.createdAt || new Date().toISOString(),
        updatedAt: backendOrder.updatedAt || new Date().toISOString(),
    };
};

export const useOrderStore = create<OrderStore>((set, get) => ({
    orders: [],
    selectedOrder: null,
    isLoading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
    isAuthenticated: true, // Assume authenticated until proven otherwise

    clearError: () => set({ error: null }),

    checkAuth: () => {
        const token = localStorage.getItem('auth-token');
        return !!token;
    },

    handleAuthError: () => {
        console.error('Authentication error - clearing session');
        localStorage.removeItem('auth-token');
        set({
            isAuthenticated: false,
            orders: [],
            selectedOrder: null,
            error: 'Your session has expired. Please login again.',
            isLoading: false
        });

        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    },

    logout: () => {
        localStorage.removeItem('auth-token');
        set({
            orders: [],
            selectedOrder: null,
            error: null,
            isLoading: false,
            isAuthenticated: false
        });
        window.location.href = '/login';
    },

    fetchMyOrders: async (page: number = 1) => {
        // Check if we have a token first
        if (!get().checkAuth()) {
            set({
                isLoading: false,
                orders: [],
                error: 'Not authenticated',
                isAuthenticated: false
            });
            return [];
        }

        set({ isLoading: true, error: null });

        try {
            console.log('Fetching orders for page:', page);
            const response = await api.get(`/orders/myorders?page=${page}`);
            const data = response.data;

            // Handle both array and paginated responses
            let ordersList = [];
            let totalPages = 1;
            let currentPage = 1;

            if (Array.isArray(data)) {
                ordersList = data;
                totalPages = Math.ceil(data.length / 10);
            } else if (data.items) {
                ordersList = data.items;
                totalPages = data.totalPages || 1;
                currentPage = data.page || 1;
            } else if (data.data) {
                ordersList = data.data;
            }

            // Transform each order
            const transformedOrders = ordersList
                .map(transformBackendOrder)
                .filter(order => order !== null);

            console.log('Fetched orders:', transformedOrders.length);

            set({
                orders: transformedOrders,
                totalPages,
                currentPage,
                isLoading: false,
                error: null,
                isAuthenticated: true,
            });

            return transformedOrders;
        } catch (error: any) {
            console.error('Fetch my orders error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            // Handle 401 Unauthorized
            if (error.response?.status === 401) {
                get().handleAuthError();
                return [];
            }

            // Handle network errors
            if (!error.response) {
                set({
                    isLoading: false,
                    error: 'Network error. Please check your connection.',
                });
                return [];
            }

            // Don't set error for 404 - just return empty array
            if (error.response?.status === 404) {
                set({
                    isLoading: false,
                    orders: [],
                    error: null
                });
                return [];
            }

            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch orders',
            });
            return [];
        }
    },

    fetchOrderById: async (id: string) => {
        if (!id) {
            set({ error: 'Order ID is required' });
            return null;
        }

        // Check if we have a token first
        if (!get().checkAuth()) {
            set({
                isLoading: false,
                error: 'Not authenticated',
                isAuthenticated: false
            });
            return null;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await api.get(`/orders/${id}`);
            const order = response.data;

            // Transform the order
            const transformedOrder = transformBackendOrder(order);

            console.log('Fetched order details for ID:', id);

            set({
                selectedOrder: transformedOrder,
                isLoading: false,
                isAuthenticated: true,
            });

            return transformedOrder;
        } catch (error: any) {
            console.error('Fetch order by ID error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            if (error.response?.status === 401) {
                get().handleAuthError();
                return null;
            }

            if (error.response?.status === 404) {
                set({
                    isLoading: false,
                    error: 'Order not found',
                });
                return null;
            }

            if (!error.response) {
                set({
                    isLoading: false,
                    error: 'Network error. Please check your connection.',
                });
                return null;
            }

            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch order',
            });
            return null;
        }
    },

    fetchAllOrders: async (page: number = 1, status?: OrderStatus) => {
        // Check if we have a token first
        if (!get().checkAuth()) {
            set({
                isLoading: false,
                orders: [],
                error: 'Not authenticated',
                isAuthenticated: false
            });
            return [];
        }

        set({ isLoading: true, error: null });

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                ...(status && { status }),
            });

            // Try both possible admin endpoints
            let response;
            try {
                response = await api.get(`/orders/all?${params}`);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    response = await api.get(`/orders?${params}`);
                } else {
                    throw err;
                }
            }

            const data = response.data;

            // Handle both array and paginated responses
            let ordersList = [];
            let totalPages = 1;
            let currentPage = 1;

            if (Array.isArray(data)) {
                ordersList = data;
                totalPages = Math.ceil(data.length / 10);
            } else if (data.items) {
                ordersList = data.items;
                totalPages = data.totalPages || 1;
                currentPage = data.page || 1;
            } else if (data.data) {
                ordersList = data.data;
            }

            // Transform each order
            const transformedOrders = ordersList
                .map(transformBackendOrder)
                .filter(order => order !== null);

            console.log('Fetched all orders:', transformedOrders.length);

            set({
                orders: transformedOrders,
                totalPages,
                currentPage,
                isLoading: false,
                error: null,
                isAuthenticated: true,
            });

            return transformedOrders;
        } catch (error: any) {
            console.error('Fetch all orders error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            if (error.response?.status === 401) {
                get().handleAuthError();
                return [];
            }

            // Don't set error for 403 or 404 - admin might not have permission
            if (error.response?.status === 403 || error.response?.status === 404) {
                console.log('Admin orders endpoint not available or insufficient permissions');
                set({
                    isLoading: false,
                    orders: [],
                    error: null
                });
                return [];
            }

            if (!error.response) {
                set({
                    isLoading: false,
                    error: 'Network error. Please check your connection.',
                });
                return [];
            }

            set({
                isLoading: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch orders',
            });
            return [];
        }
    },

    createOrder: async (orderData: CreateOrderData) => {
        if (!orderData.items || orderData.items.length === 0) {
            set({ error: 'Order must contain at least one item' });
            return null;
        }

        // Check if we have a token first
        if (!get().checkAuth()) {
            set({
                isLoading: false,
                error: 'Not authenticated',
                isAuthenticated: false
            });
            return null;
        }

        set({ isLoading: true, error: null });

        try {
            console.log('Creating order with data:', orderData);

            const response = await api.post('/orders', {
                items: orderData.items.map(item => ({
                    id: item.id,
                    quantity: item.quantity
                })),
                shippingAddress: orderData.shippingAddress,
            });

            const backendOrder = response.data;
            console.log('Order created successfully');

            const transformedOrder = transformBackendOrder(backendOrder);

            set((state) => ({
                orders: [transformedOrder, ...state.orders],
                selectedOrder: transformedOrder,
                isLoading: false,
                error: null,
                isAuthenticated: true,
            }));

            return transformedOrder;
        } catch (error: any) {
            console.error('Create order error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            if (error.response?.status === 401) {
                get().handleAuthError();
                return null;
            }

            if (!error.response) {
                set({
                    isLoading: false,
                    error: 'Network error. Please check your connection.',
                });
                return null;
            }

            let errorMessage = 'Failed to create order';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            set({
                isLoading: false,
                error: errorMessage,
            });

            return null;
        }
    },

    updateOrderStatus: async (id: string, status: OrderStatus) => {
        if (!id) {
            set({ error: 'Order ID is required' });
            return false;
        }

        // Check if we have a token first
        if (!get().checkAuth()) {
            set({
                isLoading: false,
                error: 'Not authenticated',
                isAuthenticated: false
            });
            return false;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await api.put(`/orders/${id}/status`, { status });
            const updatedBackendOrder = response.data;

            const updatedOrder = transformBackendOrder(updatedBackendOrder);

            set((state) => ({
                orders: state.orders.map(order =>
                    order.id === id ? updatedOrder : order
                ),
                selectedOrder: state.selectedOrder?.id === id ? updatedOrder : state.selectedOrder,
                isLoading: false,
                error: null,
                isAuthenticated: true,
            }));

            return true;
        } catch (error: any) {
            console.error('Update order status error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            if (error.response?.status === 401) {
                get().handleAuthError();
                return false;
            }

            if (!error.response) {
                set({
                    isLoading: false,
                    error: 'Network error. Please check your connection.',
                });
                return false;
            }

            let errorMessage = 'Failed to update order status';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            set({
                isLoading: false,
                error: errorMessage,
            });
            return false;
        }
    },

    clearSelectedOrder: () => {
        set({ selectedOrder: null });
    },
}));

// Helper hooks
export const useOrders = () => useOrderStore((state) => state.orders);
export const useSelectedOrder = () => useOrderStore((state) => state.selectedOrder);
export const useOrderLoading = () => useOrderStore((state) => state.isLoading);
export const useOrderError = () => useOrderStore((state) => state.error);
export const useOrderAuth = () => useOrderStore((state) => state.isAuthenticated);
export const useOrderPagination = () => ({
    currentPage: useOrderStore((state) => state.currentPage),
    totalPages: useOrderStore((state) => state.totalPages),
});

// For debugging
if (process.env.NODE_ENV === 'development') {
    (window as any).useOrderStore = useOrderStore;
}