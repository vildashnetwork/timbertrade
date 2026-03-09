import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    FileText,
    Eye,
    Package,
    Download,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    AlertCircle,
    RefreshCw,
    ArrowLeft,
    ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/useAuthStore';
import { useOrderStore } from '@/stores/useOrderStore';
import { useCartStore } from '@/stores/usecartStore.ts';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/types';

// Status options for filter
const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

// Status icon mapping
const STATUS_ICONS: Record<string, any> = {
    PENDING: Clock,
    CONFIRMED: CheckCircle2,
    SHIPPED: Truck,
    DELIVERED: CheckCircle2,
    CANCELLED: XCircle,
};

export default function CompanyOrdersPage() {
    const navigate = useNavigate();
    const { company, user } = useAuthStore();
    const {
        orders,
        isLoading,
        error,
        fetchMyOrders,
        fetchOrderById,
        updateOrderStatus
    } = useOrderStore();
    const { items: cartItems } = useCartStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // Load orders on mount
    useEffect(() => {
        if (company) {
            loadOrders();
        }
    }, [company]);

    const loadOrders = async () => {
        if (!company) return;
        try {
            await fetchMyOrders();
        } catch (error) {
            console.error('Failed to load orders:', error);
            toast.error('Failed to load orders');
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadOrders();
        setIsRefreshing(false);
        toast.success('Orders refreshed');
    };

    const handleViewOrder = async (order: Order) => {
        setIsDetailLoading(true);
        try {
            // Fetch fresh order details
            const detailedOrder = await fetchOrderById(order.id);
            if (detailedOrder) {
                setSelectedOrder(detailedOrder);
            } else {
                // Fallback to the order from list
                setSelectedOrder(order);
            }
        } catch (error) {
            console.error('Failed to load order details:', error);
            toast.error('Failed to load order details');
            setSelectedOrder(order);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleTrackOrder = (orderId: string) => {
        navigate(`/company/orders/${orderId}/track`);
    };

    const handleReorder = (order: Order) => {
        // Navigate to catalog with the items pre-filled
        navigate('/company/catalog');
        toast.info('Browse catalog to reorder items');
    };

    // Filter orders
    const filteredOrders = useMemo(() => {
        if (!orders) return [];

        return orders.filter((order) => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.id.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, statusFilter]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusIcon = (status: OrderStatus) => {
        const Icon = STATUS_ICONS[status] || Package;
        return <Icon className="w-4 h-4" />;
    };

    const getStatusColor = (status: OrderStatus) => {
        return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const calculateOrderSummary = (order: Order) => {
        const subtotal = order.totalAmount;
        const shipping = subtotal > 1000 ? 0 : 50;
        const tax = subtotal * 0.19; // 19% VAT
        return { subtotal, shipping, tax, total: subtotal + shipping + tax };
    };

    if (!company) {
        return (
            <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Company information not found. Please contact support.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageHeader
                    title="My Orders"
                    description="Track your order history and status"
                />
                <div className="flex items-center gap-2">
                    {cartItems.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/company/cart')}
                            className="gap-2"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Cart ({cartItems.length})
                        </Button>
                    )}
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
            </div>

            {/* Filters */}
            <Card className="border-2 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by order number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
                            <SelectTrigger className="w-full md:w-40">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Count */}
            {!isLoading && filteredOrders.length > 0 && (
                <p className="text-sm text-muted-foreground">
                    Showing {filteredOrders.length} of {orders?.length || 0} orders
                </p>
            )}

            {/* Orders List */}
            {isLoading ? (
                <Card className="border-2 shadow-sm">
                    <CardContent className="p-6">
                        <LoadingSkeleton count={3} />
                    </CardContent>
                </Card>
            ) : filteredOrders.length === 0 ? (
                <Card className="border-2 shadow-sm">
                    <CardContent className="py-12">
                        <EmptyState
                            icon={Package}
                            title="No orders found"
                            description={
                                searchQuery || statusFilter !== 'all'
                                    ? "No orders match your search criteria"
                                    : "Your orders will appear here once you place them"
                            }
                            action={
                                <Button
                                    asChild
                                    className="bg-gradient-to-r from-primary to-secondary text-white"
                                >
                                    <a href="/company/catalog">Browse Catalog</a>
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const StatusIcon = STATUS_ICONS[order.status] || Package;

                        return (
                            <Card
                                key={order.id}
                                className="border-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleViewOrder(order)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">
                                                    {order.orderNumber || `Order #${order.id.slice(-6)}`}
                                                </h3>
                                                <Badge className={getStatusColor(order.status)}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {order.status}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Date</p>
                                                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Items</p>
                                                    <p className="font-medium">{order.items?.length || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Total</p>
                                                    <p className="font-medium text-lg text-primary">
                                                        XAF {" " + order.totalAmount?.toLocaleString() || 0}
                                                    </p>
                                                </div>
                                                {/* <div>
                                                    <p className="text-muted-foreground">Documents</p>
                                                    <p className="font-medium">{order.documents?.length || 0}</p>
                                                </div> */}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewOrder(order);
                                                }}
                                                className="touch-target"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Details
                                            </Button>
                                            {order.status === 'SHIPPED' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTrackOrder(order.id);
                                                    }}
                                                    className="touch-target"
                                                >
                                                    <Truck className="w-4 h-4 mr-2" />
                                                    Track
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Order Detail Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {isDetailLoading ? (
                        <div className="p-8">
                            <LoadingSkeleton count={5} />
                        </div>
                    ) : selectedOrder && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-xl">
                                    Order {selectedOrder.orderNumber || `#${selectedOrder.id.slice(-6)}`}
                                    <Badge className={getStatusColor(selectedOrder.status)}>
                                        {getStatusIcon(selectedOrder.status)}
                                        <span className="ml-1">{selectedOrder.status}</span>
                                    </Badge>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                                {/* Order Timeline */}
                                <div className="p-4 bg-muted/30 rounded-lg">
                                    <h4 className="font-medium mb-4">Order Timeline</h4>
                                    <div className="flex items-center justify-between">
                                        {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map(
                                            (status, index) => {
                                                const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
                                                const currentIndex = statusOrder.indexOf(selectedOrder.status);
                                                const isCompleted = index <= currentIndex;
                                                const isCurrent = index === currentIndex;
                                                const StatusIconComponent = STATUS_ICONS[status] || Package;

                                                return (
                                                    <div key={status} className="flex items-center">
                                                        <div className="flex flex-col items-center">
                                                            <div
                                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-muted text-muted-foreground'
                                                                    } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''
                                                                    }`}
                                                            >
                                                                <StatusIconComponent className="w-5 h-5" />
                                                            </div>
                                                            <span className={`text-xs mt-1 ${isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                                                }`}>
                                                                {status}
                                                            </span>
                                                        </div>
                                                        {index < 3 && (
                                                            <div className="w-8 md:w-16 h-0.5 mx-2 bg-muted">
                                                                <div
                                                                    className="h-full bg-primary transition-all"
                                                                    style={{
                                                                        width: index < currentIndex ? '100%' : '0%'
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>

                                {/* Order Details */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/30 rounded-lg">
                                        <h4 className="font-medium mb-2">Order Information</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Order Date</span>
                                                <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Last Updated</span>
                                                <span className="font-medium">{formatDate(selectedOrder.updatedAt)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Payment Status</span>
                                                <span className="font-medium">{selectedOrder.paymentStatus || 'PENDING'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted/30 rounded-lg">
                                        <h4 className="font-medium mb-2">Shipping Address</h4>
                                        <div className="space-y-1 text-sm">
                                            <p className="font-medium">{company.name}</p>
                                            <p className="text-muted-foreground">{selectedOrder.shippingAddress?.address || company.address}</p>
                                            <p className="text-muted-foreground">
                                                {selectedOrder.shippingAddress?.city || 'Douala'}, {selectedOrder.shippingAddress?.country || 'Cameroon'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <h4 className="font-medium mb-3">Order Items</h4>
                                    <div className="space-y-2">
                                        {selectedOrder.items?.map((item) => {
                                            const itemTotal = (item.unitPrice || item.woodItem.price) * item.quantity;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                                            <span className="text-sm font-bold text-primary/60">
                                                                {item.woodItem.species?.charAt(0) || 'W'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{item.woodItem.species}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {item.woodItem.origin || 'Cameroon'} • Grade {item.woodItem.grade || 'A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">
                                                            XAF{" " + itemTotal.toLocaleString()}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.quantity} CBM × XAF{" " + (item.unitPrice || item.woodItem.price).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="mt-4 pt-4 border-t space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>XAF{" " + selectedOrder.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span>{selectedOrder.totalAmount > 1000 ? 'Free' : 'XAF 50'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Tax (19% VAT)</span>
                                            <span>XAF  {" " + (selectedOrder.totalAmount * 0.19).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Total Amount</span>
                                            <span className="text-xl font-bold text-primary">
                                                XAF{" " + (selectedOrder.totalAmount * 1.19 + (selectedOrder.totalAmount > 1000 ? 0 : 50)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents */}
                                {/* <div>
                                    <h4 className="font-medium mb-3">Documents</h4>
                                    {!selectedOrder.documents || selectedOrder.documents.length === 0 ? (
                                        <p className="text-sm text-muted-foreground p-6 border border-dashed rounded-lg text-center">
                                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            Documents will be available once the order is confirmed
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedOrder.documents.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                                                >
                                                    <FileText className="w-5 h-5 text-primary" />
                                                    <div className="flex-1">
                                                        <p className="font-medium">{doc.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {doc.type?.replace(/_/g, ' ') || 'Document'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(doc.url, '_blank')}
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </Button>
                                                </div>
                                            ))}
                        </div>
                                    )}
                                </div> */}

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    {selectedOrder.status === 'DELIVERED' && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleReorder(selectedOrder)}
                                        >
                                            Reorder Items
                                        </Button>
                                    )}
                                    {selectedOrder.status === 'SHIPPED' && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleTrackOrder(selectedOrder.id)}
                                        >
                                            <Truck className="w-4 h-4 mr-2" />
                                            Track Shipment
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => setSelectedOrder(null)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}