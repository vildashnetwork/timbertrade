 import { Navigate, useLocation } from 'react-router-dom';
 import { useAuthStore } from '@/stores/authStore';
 import type { UserRole } from '@/types';
 
 interface ProtectedRouteProps {
   children: React.ReactNode;
   allowedRoles?: UserRole[];
   requireApproved?: boolean;
 }
 
 export function ProtectedRoute({ 
   children, 
   allowedRoles,
   requireApproved = false 
 }: ProtectedRouteProps) {
   const { isAuthenticated, user, company } = useAuthStore();
   const location = useLocation();
 
   // Not authenticated - redirect to login
   if (!isAuthenticated || !user) {
     return <Navigate to="/login" state={{ from: location }} replace />;
   }
 
   // Check role permissions
   if (allowedRoles && !allowedRoles.includes(user.role)) {
     // Redirect to appropriate dashboard based on role
     if (user.role === 'SUPER_ADMIN') {
       return <Navigate to="/admin" replace />;
     }
     return <Navigate to="/company" replace />;
   }
 
   // Check if company needs to be approved for certain actions
   if (requireApproved && user.role === 'REGISTERED_COMPANY') {
     if (!company || company.status !== 'APPROVED') {
       return <Navigate to="/company/kyb-pending" replace />;
     }
   }
 
   return <>{children}</>;
 }