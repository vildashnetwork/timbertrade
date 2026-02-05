 import axios from 'axios';
 import type { 
   WoodItem, 
   Company, 
   Order, 
   ApiResponse, 
   PaginatedResponse,
   WoodFilterOptions,
   DashboardStats 
 } from '@/types';
 
 // Create axios instance with default config
 const api = axios.create({
   baseURL: '/api',
   timeout: 10000,
   headers: {
     'Content-Type': 'application/json',
   },
 });
 
 // Add auth token to requests
 api.interceptors.request.use((config) => {
   const token = localStorage.getItem('auth-storage');
   if (token) {
     try {
       const parsed = JSON.parse(token);
       if (parsed.state?.token) {
         config.headers.Authorization = `Bearer ${parsed.state.token}`;
       }
     } catch (e) {
       // Invalid token format
     }
   }
   return config;
 });
 
 // Mock Data
 export const MOCK_WOOD_ITEMS: WoodItem[] = [
   {
     id: 'wood-1',
     species: 'Sapelli',
     origin: 'East Region, Cameroon',
     grade: 'A',
     volume: 150,
     price: 850,
     images: ['/placeholder.svg'],
     status: 'AVAILABLE',
     stockLevel: 150,
     dimensions: '4m x 0.5m x 0.5m',
     description: 'Premium grade Sapelli timber, perfect for furniture and flooring.',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   },
   {
     id: 'wood-2',
     species: 'Iroko',
     origin: 'South Region, Cameroon',
     grade: 'A',
     volume: 200,
     price: 920,
     images: ['/placeholder.svg'],
     status: 'AVAILABLE',
     stockLevel: 200,
     dimensions: '3.5m x 0.4m x 0.4m',
     description: 'High-quality Iroko wood, excellent durability for outdoor use.',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   },
   {
     id: 'wood-3',
     species: 'Bubinga',
     origin: 'Central Region, Cameroon',
     grade: 'A',
     volume: 80,
     price: 1200,
     images: ['/placeholder.svg'],
     status: 'LOW_STOCK',
     stockLevel: 25,
     dimensions: '3m x 0.6m x 0.6m',
     description: 'Rare Bubinga hardwood with distinctive grain patterns.',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   },
   {
     id: 'wood-4',
     species: 'Padouk',
     origin: 'East Region, Cameroon',
     grade: 'B',
     volume: 300,
     price: 680,
     images: ['/placeholder.svg'],
     status: 'AVAILABLE',
     stockLevel: 300,
     dimensions: '4m x 0.3m x 0.3m',
     description: 'Vibrant red Padouk wood, ideal for decorative applications.',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   },
   {
     id: 'wood-5',
     species: 'Azobe',
     origin: 'Littoral Region, Cameroon',
     grade: 'A',
     volume: 180,
     price: 750,
     images: ['/placeholder.svg'],
     status: 'AVAILABLE',
     stockLevel: 180,
     dimensions: '5m x 0.4m x 0.4m',
     description: 'Dense and durable Azobe, perfect for marine construction.',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   },
   {
     id: 'wood-6',
     species: 'Moabi',
     origin: 'South Region, Cameroon',
     grade: 'B',
     volume: 120,
     price: 580,
     images: ['/placeholder.svg'],
     status: 'AVAILABLE',
     stockLevel: 120,
     dimensions: '3m x 0.5m x 0.5m',
     description: 'Versatile Moabi timber for general construction.',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   },
 ];
 
 export const MOCK_COMPANIES: Company[] = [
   {
     id: 'comp-1',
     name: 'Cameroon Timber Co.',
     taxId: 'NIU-2024-001234',
     email: 'company@timber.com',
     address: 'Douala, Cameroon',
     directorName: 'Jean Pierre Kamga',
     directorEmail: 'jp.kamga@timber.com',
     phone: '+237 6 99 00 00 00',
     kybDocs: [
       { id: 'doc-1', type: 'NIU', name: 'NIU Certificate', url: '/docs/niu.pdf', uploadedAt: new Date().toISOString() },
       { id: 'doc-2', type: 'RCCM', name: 'RCCM Document', url: '/docs/rccm.pdf', uploadedAt: new Date().toISOString() },
     ],
     status: 'APPROVED',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   },
   {
     id: 'comp-2',
     name: 'New Company Ltd.',
     taxId: 'NIU-2024-005678',
     email: 'pending@timber.com',
     address: 'Yaoundé, Cameroon',
     directorName: 'Marie Nguemo',
     directorEmail: 'm.nguemo@newcompany.cm',
     phone: '+237 6 88 00 00 00',
     kybDocs: [
       { id: 'doc-3', type: 'CARTE_CONTRIBUABLE', name: 'Carte de Contribuable', url: '/docs/carte.pdf', uploadedAt: new Date().toISOString() },
     ],
     status: 'PENDING',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   },
   {
     id: 'comp-3',
     name: 'Forest Exports SARL',
     taxId: 'NIU-2023-009999',
     email: 'forest@exports.cm',
     address: 'Bafoussam, Cameroon',
     directorName: 'Paul Tchounou',
     directorEmail: 'p.tchounou@forestexports.cm',
     phone: '+237 6 77 00 00 00',
     kybDocs: [
       { id: 'doc-4', type: 'NIU', name: 'NIU Certificate', url: '/docs/niu2.pdf', uploadedAt: new Date().toISOString() },
       { id: 'doc-5', type: 'RCCM', name: 'RCCM Document', url: '/docs/rccm2.pdf', uploadedAt: new Date().toISOString() },
     ],
     status: 'SUSPENDED',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   },
 ];
 
 export const MOCK_ORDERS: Order[] = [
   {
     id: 'order-1',
     orderNumber: 'ORD-2024-0001',
     companyId: 'comp-1',
     company: MOCK_COMPANIES[0],
     items: [
       {
         id: 'item-1',
         woodItemId: 'wood-1',
         woodItem: MOCK_WOOD_ITEMS[0],
         quantity: 50,
         unitPrice: 850,
         totalPrice: 42500,
       },
     ],
     totalAmount: 42500,
     status: 'PENDING',
     documents: [],
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   },
   {
     id: 'order-2',
     orderNumber: 'ORD-2024-0002',
     companyId: 'comp-1',
     company: MOCK_COMPANIES[0],
     items: [
       {
         id: 'item-2',
         woodItemId: 'wood-2',
         woodItem: MOCK_WOOD_ITEMS[1],
         quantity: 30,
         unitPrice: 920,
         totalPrice: 27600,
       },
       {
         id: 'item-3',
         woodItemId: 'wood-4',
         woodItem: MOCK_WOOD_ITEMS[3],
         quantity: 20,
         unitPrice: 680,
         totalPrice: 13600,
       },
     ],
     totalAmount: 41200,
     status: 'CONFIRMED',
     documents: [
       { id: 'doc-ord-1', type: 'COMMERCIAL_INVOICE', name: 'Invoice-0002.pdf', url: '/docs/invoice.pdf', uploadedAt: new Date().toISOString() },
     ],
     createdAt: new Date(Date.now() - 86400000).toISOString(),
     updatedAt: new Date().toISOString(),
   },
   {
     id: 'order-3',
     orderNumber: 'ORD-2024-0003',
     companyId: 'comp-1',
     company: MOCK_COMPANIES[0],
     items: [
       {
         id: 'item-4',
         woodItemId: 'wood-5',
         woodItem: MOCK_WOOD_ITEMS[4],
         quantity: 100,
         unitPrice: 750,
         totalPrice: 75000,
       },
     ],
     totalAmount: 75000,
     status: 'SHIPPED',
     documents: [
       { id: 'doc-ord-2', type: 'COMMERCIAL_INVOICE', name: 'Invoice-0003.pdf', url: '/docs/invoice.pdf', uploadedAt: new Date().toISOString() },
       { id: 'doc-ord-3', type: 'PHYTOSANITARY_CERTIFICATE', name: 'Phyto-0003.pdf', url: '/docs/phyto.pdf', uploadedAt: new Date().toISOString() },
     ],
     createdAt: new Date(Date.now() - 172800000).toISOString(),
     updatedAt: new Date().toISOString(),
   },
 ];
 
 // API Service Functions
 export const woodService = {
   getAll: async (filters?: WoodFilterOptions): Promise<WoodItem[]> => {
     await new Promise((r) => setTimeout(r, 500));
     let items = [...MOCK_WOOD_ITEMS];
     
     if (filters?.species) {
       items = items.filter(i => i.species.toLowerCase().includes(filters.species!.toLowerCase()));
     }
     if (filters?.origin) {
       items = items.filter(i => i.origin.toLowerCase().includes(filters.origin!.toLowerCase()));
     }
     if (filters?.grade) {
       items = items.filter(i => i.grade === filters.grade);
     }
     if (filters?.minPrice) {
       items = items.filter(i => i.price >= filters.minPrice!);
     }
     if (filters?.maxPrice) {
       items = items.filter(i => i.price <= filters.maxPrice!);
     }
     
     return items;
   },
   
   getById: async (id: string): Promise<WoodItem | null> => {
     await new Promise((r) => setTimeout(r, 300));
     return MOCK_WOOD_ITEMS.find(w => w.id === id) || null;
   },
   
   create: async (data: Partial<WoodItem>): Promise<WoodItem> => {
     await new Promise((r) => setTimeout(r, 500));
     const newItem: WoodItem = {
       id: `wood-${Date.now()}`,
       species: data.species || '',
       origin: data.origin || '',
       grade: data.grade || 'B',
       volume: data.volume || 0,
       price: data.price || 0,
       images: data.images || [],
       status: 'AVAILABLE',
       stockLevel: data.stockLevel || 0,
       dimensions: data.dimensions || '',
       description: data.description,
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString(),
     };
     MOCK_WOOD_ITEMS.push(newItem);
     return newItem;
   },
   
   update: async (id: string, data: Partial<WoodItem>): Promise<WoodItem | null> => {
     await new Promise((r) => setTimeout(r, 500));
     const index = MOCK_WOOD_ITEMS.findIndex(w => w.id === id);
     if (index === -1) return null;
     MOCK_WOOD_ITEMS[index] = { ...MOCK_WOOD_ITEMS[index], ...data, updatedAt: new Date().toISOString() };
     return MOCK_WOOD_ITEMS[index];
   },
   
   delete: async (id: string): Promise<boolean> => {
     await new Promise((r) => setTimeout(r, 300));
     const index = MOCK_WOOD_ITEMS.findIndex(w => w.id === id);
     if (index === -1) return false;
     MOCK_WOOD_ITEMS.splice(index, 1);
     return true;
   },
 };
 
 export const companyService = {
   getAll: async (): Promise<Company[]> => {
     await new Promise((r) => setTimeout(r, 500));
     return [...MOCK_COMPANIES];
   },
   
   getById: async (id: string): Promise<Company | null> => {
     await new Promise((r) => setTimeout(r, 300));
     return MOCK_COMPANIES.find(c => c.id === id) || null;
   },
   
   updateStatus: async (id: string, status: Company['status']): Promise<Company | null> => {
     await new Promise((r) => setTimeout(r, 500));
     const index = MOCK_COMPANIES.findIndex(c => c.id === id);
     if (index === -1) return null;
     MOCK_COMPANIES[index] = { ...MOCK_COMPANIES[index], status, updatedAt: new Date().toISOString() };
     return MOCK_COMPANIES[index];
   },
 };
 
 export const orderService = {
   getAll: async (status?: Order['status']): Promise<Order[]> => {
     await new Promise((r) => setTimeout(r, 500));
     let orders = [...MOCK_ORDERS];
     if (status) {
       orders = orders.filter(o => o.status === status);
     }
     return orders;
   },
   
   getById: async (id: string): Promise<Order | null> => {
     await new Promise((r) => setTimeout(r, 300));
     return MOCK_ORDERS.find(o => o.id === id) || null;
   },
   
   getByCompany: async (companyId: string): Promise<Order[]> => {
     await new Promise((r) => setTimeout(r, 500));
     return MOCK_ORDERS.filter(o => o.companyId === companyId);
   },
   
   updateStatus: async (id: string, status: Order['status']): Promise<Order | null> => {
     await new Promise((r) => setTimeout(r, 500));
     const index = MOCK_ORDERS.findIndex(o => o.id === id);
     if (index === -1) return null;
     MOCK_ORDERS[index] = { ...MOCK_ORDERS[index], status, updatedAt: new Date().toISOString() };
     return MOCK_ORDERS[index];
   },
   
   create: async (companyId: string, items: { woodItemId: string; quantity: number }[]): Promise<Order> => {
     await new Promise((r) => setTimeout(r, 800));
     const company = MOCK_COMPANIES.find(c => c.id === companyId)!;
     const orderItems = items.map((item, idx) => {
       const wood = MOCK_WOOD_ITEMS.find(w => w.id === item.woodItemId)!;
       return {
         id: `item-${Date.now()}-${idx}`,
         woodItemId: item.woodItemId,
         woodItem: wood,
         quantity: item.quantity,
         unitPrice: wood.price,
         totalPrice: wood.price * item.quantity,
       };
     });
     
     const order: Order = {
       id: `order-${Date.now()}`,
       orderNumber: `ORD-2024-${String(MOCK_ORDERS.length + 1).padStart(4, '0')}`,
       companyId,
       company,
       items: orderItems,
       totalAmount: orderItems.reduce((sum, i) => sum + i.totalPrice, 0),
       status: 'PENDING',
       documents: [],
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString(),
     };
     
     MOCK_ORDERS.push(order);
     return order;
   },
 };
 
 export const statsService = {
   getDashboardStats: async (): Promise<DashboardStats> => {
     await new Promise((r) => setTimeout(r, 300));
     return {
       totalOrders: MOCK_ORDERS.length,
       pendingOrders: MOCK_ORDERS.filter(o => o.status === 'PENDING').length,
       totalRevenue: MOCK_ORDERS.reduce((sum, o) => sum + o.totalAmount, 0),
       totalCompanies: MOCK_COMPANIES.length,
       pendingKYB: MOCK_COMPANIES.filter(c => c.status === 'PENDING').length,
       lowStockItems: MOCK_WOOD_ITEMS.filter(w => w.status === 'LOW_STOCK').length,
     };
   },
 };
 
 export default api;