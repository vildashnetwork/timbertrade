import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Package,
    ShoppingCart,
    Building2,
    TrendingUp,
    AlertTriangle,
    Clock,
    ArrowRight,
    Users,
    DollarSign,
    RefreshCw,
    Loader2,
    CheckCircle2,
    XCircle,
    Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/useAuthStore';
import { useOrderStore } from '@/stores/useOrderStore';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { useWoodStore } from '@/stores/useWoodStore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { DashboardStats, Order, Company } from '@/types';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        orders,
        isLoading: ordersLoading,
        fetchAllOrders,
        fetchOrderById
    } = useOrderStore();
    const {
        companies,
        pendingCompanies,
        isLoading: companiesLoading,
        fetchAllCompanies,
        fetchPendingCompanies,
        approveCompany,
        rejectCompany
    } = useCompanyStore();
    const {
        woodItems,
        isLoading: woodsLoading,
        fetchWoodItems
    } = useWoodStore();

    // Local state
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [recentPendingCompanies, setRecentPendingCompanies] = useState<Company[]>([]);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    // Load data on mount
    useEffect(() => {
        loadDashboardData();
    }, []);

    // Update stats when data changes
    useEffect(() => {
        calculateStats();
    }, [orders, pendingCompanies, woodItems]);

    // Update recent items
    useEffect(() => {
        if (orders && orders.length > 0) {
            setRecentOrders(orders.slice(0, 5));
        }
    }, [orders]);

    useEffect(() => {
        if (pendingCompanies && pendingCompanies.length > 0) {
            setRecentPendingCompanies(pendingCompanies.slice(0, 5));
        }
    }, [pendingCompanies]);

    const loadDashboardData = async () => {
        try {
            await Promise.all([
                fetchAllOrders(1),
                fetchAllCompanies(),
                fetchPendingCompanies(),
                fetchWoodItems(1)
            ]);
            toast.success('Dashboard data refreshed');
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            toast.error('Failed to load dashboard data');
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadDashboardData();
        setIsRefreshing(false);
    };

    const calculateStats = () => {
        // Calculate total revenue from orders
        const totalRevenue = orders?.reduce((sum, order) => {
            // Only count completed/paid orders
            if (order.status === 'DELIVERED' || order.status === 'CONFIRMED') {
                return sum + (order.totalAmount || 0);
            }
            return sum;
        }, 0) || 0;

        // Count pending orders
        const pendingOrders = orders?.filter(order =>
            order.status === 'PENDING' || order.status === 'PROCESSING'
        ).length || 0;

        // Count pending KYB
        const pendingKYB = pendingCompanies?.length || 0;

        // Count low stock items
        const lowStockItems = woodItems?.filter(item =>
            item.status === 'LOW_STOCK' || (item.stockLevel && item.stockLevel < 10)
        ).length || 0;

        // Calculate total companies
        const totalCompanies = companies?.length || 0;

        // Calculate average order value
        const averageOrderValue = orders && orders.length > 0
            ? totalRevenue / orders.length
            : 0;

        setStats({
            totalRevenue,
            pendingOrders,
            pendingKYB,
            lowStockItems,
            totalCompanies,
            averageOrderValue,
            totalOrders: orders?.length || 0,
            completedOrders: orders?.filter(o => o.status === 'DELIVERED').length || 0
        });
    };

    const handleApproveCompany = async (companyId: string) => {
        setIsProcessing(companyId);
        try {
            const success = await approveCompany(companyId);
            if (success) {
                toast.success('Company approved successfully');
                await loadDashboardData();
            }
        } catch (error) {
            toast.error('Failed to approve company');
        } finally {
            setIsProcessing(null);
        }
    };

    const handleRejectCompany = async (companyId: string) => {
        setIsProcessing(companyId);
        try {
            const success = await rejectCompany(companyId);
            if (success) {
                toast.success('Company rejected');
                await loadDashboardData();
            }
        } catch (error) {
            toast.error('Failed to reject company');
        } finally {
            setIsProcessing(null);
        }
    };

    const handleViewOrder = (orderId: string) => {
        navigate(`/admin/orders/${orderId}`);
    };

    const handleViewCompany = (companyId: string) => {
        navigate(`/admin/companies/${companyId}`);
    };

    // Stat cards configuration
    const statCards = [
        {
            title: 'Total Revenue',
            value: stats ? `XAF ${stats.totalRevenue.toLocaleString()}` : '-',
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            trend: stats?.totalOrders ? `From ${stats.totalOrders} orders` : null
        },
        {
            title: 'Pending Orders',
            value: stats?.pendingOrders ?? '-',
            icon: ShoppingCart,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
            trend: stats?.pendingOrders ? 'Awaiting processing' : null
        },
        {
            title: 'Pending KYB',
            value: stats?.pendingKYB ?? '-',
            icon: Building2,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            trend: stats?.pendingKYB ? 'Awaiting verification' : null
        },
        {
            title: 'Total Companies',
            value: stats?.totalCompanies ?? '-',
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            trend: `${stats?.totalCompanies || 0} registered`
        },
        {
            title: 'Low Stock Items',
            value: stats?.lowStockItems ?? '-',
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            trend: stats?.lowStockItems ? 'Need reorder' : null
        },
        {
            title: 'Avg Order Value',
            value: stats?.averageOrderValue ? `$${stats.averageOrderValue.toLocaleString()}` : '-',
            icon: TrendingUp,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
            trend: 'Per order average'
        }
    ];

    const isLoading = ordersLoading || companiesLoading || woodsLoading;

    return (
        <div className="space-y-6 animate-fade-in p-6">
            {/* Header with Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageHeader
                    title="Admin Dashboard"
                    description={`Welcome back, ${user?.name || 'Admin'}`}
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="border-2 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    {isLoading && !stats ? (
                                        <Skeleton className="h-8 w-16 mt-1" />
                                    ) : (
                                        <>
                                            <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                            {stat.trend && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {stat.trend}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => navigate('/admin/orders')}
                >
                    <Package className="w-6 h-6 text-primary" />
                    <span>Manage Orders</span>
                </Button>
                <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => navigate('/admin/kyb')}
                >
                    <Building2 className="w-6 h-6 text-secondary" />
                    <span>Companies</span>
                </Button>
                <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => navigate('/admin/kyb')}
                >
                    <Users className="w-6 h-6 text-blue-600" />
                    <span>KYB Approvals</span>
                </Button>
                <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => navigate('/admin/inventory')}
                >
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <span>Inventory</span>
                </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card className="border-2 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Recent Orders</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/admin/orders" className="text-primary hover:text-primary/80">
                                View all <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : recentOrders.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No orders yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => navigate("/admin/orders")}
                                    >
                                        <div>
                                            <p className="font-medium">{order.orderNumber}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.company?.name || 'N/A'} • {format(new Date(order.createdAt), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status={order.status} />
                                            <p className="text-sm font-medium mt-1">
                                                XAF {order.totalAmount?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pending KYB */}
                <Card className="border-2 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Pending KYB Approvals</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/admin/kyb" className="text-primary hover:text-primary/80">
                                View all <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        ) : recentPendingCompanies.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No pending approvals</p>
                                <p className="text-sm">All companies are verified</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentPendingCompanies.map((company) => (
                                    <div
                                        key={company.id}
                                        className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium">{company.name}</div>
                                            <StatusBadge status={company.status} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                            <div>
                                                <span className="text-muted-foreground">Tax ID:</span>
                                                <p className="font-medium">{company.taxId}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Documents:</span>
                                                <p className="font-medium">{company.kybDocs?.length || 0} uploaded</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleApproveCompany(company.id)}
                                                disabled={isProcessing === company.id}
                                            >
                                                {isProcessing === company.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                        Approve
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 text-red-600 hover:text-red-700"
                                                onClick={() => handleRejectCompany(company.id)}
                                                disabled={isProcessing === company.id}
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleViewCompany(company.id)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Alert */}
            {stats?.lowStockItems ? stats.lowStockItems > 0 : false && (
                <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-700">
                        {stats.lowStockItems} item(s) are running low on stock.
                        <Button
                            variant="link"
                            className="text-yellow-800 font-medium px-1 h-auto"
                            onClick={() => navigate('/admin/inventory')}
                        >
                            Review Inventory
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-full">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Orders</p>
                                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats?.completedOrders || 0} completed
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-secondary-50 to-primary-50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-full">
                                <Users className="w-6 h-6 text-secondary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active Companies</p>
                                <p className="text-2xl font-bold">{stats?.totalCompanies || 0}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats?.pendingKYB || 0} pending approval
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-full">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                                <p className="text-2xl font-bold">
                                    XAF {stats?.totalRevenue?.toLocaleString() || 0}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Avg XAF {stats?.averageOrderValue?.toLocaleString() || 0} per order
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}