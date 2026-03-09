// Wood Import/Export Platform - Core Types

// User Roles
export type UserRole = 'SUPER_ADMIN' | 'REGISTERED_COMPANY';

// Company Status
export type CompanyStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';

// Order Status
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

// Wood Grade
export type WoodGrade = 'A' | 'B' | 'C';

// User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  createdAt: string;
}

// Wood Item Interface
export interface WoodItem {
  id: string;
  species: string;
  origin: string;
  grade: WoodGrade;
  volume: number; // in CBM (Cubic Meters)
  price: number; // per CBM
  images: string[];
  status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  stockLevel: number;
  dimensions: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// KYB Document Interface
export interface KYBDocument {
  id: string;
  type: 'CARTE_CONTRIBUABLE' | 'RCCM' | 'NIU' | 'OTHER';
  name: string;
  url: string;
  uploadedAt: string;
}

// Company Interface
export interface Company {
  id: string;
  name: string;
  taxId: string; // NIU
  email: string;
  address: string;
  directorName: string;
  directorEmail: string;
  phone: string;
  kybDocs: KYBDocument[];
  status: CompanyStatus;
  createdAt: string;
  avatar: string;
  updatedAt: string;
}

// Order Item Interface
export interface OrderItem {
  id: string;
  woodItemId: string;
  woodItem: WoodItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Order Document Interface
export interface OrderDocument {
  id: string;
  type: 'COMMERCIAL_INVOICE' | 'PHYTOSANITARY_CERTIFICATE' | 'BILL_OF_LADING' | 'OTHER';
  name: string;
  url: string;
  uploadedAt: string;
}

// Order Interface
export interface Order {
  id: string;
  orderNumber: string;
  companyId: string;
  company: Company;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  documents: OrderDocument[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Cart Item Interface
export interface CartItem {
  woodItem: WoodItem;
  quantity: number;
}

// Auth State Interface
export interface AuthState {
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter Options
export interface WoodFilterOptions {
  species?: string;
  origin?: string;
  grade?: WoodGrade;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

// Statistics for Dashboard
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCompanies: number;
  pendingKYB: number;
  lowStockItems: number;
}