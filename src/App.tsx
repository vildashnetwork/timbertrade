// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import NotFound from "./pages/NotFound";

// // Auth
// import LoginPage from "./pages/auth/LoginPage";
// import RegisterPage from "./pages/public/RegisterPage";

// // Public
// import PublicCatalog from "./pages/public/PublicCatalog";
// import WoodDetailsPage from './pages/public/WoodDetailsPage';

// // Layouts
// import { AdminLayout } from "./components/layouts/AdminLayout";
// import { CompanyLayout } from "./components/layouts/CompanyLayout";

// // Admin Pages
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import InventoryPage from "./pages/admin/InventoryPage";
// import OrdersPage from "./pages/admin/OrdersPage";
// import KYBPage from "./pages/admin/KYBPage";
// import SuperAdminProfile from "./pages/admin/SuperAdminProfile"

// // Company Pages
// import CompanyDashboard from "./pages/company/CompanyDashboard";
// import CatalogPage from "./pages/company/CatalogPage";
// import CartPage from "./pages/company/CartPage";
// import CompanyOrdersPage from "./pages/company/CompanyOrdersPage";
// import EditProfilePage from "./pages/company/Profile";
// import KYBPendingPage from "./pages/public/KYBPendingPage";
// import OrderDetailsPage from './pages/company/OrderDetailsPage';
// import SubscriptionPage from "./pages/admin/SubscriptionPage";


// // resetpass

// import ForgotPassword from './pages/public/ForgotPassword';
// import VerifyOTP from './pages/public/VerifyOTP';
// import ResetPassword from './pages/public/ResetPassword';


// // Protected Route
// import { ProtectedRoute, PublicRoute } from "./components/shared/ProtectedRoute";
// import { useAuthStore, useAuthInitializer } from "./stores/useAuthStore";

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 1,
//       refetchOnWindowFocus: false,
//       staleTime: 5 * 60 * 1000, // 5 minutes
//     },
//   },
// });

// // Loading component
// const AppLoader = () => (
//   <div className="min-h-screen flex items-center justify-center bg-gray-50">
//     <div className="text-center">
//       <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//       <p className="text-gray-600 animate-pulse">Loading Timber Platform...</p>
//     </div>
//   </div>
// );

// const App = () => {
//   const { initialize, isLoading } = useAuthInitializer();
//   const [isInitialized, setIsInitialized] = useState(false);

//   useEffect(() => {
//     const initApp = async () => {
//       await initialize();
//       setIsInitialized(true);
//     };
//     initApp();
//   }, [initialize]);

//   if (!isInitialized || isLoading) {
//     return <AppLoader />;
//   }

//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <Toaster />
//         <Sonner position="top-right" closeButton />
//         <BrowserRouter>
//           <Routes>
//             {/* Public Routes */}
//             <Route path="/" element={<PublicCatalog />} />
//             <Route path="/woods/:id" element={<WoodDetailsPage />} />

//             <Route path="/forgot-password" element={<ForgotPassword />} />
//             <Route path="/verify-otp" element={<VerifyOTP />} />
//             <Route path="/reset-password" element={<ResetPassword />} />


//             <Route path="/login" element={
//               <PublicRoute>
//                 <LoginPage />
//               </PublicRoute>
//             } />
//             <Route path="/register" element={
//               <PublicRoute>
//                 <RegisterPage />
//               </PublicRoute>
//             } />

//             {/* Admin Routes */}
//             <Route
//               path="/admin"
//               element={
//                 <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
//                   <AdminLayout />
//                 </ProtectedRoute>
//               }
//             >
//               <Route index element={<Navigate to="/admin/dashboard" replace />} />
//               <Route path="dashboard" element={<AdminDashboard />} />
//               <Route path="inventory" element={<InventoryPage />} />
//               <Route path="orders" element={<OrdersPage />} />
//               <Route path="kyb" element={<KYBPage />} />
//               <Route path="profile" element={<SuperAdminProfile />} />
//               <Route path="subscriptions" element={<SubscriptionPage />} />

//             </Route>

//             {/* Company Routes - All company routes in one group */}
//             <Route
//               path="/company"
//               element={
//                 <ProtectedRoute allowedRoles={['REGISTERED_COMPANY']}>
//                   <CompanyLayout />
//                 </ProtectedRoute>
//               }
//             >
//               <Route index element={<Navigate to="/company/dashboard" replace />} />
//               <Route path="dashboard" element={<CompanyDashboard />} />
//               <Route path="catalog" element={
//                 <ProtectedRoute
//                   allowedRoles={['REGISTERED_COMPANY']}
//                   requireApproved={true}
//                 >
//                   <CatalogPage />
//                 </ProtectedRoute>
//               } />
//               <Route path="cart" element={
//                 <ProtectedRoute
//                   allowedRoles={['REGISTERED_COMPANY']}
//                   requireApproved={true}
//                 >
//                   <CartPage />
//                 </ProtectedRoute>
//               } />
//               <Route path="orders" element={<CompanyOrdersPage />} />
//               <Route path="orders/:id" element={<OrderDetailsPage />} />
//               <Route path="profile" element={<EditProfilePage />} />
//               <Route path="kyb-pending" element={<KYBPendingPage />} />
//             </Route>

//             {/* Registration Success Page */}
//             <Route
//               path="/company/registration-success"
//               element={
//                 <ProtectedRoute allowedRoles={['REGISTERED_COMPANY']}>
//                   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50">
//                     <div className="text-center max-w-md mx-auto p-8">
//                       <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
//                         <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                       </div>
//                       <h1 className="text-3xl font-bold text-gray-900 mb-4">
//                         Registration Successful!
//                       </h1>
//                       <p className="text-gray-600 mb-8">
//                         Your company registration has been submitted for review.
//                         You'll be notified via email once your account is approved.
//                       </p>
//                       <button
//                         onClick={() => window.location.href = '/company/kyb-pending'}
//                         className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
//                       >
//                         Check Application Status
//                       </button>
//                     </div>
//                   </div>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Unauthorized Page */}
//             <Route path="/unauthorized" element={
//               <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50">
//                 <div className="text-center max-w-md mx-auto p-8">
//                   <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
//                   <h2 className="text-2xl font-semibold mb-4">Unauthorized Access</h2>
//                   <p className="text-gray-600 mb-8">
//                     You don't have permission to access this page.
//                   </p>
//                   <button
//                     onClick={() => window.location.href = '/'}
//                     className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
//                   >
//                     Return Home
//                   </button>
//                 </div>
//               </div>
//             } />

//             {/* 404 Not Found */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </BrowserRouter>
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// };

// export default App;



















import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NotFound from "./pages/NotFound";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

// Public
import PublicCatalog from "./pages/public/PublicCatalog";
import WoodDetailsPage from './pages/public/WoodDetailsPage';

// Layouts
import { AdminLayout } from "./components/layouts/AdminLayout";
import { CompanyLayout } from "./components/layouts/CompanyLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import InventoryPage from "./pages/admin/InventoryPage";
import OrdersPage from "./pages/admin/OrdersPage";
import KYBPage from "./pages/admin/KYBPage";
import SuperAdminProfile from "./pages/admin/SuperAdminProfile"
import SubscriptionPage from "./pages/admin/SubscriptionPage";

// Company Pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CatalogPage from "./pages/company/CatalogPage";
import CartPage from "./pages/company/CartPage";
import CompanyOrdersPage from "./pages/company/CompanyOrdersPage";
import EditProfilePage from "./pages/company/Profile";
import KYBPendingPage from "./pages/public/KYBPendingPage";
import OrderDetailsPage from './pages/company/OrderDetailsPage';

// Reset Password
import ForgotPassword from './pages/public/ForgotPassword';
import VerifyOTP from './pages/public/VerifyOTP';
import ResetPassword from './pages/public/ResetPassword';

// Protected Route
import { ProtectedRoute, PublicRoute } from "./components/shared/ProtectedRoute";
import { useAuthStore, useAuthInitializer } from "./stores/useAuthStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Loading component
const AppLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 animate-pulse">Loading Timber Platform...</p>
    </div>
  </div>
);

// Subscription Check Component
const SubscriptionGuard = ({ children }: { children: React.ReactNode }) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const checkSubscription = async () => {
      // If not super admin, always grant access
      if (user?.role !== 'SUPER_ADMIN') {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('auth-token');
        if (!token) {
          navigate('/login');
          return;
        }

        console.log('Checking subscription status...');

        const response = await fetch('/api/payments/subscription', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Check if response is OK and is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Received non-JSON response. Status:', response.status);
          const text = await response.text();
          console.error('Response text:', text.substring(0, 200));

          // If we get a 404, the endpoint might not exist yet
          if (response.status === 404) {
            console.log('Subscription endpoint not found - granting temporary access');
            setHasAccess(true);
            setIsLoading(false);
            return;
          }

          throw new Error('Invalid response format');
        }

        const data = await response.json();
        console.log('Subscription check response:', data);

        if (data.success) {
          const isActive = data.subscription?.isActive || false;
          console.log('Subscription active:', isActive);
          setHasAccess(isActive);

          if (!isActive) {
            console.log('Subscription inactive, redirecting to subscriptions page');
            navigate('/admin/subscriptions');
          }
        } else {
          console.log('Subscription check failed, granting temporary access');
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Subscription check error:', error);
        // On error, grant access to prevent locking users out
        setHasAccess(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [navigate, user]);

  if (isLoading || hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying subscription...</p>
        </div>
      </div>
    );
  }

  return hasAccess ? <>{children}</> : null;
};

const App = () => {
  const { initialize, isLoading: authLoading } = useAuthInitializer();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      await initialize();
      setIsInitialized(true);
    };
    initApp();
  }, [initialize]);

  if (!isInitialized || authLoading) {
    return <AppLoader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" closeButton />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicCatalog />} />
            <Route path="/woods/:id" element={<WoodDetailsPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />

              {/* Subscription page - ALWAYS accessible to super admins (no payment required) */}
              <Route path="subscriptions" element={<SubscriptionPage />} />

              {/* All other admin routes require active subscription */}
              <Route path="dashboard" element={
                <SubscriptionGuard>
                  <AdminDashboard />
                </SubscriptionGuard>
              } />
              <Route path="inventory" element={
                <SubscriptionGuard>
                  <InventoryPage />
                </SubscriptionGuard>
              } />
              <Route path="orders" element={
                <SubscriptionGuard>
                  <OrdersPage />
                </SubscriptionGuard>
              } />
              <Route path="kyb" element={
                <SubscriptionGuard>
                  <KYBPage />
                </SubscriptionGuard>
              } />
              <Route path="profile" element={
                <SubscriptionGuard>
                  <SuperAdminProfile />
                </SubscriptionGuard>
              } />
            </Route>

            {/* Company Routes - No subscription required */}
            <Route
              path="/company"
              element={
                <ProtectedRoute allowedRoles={['REGISTERED_COMPANY']}>
                  <CompanyLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/company/dashboard" replace />} />
              <Route path="dashboard" element={<CompanyDashboard />} />
              <Route path="catalog" element={
                <ProtectedRoute
                  allowedRoles={['REGISTERED_COMPANY']}
                  requireApproved={true}
                >
                  <CatalogPage />
                </ProtectedRoute>
              } />
              <Route path="cart" element={
                <ProtectedRoute
                  allowedRoles={['REGISTERED_COMPANY']}
                  requireApproved={true}
                >
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="orders" element={<CompanyOrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailsPage />} />
              <Route path="profile" element={<EditProfilePage />} />
              <Route path="kyb-pending" element={<KYBPendingPage />} />
            </Route>

            {/* Registration Success Page */}
            <Route
              path="/company/registration-success"
              element={
                <ProtectedRoute allowedRoles={['REGISTERED_COMPANY']}>
                  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50">
                    <div className="text-center max-w-md mx-auto p-8">
                      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Registration Successful!
                      </h1>
                      <p className="text-gray-600 mb-8">
                        Your company registration has been submitted for review.
                        You'll be notified via email once your account is approved.
                      </p>
                      <button
                        onClick={() => window.location.href = '/company/kyb-pending'}
                        className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                      >
                        Check Application Status
                      </button>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Unauthorized Page */}
            <Route path="/unauthorized" element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50">
                <div className="text-center max-w-md mx-auto p-8">
                  <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
                  <h2 className="text-2xl font-semibold mb-4">Unauthorized Access</h2>
                  <p className="text-gray-600 mb-8">
                    You don't have permission to access this page.
                  </p>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Return Home
                  </button>
                </div>
              </div>
            } />

            {/* Subscription Required Page */}
            <Route path="/subscription-required" element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50">
                <div className="text-center max-w-md mx-auto p-8">
                  <h1 className="text-6xl font-bold text-yellow-600 mb-4">⚠️</h1>
                  <h2 className="text-2xl font-semibold mb-4">Subscription Required</h2>
                  <p className="text-gray-600 mb-8">
                    You need an active subscription to access this page. Please make a payment to continue.
                  </p>
                  <button
                    onClick={() => window.location.href = '/admin/subscriptions'}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Go to Subscriptions
                  </button>
                </div>
              </div>
            } />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;