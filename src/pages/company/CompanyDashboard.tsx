import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/usecartStore';
import { useOrderStore } from '@/stores/useOrderStore';
import { toast } from 'sonner';
import type { Order } from '@/types';
import { format } from 'date-fns';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { company, user, refreshCompanyData } = useAuthStore();
  const { items: cartItems, getTotalPrice: getCartTotal } = useCartStore();
  const {
    orders,
    isLoading: ordersLoading,
    fetchMyOrders,
    fetchOrderById
  } = useOrderStore();

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0
  });

  // Calculate cart totals
  const cartItemCount = cartItems?.length || 0;
  const cartTotal = getCartTotal?.() || 0;

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Update stats when orders change
  useEffect(() => {
    if (orders && orders.length > 0) {
      calculateStats(orders);
      setRecentOrders(orders.slice(0, 5)); // Show 5 most recent orders
    } else {
      setRecentOrders([]);
      setStats({
        totalSpent: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        averageOrderValue: 0
      });
    }
  }, [orders]);

  const loadOrders = async () => {
    try {
      await fetchMyOrders();
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const calculateStats = (orderList: Order[]) => {
    const total = orderList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pending = orderList.filter(o => o.status === 'PENDING').length;
    const completed = orderList.filter(o => o.status === 'DELIVERED' || o.status === 'CONFIRMED').length;
    const cancelled = orderList.filter(o => o.status === 'CANCELLED').length;

    setStats({
      totalSpent: total,
      totalOrders: orderList.length,
      pendingOrders: pending,
      completedOrders: completed,
      cancelledOrders: cancelled,
      averageOrderValue: orderList.length > 0 ? total / orderList.length : 0
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshCompanyData?.(),
        fetchMyOrders()
      ]);
      toast.success('Dashboard updated');
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'DELIVERED':
      case 'CONFIRMED':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state
  if (ordersLoading && !orders.length) {
    return (
      <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <PageHeader
          title={`Welcome back, ${user?.name || company?.name || 'Company'}`}
          description="Manage your timber procurement and track orders"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KYB Status Alert */}
      {company?.status !== 'APPROVED' && (
        <Alert
          variant="default"
          className={`border-2 ${company?.status === 'PENDING'
            ? 'border-yellow-200 bg-yellow-50'
            : 'border-red-200 bg-red-50'
            }`}
        >
          <AlertCircle className={`h-4 w-4 ${company?.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
            }`} />
          <AlertTitle className={company?.status === 'PENDING' ? 'text-yellow-800' : 'text-red-800'}>
            KYB Verification {company?.status === 'PENDING' ? 'Pending' : 'Suspended'}
          </AlertTitle>
          <AlertDescription className={company?.status === 'PENDING' ? 'text-yellow-700' : 'text-red-700'}>
            {company?.status === 'PENDING'
              ? 'Your company verification is under review. You can browse the catalog but cannot place orders until approved.'
              : 'Your account has been suspended. Please contact support for assistance.'}
          </AlertDescription>
          {company?.status === 'PENDING' && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 bg-white"
              asChild
            >
              <Link to="/company/kyb-pending">Check Status</Link>
            </Button>
          )}
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold mt-1">
                  XAF {" " + stats.totalSpent.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg. XAF {" " + stats.averageOrderValue.toLocaleString()}/order
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completedOrders} completed
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1">{stats.pendingOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting processing
                </p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Cart</p>
                <p className="text-2xl font-bold mt-1">{cartItemCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  XAF {" " + cartTotal.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Browse Catalog</h3>
                <p className="text-sm text-muted-foreground">
                  Explore our premium timber selection
                </p>
              </div>
              <Button asChild className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90">
                <Link to="/company/catalog">
                  Browse <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {cartItemCount > 0 && company?.status === 'APPROVED' && (
          <Card className="hover:shadow-lg transition-shadow border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Complete Your Order</h3>
                  <p className="text-sm text-muted-foreground">
                    {cartItemCount} items • XAF{" " + cartTotal.toLocaleString()}
                  </p>
                </div>
                <Button asChild className="bg-secondary hover:bg-secondary/90 text-white">
                  <Link to="/company/cart">
                    Checkout <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {cartItemCount > 0 && company?.status !== 'APPROVED' && (
          <Card className="hover:shadow-lg transition-shadow border-2 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-200 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800">Approval Required</h3>
                  <p className="text-sm text-yellow-700">
                    {cartItemCount} items in cart. Complete KYB to checkout.
                  </p>
                </div>
                <Button variant="outline" asChild className="border-yellow-300 text-yellow-800">
                  <Link to="/company/kyb-pending">
                    View Status
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Orders */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
            <Link to="/company/orders">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">No orders yet</p>
              <p className="text-sm mb-4">Start by browsing our catalog and placing your first order.</p>
              <Button asChild className="bg-gradient-to-r from-primary to-secondary text-white">
                <Link to="/company/catalog">
                  Browse Catalog
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/company/orders`)}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-medium">
                        {order.orderNumber || `Order #${order.id.slice(-6)}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), 'MMM dd, yyyy')} • {order.items?.length || 0} item(s)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">
                      XAF {" " + order.totalAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Progress Summary (if there are pending orders) */}
      {stats.pendingOrders > 0 && (
        <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
          <CardHeader>
            <CardTitle className="text-lg">Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Processing</span>
                  <span className="font-medium">
                    {stats.completedOrders}/{stats.totalOrders} completed
                  </span>
                </div>
                <Progress
                  value={(stats.completedOrders / stats.totalOrders) * 100}
                  className="h-2"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                You have {stats.pendingOrders} pending order(s) being processed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper Badge component
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}