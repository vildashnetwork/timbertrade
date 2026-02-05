 import { create } from 'zustand';
 import { persist } from 'zustand/middleware';
 import type { User, Company, UserRole } from '@/types';
 
 interface AuthState {
   user: User | null;
   company: Company | null;
   token: string | null;
   isAuthenticated: boolean;
   isLoading: boolean;
   login: (email: string, password: string) => Promise<boolean>;
   logout: () => void;
   setLoading: (loading: boolean) => void;
 }
 
 // Mock users for demonstration
 const MOCK_USERS: Record<string, { user: User; password: string; company?: Company }> = {
   'admin@timber.com': {
     user: {
       id: '1',
       email: 'admin@timber.com',
       name: 'Super Admin',
       role: 'SUPER_ADMIN',
       createdAt: new Date().toISOString(),
     },
     password: 'admin123',
   },
   'company@timber.com': {
     user: {
       id: '2',
       email: 'company@timber.com',
       name: 'Cameroon Timber Co.',
       role: 'REGISTERED_COMPANY',
       companyId: 'comp-1',
       createdAt: new Date().toISOString(),
     },
     password: 'company123',
     company: {
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
   },
   'pending@timber.com': {
     user: {
       id: '3',
       email: 'pending@timber.com',
       name: 'New Company Ltd.',
       role: 'REGISTERED_COMPANY',
       companyId: 'comp-2',
       createdAt: new Date().toISOString(),
     },
     password: 'pending123',
     company: {
       id: 'comp-2',
       name: 'New Company Ltd.',
       taxId: 'NIU-2024-005678',
       email: 'pending@timber.com',
       address: 'Yaoundé, Cameroon',
       directorName: 'Marie Nguemo',
       directorEmail: 'm.nguemo@newcompany.cm',
       phone: '+237 6 88 00 00 00',
       kybDocs: [],
       status: 'PENDING',
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString(),
     },
   },
 };
 
 export const useAuthStore = create<AuthState>()(
   persist(
     (set) => ({
       user: null,
       company: null,
       token: null,
       isAuthenticated: false,
       isLoading: false,
 
       login: async (email: string, password: string) => {
         set({ isLoading: true });
         
         // Simulate API call
         await new Promise((resolve) => setTimeout(resolve, 1000));
         
         const mockUser = MOCK_USERS[email];
         
         if (mockUser && mockUser.password === password) {
           const token = `jwt-token-${Date.now()}`;
           set({
             user: mockUser.user,
             company: mockUser.company || null,
             token,
             isAuthenticated: true,
             isLoading: false,
           });
           return true;
         }
         
         set({ isLoading: false });
         return false;
       },
 
       logout: () => {
         set({
           user: null,
           company: null,
           token: null,
           isAuthenticated: false,
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
 export const useUserRole = (): UserRole | null => useAuthStore((state) => state.user?.role || null);