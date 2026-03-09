import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import type { UserRole } from '@/types';
import { useEffect, useState } from 'react';

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
  const { isAuthenticated, user, company, isLoading, fetchProfile } = useAuthStore();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Fetch profile on mount if token exists but user is null
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth-token');
      if (token && !user) {
        await fetchProfile();
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [user, fetchProfile]);

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'SUPER_ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/company/dashboard" replace />;
  }

  // Check if company needs to be approved for certain actions
  if (requireApproved && user.role === 'REGISTERED_COMPANY') {
    if (!company) {
      // Company profile not found - needs to complete registration
      return <Navigate to="/company/register" state={{ from: location }} replace />;
    }

    if (company.status !== 'APPROVED') {
      // Company not approved yet
      return <Navigate to="/company/kyb-pending" state={{ companyStatus: company.status }} replace />;
    }
  }

  // All checks passed - render children
  return <>{children}</>;
}

// Specialized route components for common use cases
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}

export function CompanyRoute({
  children,
  requireApproved = false
}: {
  children: React.ReactNode;
  requireApproved?: boolean;
}) {
  return (
    <ProtectedRoute
      allowedRoles={['REGISTERED_COMPANY']}
      requireApproved={requireApproved}
    >
      {children}
    </ProtectedRoute>
  );
}

export function PublicRoute({
  children,
  redirectTo = '/dashboard'
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    const dashboardPath = user.role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/company/dashboard';
    return <Navigate to={redirectTo === '/dashboard' ? dashboardPath : redirectTo} replace />;
  }

  return <>{children}</>;
}

// Higher-Order Component for easier wrapping
export function withProtectedRoute(
  WrappedComponent: React.ComponentType<any>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function WithProtectedRoute(props: any) {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

// Example usage:
// export default withProtectedRoute(CompanyDashboard, {
//   allowedRoles: ['REGISTERED_COMPANY'],
//   requireApproved: true
// });