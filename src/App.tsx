import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";

// Auth
import LoginPage from "./pages/auth/LoginPage";

// Public
import PublicCatalog from "./pages/public/PublicCatalog";
import RegisterPage from "./pages/public/RegisterPage";

// Layouts
import { AdminLayout } from "./components/layouts/AdminLayout";
import { CompanyLayout } from "./components/layouts/CompanyLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import InventoryPage from "./pages/admin/InventoryPage";
import OrdersPage from "./pages/admin/OrdersPage";
import KYBPage from "./pages/admin/KYBPage";

// Company Pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CatalogPage from "./pages/company/CatalogPage";
import CartPage from "./pages/company/CartPage";
import CompanyOrdersPage from "./pages/company/CompanyOrdersPage";
import KYBPendingPage from "./pages/company/KYBPendingPage";

// Protected Route
import { ProtectedRoute } from "./components/shared/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicCatalog />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="kyb" element={<KYBPage />} />
          </Route>

          {/* Company Routes */}
          <Route
            path="/company"
            element={
              <ProtectedRoute allowedRoles={['REGISTERED_COMPANY']}>
                <CompanyLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CompanyDashboard />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="orders" element={<CompanyOrdersPage />} />
          </Route>

          {/* KYB Pending (Company must be logged in but not approved) */}
          <Route
            path="/company/kyb-pending"
            element={
              <ProtectedRoute allowedRoles={['REGISTERED_COMPANY']}>
                <KYBPendingPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
