const API_URL = 'http://localhost:5000/api';

class ApiService {
    private async request(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('auth-token');

        const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    }

    // Auth endpoints
    async login(email: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(userData: any) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    // Wood items endpoints
    async getWoodItems(params?: Record<string, string>) {
        const queryString = params ? `?${new URLSearchParams(params)}` : '';
        return this.request(`/woods${queryString}`);
    }

    async getWoodItem(id: string) {
        return this.request(`/woods/${id}`);
    }

    // Order endpoints
    async createOrder(orderData: any) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    }

    async getMyOrders() {
        return this.request('/orders/myorders');
    }

    async getOrder(id: string) {
        return this.request(`/orders/${id}`);
    }

    // Company endpoints (Admin only)
    async getPendingCompanies() {
        return this.request('/companies/pending');
    }

    async updateCompanyStatus(id: string, status: 'APPROVED' | 'PENDING') {
        return this.request(`/companies/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }
}

export const api = new ApiService();