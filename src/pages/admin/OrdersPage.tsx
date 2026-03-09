import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    FileText,
    Eye,
    Package,
    RefreshCw,
    Loader2,
    Download,
    X,
    CheckCircle2,
    XCircle,
    Clock,
    Truck,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Printer,
    Mail,
    FileSpreadsheet,
    FileJson,
    File as FileIcon,
    Image as ImageIcon,
    Trash2,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableRowSkeleton } from '@/components/shared/LoadingSkeleton';
import { useOrderStore } from '@/stores/useOrderStore';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWoodStore } from '@/stores/useWoodStore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Order, OrderStatus } from '@/types';

// Status configuration
const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string; progress: number }> = {
    'PENDING': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Pending',
        progress: 25
    },
    'CONFIRMED': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle2,
        label: 'Confirmed',
        progress: 50
    },
    'PROCESSING': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Package,
        label: 'Processing',
        progress: 60
    },
    'SHIPPED': {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: Truck,
        label: 'Shipped',
        progress: 75
    },
    'DELIVERED': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle2,
        label: 'Delivered',
        progress: 100
    },
    'CANCELLED': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        label: 'Cancelled',
        progress: 0
    }
};

export default function OrdersPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        orders,
        isLoading,
        error,
        fetchAllOrders,
        fetchOrderById,
        updateOrderStatus,
        selectedOrder,
        clearSelectedOrder
    } = useOrderStore();
    const { companies, fetchAllCompanies } = useCompanyStore();
    const { woodItems } = useWoodStore();

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [companyFilter, setCompanyFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
    const [selectedOrderLocal, setSelectedOrderLocal] = useState<Order | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('details');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Load orders on mount
    useEffect(() => {
        loadOrders();
    }, []);

    // Set selected order when store updates
    useEffect(() => {
        if (selectedOrder) {
            setSelectedOrderLocal(selectedOrder);
            setDetailDialogOpen(true);
        }
    }, [selectedOrder]);

    const loadOrders = async () => {
        try {
            await Promise.all([
                fetchAllOrders(currentPage),
                fetchAllCompanies().catch(err => {
                    console.log('Companies endpoint not available yet');
                    return [];
                })
            ]);
        } catch (error) {
            console.error('Failed to load orders:', error);
            if (error.response?.status !== 404) {
                toast.error('Failed to load orders');
            }
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadOrders();
        setIsRefreshing(false);
        toast.success('Orders refreshed');
    };

    // Filter orders
    const filteredOrders = useMemo(() => {
        if (!orders) return [];

        return orders.filter((order) => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.user?.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.user?.company?.email?.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

            // Company filter
            const companyId = order.user?.company?.id || order.user?.company?._id;
            const matchesCompany = companyFilter === 'all' || companyId === companyFilter;

            // Date filter
            let matchesDate = true;
            if (dateRange !== 'all') {
                const orderDate = new Date(order.createdAt);
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                
                if (dateRange === 'today') {
                    matchesDate = orderDate >= today;
                } else if (dateRange === 'week') {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    matchesDate = orderDate >= weekAgo;
                } else if (dateRange === 'month') {
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    matchesDate = orderDate >= monthAgo;
                }
            }

            return matchesSearch && matchesStatus && matchesCompany && matchesDate;
        });
    }, [orders, searchQuery, statusFilter, companyFilter, dateRange]);

    // Pagination
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredOrders.slice(start, end);
    }, [filteredOrders, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        setUpdatingStatus(orderId);
        try {
            const success = await updateOrderStatus(orderId, newStatus);
            if (success) {
                toast.success(`Order status updated to ${newStatus}`);
                if (selectedOrderLocal?.id === orderId) {
                    setSelectedOrderLocal(prev => prev ? { ...prev, status: newStatus } : null);
                }
            }
        } catch (error) {
            toast.error('Failed to update order status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleViewOrder = async (order: Order) => {
        try {
            const detailedOrder = await fetchOrderById(order.id);
            if (detailedOrder) {
                setSelectedOrderLocal(detailedOrder);
                setDetailDialogOpen(true);
            }
        } catch (error) {
            console.error('Failed to fetch order details:', error);
            toast.error('Failed to load order details');
        }
    };

    // Navigate to wood details page
    const handleViewWoodDetails = (woodId: string) => {
        navigate(`/woods/${woodId}`);
    };

    // PDF Invoice Generation
    const generatePDFInvoice = async (order: Order) => {
        setIsGeneratingPDF(true);
        toast.info('Generating PDF invoice...');

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;

            // Add company logo/header
            doc.setFillColor(34, 197, 94);
            doc.rect(0, 0, pageWidth, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('TIMBERTRADE', margin, 25);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Premium Timber Export', margin, 32);

            // Invoice Title
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('INVOICE', pageWidth - margin - 40, 25);

            // Invoice details
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Invoice #: INV-${order.orderNumber}`, pageWidth - margin - 40, 35);
            doc.text(`Date: ${format(new Date(), 'PPP')}`, pageWidth - margin - 40, 42);

            // Company and Bill To sections
            let yPos = 55;

            // From (Company)
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('FROM:', margin, yPos);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            yPos += 7;
            doc.text('TimberTrade Admin', margin, yPos);
            yPos += 5;
            doc.text('admin@timbertrade.com', margin, yPos);
            yPos += 5;
            doc.text('+237 600 000 000', margin, yPos);

            // Bill To (Customer)
            yPos = 55;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('BILL TO:', pageWidth / 2, yPos);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            yPos += 7;
            doc.text(order.user?.company?.name || 'N/A', pageWidth / 2, yPos);
            yPos += 5;
            doc.text(order.user?.company?.email || order.user?.email || 'N/A', pageWidth / 2, yPos);
            yPos += 5;
            doc.text(order.user?.company?.phone || 'N/A', pageWidth / 2, yPos);
            yPos += 5;
            doc.text(order.user?.company?.address || 'N/A', pageWidth / 2, yPos);

            // Order Information
            yPos += 15;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('ORDER INFORMATION', margin, yPos);
            
            yPos += 7;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Order Number: ${order.orderNumber}`, margin, yPos);
            yPos += 5;
            doc.text(`Order Date: ${format(new Date(order.createdAt), 'PPP')}`, margin, yPos);
            yPos += 5;
            doc.text(`Order Status: ${order.status}`, margin, yPos);
            yPos += 5;
            doc.text(`Payment Status: PAID`, margin, yPos);

            // Items Table
            yPos += 10;
            const tableData = order.items.map(item => [
                item.woodItem.species,
                `${item.quantity} CBM`,
                `XAF${item.unitPrice.toLocaleString()}`,
                `XAF${item.totalPrice.toLocaleString()}`
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Product', 'Quantity', 'Unit Price', 'Total']],
                body: tableData,
                foot: [[
                    'Subtotal',
                    '',
                    '',
                    `XAF ${order.totalAmount.toLocaleString()}`
                ]],
                theme: 'grid',
                headStyles: { 
                    fillColor: [34, 197, 94],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                footStyles: {
                    fillColor: [240, 240, 240],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 60 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 50 },
                    3: { cellWidth: 50 }
                }
            });

            // Summary
            const finalY = (doc as any).lastAutoTable.finalY + 10;
            
            const shipping = order.totalAmount > 1000 ? 0 : 50;
            const tax = order.totalAmount * 0.19;
            const total = order.totalAmount + shipping + tax;

            doc.setFontSize(10);
            doc.text('Shipping:', pageWidth - margin - 60, finalY);
            doc.text(shipping === 0 ? 'Free' : `XAF ${shipping}`, pageWidth - margin, finalY, { align: 'right' });
            
            doc.text('Tax (19% VAT):', pageWidth - margin - 60, finalY + 7);
            doc.text(`XAF ${tax.toFixed(2)}`, pageWidth - margin, finalY + 7, { align: 'right' });
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('TOTAL:', pageWidth - margin - 60, finalY + 17);
            doc.text(`XAF ${total.toFixed(2)}`, pageWidth - margin, finalY + 17, { align: 'right' });

            // Footer
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(128, 128, 128);
            doc.text('Thank you for your business!', margin, doc.internal.pageSize.getHeight() - 10);
            doc.text('This is a computer generated invoice.', pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });

            // Save the PDF
            doc.save(`Invoice-${order.orderNumber}.pdf`);
            toast.success('Invoice downloaded successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate invoice');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handlePrintInvoice = (order: Order) => {
        generatePDFInvoice(order);
    };

    const handleViewDocument = (doc: any) => {
        setSelectedDocument(doc);
        setDocumentDialogOpen(true);
    };

    const handleDownloadDocument = (doc: any) => {
        window.open(doc.url, '_blank');
    };

    const handleContactCustomer = (order: Order) => {
        const email = order.user?.company?.email || order.user?.email;
        if (email) {
            window.location.href = `mailto:${email}?subject=Question about Order ${order.orderNumber}`;
        } else {
            toast.error('Customer email not available');
        }
    };

    const handleCloseDialog = () => {
        setDetailDialogOpen(false);
        setSelectedOrderLocal(null);
        clearSelectedOrder();
        setActiveTab('details');
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'PPP');
    };

    const formatDateTime = (dateString: string) => {
        return format(new Date(dateString), 'PPP p');
    };

    const getStatusColor = (status: OrderStatus) => {
        return STATUS_CONFIG[status]?.color || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: OrderStatus) => {
        const Icon = STATUS_CONFIG[status]?.icon || Package;
        return <Icon className="w-4 h-4" />;
    };

    // Calculate statistics
    const stats = useMemo(() => {
        if (!orders) return { total: 0, pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0, revenue: 0 };

        const total = orders.length;
        const pending = orders.filter(o => o.status === 'PENDING').length;
        const confirmed = orders.filter(o => o.status === 'CONFIRMED').length;
        const shipped = orders.filter(o => o.status === 'SHIPPED').length;
        const delivered = orders.filter(o => o.status === 'DELIVERED').length;
        const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
        const revenue = orders
            .filter(o => o.status === 'DELIVERED')
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        return { total, pending, confirmed, shipped, delivered, cancelled, revenue };
    }, [orders]);

    // Clear filters
    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCompanyFilter('all');
        setDateRange('all');
        setCurrentPage(1);
    };

    if (isLoading && !orders.length) {
        return (
            <div className="space-y-6 animate-fade-in p-6">
                <PageHeader
                    title="Order Management"
                    description="Track and manage customer orders"
                />
                <Card className="border-2 shadow-sm">
                    <CardContent className="p-6">
                        <TableRowSkeleton columns={7} count={5} />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageHeader
                    title="Order Management"
                    description="Track and manage customer orders"
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                <Card className="border-2 shadow-sm">
                    <CardContent className="p-3 text-center">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-bold">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-yellow-200 shadow-sm">
                    <CardContent className="p-3 text-center">
                        <p className="text-xs text-yellow-600">Pending</p>
                        <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-blue-200 shadow-sm">
                    <CardContent className="p-3 text-center">
                        <p className="text-xs text-blue-600">Confirmed</p>
                        <p className="text-lg font-bold text-blue-600">{stats.confirmed}</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-purple-200 shadow-sm">
                    <CardContent className="p-3 text-center">
                        <p className="text-xs text-purple-600">Shipped</p>
                        <p className="text-lg font-bold text-purple-600">{stats.shipped}</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-green-200 shadow-sm">
                    <CardContent className="p-3 text-center">
                        <p className="text-xs text-green-600">Delivered</p>
                        <p className="text-lg font-bold text-green-600">{stats.delivered}</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-red-200 shadow-sm">
                    <CardContent className="p-3 text-center">
                        <p className="text-xs text-red-600">Cancelled</p>
                        <p className="text-lg font-bold text-red-600">{stats.cancelled}</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-primary-200 shadow-sm">
                    <CardContent className="p-3 text-center">
                        <p className="text-xs text-primary">Revenue</p>
                        <p className="text-sm font-bold text-primary">XAF {stats.revenue.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Filters */}
            <Card className="border-2 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by order number or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-10"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full lg:w-40">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                <SelectItem value="PROCESSING">Processing</SelectItem>
                                <SelectItem value="SHIPPED">Shipped</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={companyFilter} onValueChange={setCompanyFilter}>
                            <SelectTrigger className="w-full lg:w-40">
                                <SelectValue placeholder="Company" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Companies</SelectItem>
                                {companies?.map(company => {
                                    const companyId = company.id || company._id;
                                    return (
                                        <SelectItem key={companyId} value={companyId}>
                                            {company.name}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>

                        <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                            <SelectTrigger className="w-full lg:w-40">
                                <SelectValue placeholder="Date Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>

                        {(searchQuery || statusFilter !== 'all' || companyFilter !== 'all' || dateRange !== 'all') && (
                            <Button
                                variant="ghost"
                                onClick={clearFilters}
                                className="text-muted-foreground"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {paginatedOrders.length} of {filteredOrders.length} orders
                </p>
            </div>

            {/* Table */}
            <Card className="border-2 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRowSkeleton key={i} columns={7} />
                                ))
                            ) : paginatedOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <EmptyState
                                            icon={Package}
                                            title="No orders found"
                                            description={
                                                searchQuery || statusFilter !== 'all' || companyFilter !== 'all' || dateRange !== 'all'
                                                    ? "No orders match your search criteria"
                                                    : "Orders will appear here when companies place them"
                                            }
                                            action={
                                                (searchQuery || statusFilter !== 'all' || companyFilter !== 'all' || dateRange !== 'all') && (
                                                    <Button variant="outline" onClick={clearFilters}>
                                                        Clear Filters
                                                    </Button>
                                                )
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{order.user?.company?.name || 'N/A'}</p>
                                                <p className="text-sm text-muted-foreground">{order.user?.company?.email || order.user?.email || 'N/A'}</p>
                                                <p className="text-xs text-muted-foreground">{order.user?.company?.phone || 'N/A'}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{order.items?.length || 0} item(s)</TableCell>
                                        <TableCell className="font-medium">
                                            XAF {order.totalAmount?.toLocaleString() || 0}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(order.status)}>
                                                <span className="flex items-center gap-1">
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(order.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewOrder(order)}
                                                    className="h-8 w-8 hover:text-primary"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => generatePDFInvoice(order)}
                                                    disabled={isGeneratingPDF}
                                                    className="h-8 w-8 hover:text-primary"
                                                    title="Download Invoice"
                                                >
                                                    {isGeneratingPDF ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Download className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Document Preview Dialog */}
            <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDocument?.name}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedDocument?.type} • Uploaded {selectedDocument && formatDate(selectedDocument.uploadedAt)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        {selectedDocument?.url.endsWith('.pdf') ? (
                            <iframe
                                src={selectedDocument.url}
                                className="w-full h-[500px] rounded-lg border"
                                title="Document Preview"
                            />
                        ) : (
                            <img
                                src={selectedDocument?.url}
                                alt="Document"
                                className="w-full rounded-lg border"
                            />
                        )}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => window.open(selectedDocument?.url, '_blank')}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                        <Button onClick={() => setDocumentDialogOpen(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Order Detail Dialog */}
            <Dialog open={detailDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {selectedOrderLocal && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-xl">
                                    Order {selectedOrderLocal.orderNumber}
                                    <Badge className={getStatusColor(selectedOrderLocal.status)}>
                                        <span className="flex items-center gap-1">
                                            {getStatusIcon(selectedOrderLocal.status)}
                                            {selectedOrderLocal.status}
                                        </span>
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription>
                                    Placed on {formatDateTime(selectedOrderLocal.createdAt)}
                                </DialogDescription>
                            </DialogHeader>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="items">Items</TabsTrigger>
                                </TabsList>

                                <TabsContent value="details" className="space-y-4 mt-4">
                                    {/* Company Info */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Customer Information</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Company Name</p>
                                                    <p className="font-medium">{selectedOrderLocal.user?.company?.name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Email</p>
                                                    <p className="font-medium">{selectedOrderLocal.user?.company?.email || selectedOrderLocal.user?.email || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Phone</p>
                                                    <p className="font-medium">{selectedOrderLocal.user?.company?.phone || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Tax ID</p>
                                                    <p className="font-medium">{selectedOrderLocal.user?.company?.taxId || 'N/A'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-sm text-muted-foreground">Address</p>
                                                    <p className="font-medium">{selectedOrderLocal.user?.company?.address || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Shipping Address */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Shipping Address</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm">
                                                {selectedOrderLocal.shippingAddress?.address || selectedOrderLocal.user?.company?.address || 'N/A'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedOrderLocal.shippingAddress?.city || 'Douala'}, {selectedOrderLocal.shippingAddress?.country || 'Cameroon'}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Order Summary */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Order Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Subtotal</span>
                                                    <span>XAF {selectedOrderLocal.totalAmount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Shipping</span>
                                                    <span>{selectedOrderLocal.totalAmount > 1000 ? 'Free' : 'XAF 50'}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Tax (19% VAT)</span>
                                                    <span>XAF {(selectedOrderLocal.totalAmount * 0.19).toFixed(2)}</span>
                                                </div>
                                                <Separator className="my-2" />
                                                <div className="flex justify-between font-medium">
                                                    <span>Total</span>
                                                    <span className="text-lg text-primary">
                                                        XAF {(selectedOrderLocal.totalAmount * 1.19 + (selectedOrderLocal.totalAmount > 1000 ? 0 : 50)).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Timeline */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Order Timeline</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">Order Placed</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDateTime(selectedOrderLocal.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                {selectedOrderLocal.status !== 'PENDING' && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                        <div>
                                                            <p className="text-sm font-medium">Status Updated to {selectedOrderLocal.status}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatDateTime(selectedOrderLocal.updatedAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="items" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        {selectedOrderLocal.items?.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                                                onClick={() => handleViewWoodDetails(item.woodItem.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                                        <span className="text-sm font-bold text-primary/60">
                                                            {item.woodItem.species?.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium hover:text-primary transition-colors">
                                                            {item.woodItem.species}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.woodItem.origin} • Grade {item.woodItem.grade}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Dimensions: {item.woodItem.dimensions}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">${item.totalPrice.toLocaleString()}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.quantity} CBM × XAF {item.unitPrice}
                                                    </p>
                                                    <p className="text-xs text-primary mt-1">
                                                        Click to view details
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {/* Status Update */}
                            <div className="pt-4 border-t mt-4">
                                <h4 className="font-medium mb-3">Update Status</h4>
                                <div className="flex gap-2 flex-wrap">
                                    {(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(
                                        (status) => {
                                            const isCurrent = selectedOrderLocal.status === status;
                                            const isUpdating = updatingStatus === selectedOrderLocal.id;
                                            
                                            return (
                                                <Button
                                                    key={status}
                                                    variant={isCurrent ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(selectedOrderLocal.id, status)}
                                                    disabled={isCurrent || isUpdating}
                                                    className={isCurrent ? STATUS_CONFIG[status]?.color : ''}
                                                >
                                                    {isUpdating && updatingStatus === selectedOrderLocal.id ? (
                                                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                                    ) : null}
                                                    {status}
                                                </Button>
                                            );
                                        }
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => generatePDFInvoice(selectedOrderLocal)}
                                    disabled={isGeneratingPDF}
                                >
                                    {isGeneratingPDF ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Printer className="w-4 h-4 mr-2" />
                                    )}
                                    Print Invoice
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleContactCustomer(selectedOrderLocal)}
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Contact Customer
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}