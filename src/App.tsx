import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// Company Pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CatalogPage from "./pages/company/CatalogPage";
import CartPage from "./pages/company/CartPage";
import CompanyOrdersPage from "./pages/company/CompanyOrdersPage";
import EditProfilePage from "./pages/company/Profile";
import KYBPendingPage from "./pages/public/KYBPendingPage";
import OrderDetailsPage from './pages/company/OrderDetailsPage';


// resetpass

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

const App = () => {
  const { initialize, isLoading } = useAuthInitializer();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      await initialize();
      setIsInitialized(true);
    };
    initApp();
  }, [initialize]);

  if (!isInitialized || isLoading) {
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
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="kyb" element={<KYBPage />} />
              <Route path="profile" element={<SuperAdminProfile />} />

            </Route>

            {/* Company Routes - All company routes in one group */}
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

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;