import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    Truck,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    Download,
    Calendar,
    MapPin,
    User,
    Building2,
    CreditCard,
    Loader2,
    Printer,
    Mail,
    Phone,
    ChevronRight,
    ShoppingBag,
    FileSpreadsheet,
    FileJson,
    File as FileIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrderStore } from '@/stores/useOrderStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export default function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectedOrder, fetchOrderById, isLoading, error } = useOrderStore();
    const { company, user } = useAuthStore();
    const { addItem } = useCartStore();

    // Local state
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [showDocumentDialog, setShowDocumentDialog] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [trackingStep, setTrackingStep] = useState(0);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const order = selectedOrder;

    // Load order details on mount
    useEffect(() => {
        if (id) {
            loadOrderDetails();
        }
    }, [id]);

    useEffect(() => {
        if (order) {
            // Set tracking step based on status
            const steps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
            const currentIndex = steps.indexOf(order.status);
            setTrackingStep(currentIndex >= 0 ? currentIndex : 0);
        }
    }, [order]);

    const loadOrderDetails = async () => {
        if (id) {
            await fetchOrderById(id);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadOrderDetails();
        setIsRefreshing(false);
        toast.success('Order details refreshed');
    };

    const handleReorder = () => {
        if (!order) return;

        // Add all items to cart
        order.items.forEach(item => {
            addItem(item.woodItem, item.quantity);
        });

        toast.success('Items added to cart', {
            description: `${order.items.length} item(s) added to your cart`
        });

        navigate('/company/cart');
    };

    // Generate PDF Invoice
    const generatePDF = async (format: 'pdf' | 'csv' | 'excel' = 'pdf') => {
        if (!order || !company || !user) return;

        setIsGeneratingPDF(true);
        toast.info(`Generating ${format.toUpperCase()} invoice...`);

        try {
            if (format === 'pdf') {
                await generatePDFInvoice();
            } else if (format === 'csv') {
                generateCSV();
            } else if (format === 'excel') {
                generateExcel();
            }
        } catch (error) {
            console.error('Error generating invoice:', error);
            toast.error('Failed to generate invoice');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const generatePDFInvoice = async () => {
        if (!order || !company || !user) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const { subtotal, shipping, tax, total } = calculateTotals();

        // Add company logo/header
        doc.setFillColor(34, 197, 94); // Primary green color
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
        doc.text(company.name || 'N/A', margin, yPos);
        yPos += 5;
        doc.text(`Tax ID: ${company.taxId || 'N/A'}`, margin, yPos);
        yPos += 5;
        doc.text(`Email: ${user.email || 'N/A'}`, margin, yPos);
        yPos += 5;
        doc.text(`Phone: ${company.phone || 'N/A'}`, margin, yPos);

        // Bill To (Customer)
        yPos = 55;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO:', pageWidth / 2, yPos);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        yPos += 7;
        doc.text(company.name || 'N/A', pageWidth / 2, yPos);
        yPos += 5;
        doc.text(order.shippingAddress?.address || company.address || 'N/A', pageWidth / 2, yPos);
        yPos += 5;
        doc.text(`${order.shippingAddress?.city || 'Douala'}, ${order.shippingAddress?.country || 'Cameroon'}`, pageWidth / 2, yPos);

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
        doc.text(`Payment Status: ${order.paymentStatus || 'PAID'}`, margin, yPos);

        // Items Table
        yPos += 10;
        const tableData = order.items.map(item => [
            item.woodItem.species,
            `${item.quantity} CBM`,
            `XAF ${item.unitPrice.toLocaleString()}`,
            `XAF ${item.totalPrice.toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Product', 'Quantity', 'Unit Price', 'Total']],
            body: tableData,
            foot: [[
                'Subtotal',
                '',
                '',
                `XAF ${subtotal.toLocaleString()}`
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
        
        doc.setFontSize(10);
        doc.text('Shipping:', pageWidth - margin - 60, finalY);
        doc.text(shipping === 0 ? 'Free' : `XAF ${shipping}`, pageWidth - margin, finalY, { align: 'right' });
        
        doc.text('Tax (19% VAT):', pageWidth - margin - 60, finalY + 7);
        doc.text(`XAF ${tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, pageWidth - margin, finalY + 7, { align: 'right' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', pageWidth - margin - 60, finalY + 17);
        doc.text(`XAF ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, pageWidth - margin, finalY + 17, { align: 'right' });

        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(128, 128, 128);
        doc.text('Thank you for your business!', margin, doc.internal.pageSize.getHeight() - 10);
        doc.text('This is a computer generated invoice.', pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });

        // Save the PDF
        doc.save(`Invoice-${order.orderNumber}.pdf`);
        toast.success('Invoice downloaded successfully');
    };

    const generateCSV = () => {
        if (!order) return;

        const { subtotal, shipping, tax, total } = calculateTotals();
        
        // Create CSV content
        let csvContent = "Order Invoice\n";
        csvContent += `Order Number,${order.orderNumber}\n`;
        csvContent += `Order Date,${format(new Date(order.createdAt), 'PPP')}\n`;
        csvContent += `Status,${order.status}\n\n`;
        
        csvContent += "Product,Quantity,Unit Price,Total\n";
        
        order.items.forEach(item => {
            csvContent += `${item.woodItem.species},${item.quantity} CBM,XAF ${item.unitPrice},XAF ${item.totalPrice}\n`;
        });
        
        csvContent += `\nSubtotal,,,XAF ${subtotal}\n`;
        csvContent += `Shipping,,,${shipping === 0 ? 'Free' : `XAF ${shipping}`}\n`;
        csvContent += `Tax (19% VAT),,,XAF ${tax.toFixed(2)}\n`;
        csvContent += `Total,,,XAF ${total.toFixed(2)}\n`;

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Invoice-${order.orderNumber}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        toast.success('CSV invoice downloaded successfully');
    };

    const generateExcel = () => {
        // For Excel, we can generate an HTML table and save as .xls
        if (!order) return;

        const { subtotal, shipping, tax, total } = calculateTotals();
        
        let htmlContent = `
            <html>
                <head>
                    <title>Invoice ${order.orderNumber}</title>
                    <style>
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #22c55e; color: white; }
                    </style>
                </head>
                <body>
                    <h1>TimberTrade Invoice</h1>
                    <h2>Invoice #: INV-${order.orderNumber}</h2>
                    <p>Date: ${format(new Date(), 'PPP')}</p>
                    
                    <h3>FROM:</h3>
                    <p>${company?.name}<br>
                    Tax ID: ${company?.taxId}<br>
                    Email: ${user?.email}<br>
                    Phone: ${company?.phone || 'N/A'}</p>
                    
                    <h3>BILL TO:</h3>
                    <p>${company?.name}<br>
                    ${order.shippingAddress?.address || company?.address}<br>
                    ${order.shippingAddress?.city || 'Douala'}, ${order.shippingAddress?.country || 'Cameroon'}</p>
                    
                    <h3>Order Information</h3>
                    <p>Order Number: ${order.orderNumber}<br>
                    Order Date: ${format(new Date(order.createdAt), 'PPP')}<br>
                    Order Status: ${order.status}<br>
                    Payment Status: ${order.paymentStatus || 'PAID'}</p>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.woodItem.species}</td>
                                    <td>${item.quantity} CBM</td>
                                    <td>XAF ${item.unitPrice.toLocaleString()}</td>
                                    <td>XAF ${item.totalPrice.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3"><strong>Subtotal</strong></td>
                                <td><strong>XAF ${subtotal.toLocaleString()}</strong></td>
                            </tr>
                            <tr>
                                <td colspan="3">Shipping</td>
                                <td>${shipping === 0 ? 'Free' : `XAF ${shipping}`}</td>
                            </tr>
                            <tr>
                                <td colspan="3">Tax (19% VAT)</td>
                                <td>XAF ${tax.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="3"><strong>TOTAL</strong></td>
                                <td><strong>XAF ${total.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <p>Thank you for your business!</p>
                </body>
            </html>
        `;

        // Download as Excel
        const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Invoice-${order.orderNumber}.xls`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        toast.success('Excel invoice downloaded successfully');
    };

    const handleTrackShipment = () => {
        if (order?.status === 'SHIPPED') {
            toast.success('Tracking information loaded');
            // You can implement tracking modal or page here
        }
    };

    const handleContactSupport = () => {
        window.location.href = `mailto:support@timbertrade.com?subject=Question about Order ${order?.orderNumber}`;
    };

    // Get status config
    const getStatusConfig = (status: string) => {
        return STATUS_CONFIG[status] || STATUS_CONFIG['PENDING'];
    };

    // Calculate order totals
    const calculateTotals = () => {
        if (!order) return { subtotal: 0, shipping: 0, tax: 0, total: 0 };

        const subtotal = order.totalAmount;
        const shipping = subtotal > 1000 ? 0 : 50;
        const tax = subtotal * 0.19; // 19% VAT
        const total = subtotal + shipping + tax;

        return { subtotal, shipping, tax, total };
    };

    // Format date
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'PPP p');
    };

    // Loading state
    if (isLoading && !order) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Orders
                    </Button>
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    // Error state
    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </Button>
                <Alert variant="destructive" className="max-w-lg mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'Order not found'}
                    </AlertDescription>
                    <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate('/company/orders')}
                    >
                        View All Orders
                    </Button>
                </Alert>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;
    const { subtotal, shipping, tax, total } = calculateTotals();

    // Timeline steps
    const timelineSteps = [
        { status: 'PENDING', label: 'Order Placed', date: order.createdAt },
        { status: 'CONFIRMED', label: 'Confirmed', date: order.updatedAt },
        { status: 'PROCESSING', label: 'Processing', date: order.updatedAt },
        { status: 'SHIPPED', label: 'Shipped', date: null },
        { status: 'DELIVERED', label: 'Delivered', date: null },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
                        <p className="text-sm text-muted-foreground">
                            Placed on {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <Loader2 className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    
                    {/* Invoice Download Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isGeneratingPDF}
                            >
                                {isGeneratingPDF ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Printer className="w-4 h-4 mr-2" />
                                )}
                                Invoice
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => generatePDF('pdf')}>
                                <FileText className="w-4 h-4 mr-2" />
                                Download as PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => generatePDF('csv')}>
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                Download as CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => generatePDF('excel')}>
                                <FileIcon className="w-4 h-4 mr-2" />
                                Download as Excel
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Status Banner */}
            <Card className={`mb-6 border-2 ${statusConfig.color.replace('text-', 'border-')}`}>
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${statusConfig.color}`}>
                            <StatusIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg">
                                    Order Status: {statusConfig.label}
                                </h3>
                                <Badge className={statusConfig.color}>
                                    {order.status}
                                </Badge>
                            </div>
                            <Progress value={statusConfig.progress} className="h-2" />
                            <p className="text-sm text-muted-foreground mt-2">
                                {order.status === 'DELIVERED' 
                                    ? 'Your order has been delivered'
                                    : order.status === 'SHIPPED'
                                    ? 'Your order is on the way'
                                    : order.status === 'CANCELLED'
                                    ? 'This order has been cancelled'
                                    : 'Your order is being processed'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-muted">
                            <div 
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${(trackingStep / 4) * 100}%` }}
                            />
                        </div>

                        {/* Steps */}
                        <div className="relative flex justify-between">
                            {timelineSteps.map((step, index) => {
                                const isCompleted = index <= trackingStep;
                                const isCurrent = index === trackingStep;
                                const StepIcon = STATUS_CONFIG[step.status]?.icon || Clock;

                                return (
                                    <div key={step.status} className="flex flex-col items-center text-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                                isCompleted
                                                    ? 'bg-primary text-white'
                                                    : 'bg-muted text-muted-foreground'
                                            } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                        >
                                            <StepIcon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium">{step.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {step.date ? format(new Date(step.date), 'MMM d') : 'Pending'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Order Details Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Order Items - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                                        <span className="text-sm font-bold text-primary/60">
                                                            {item.woodItem.species?.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.woodItem.species}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.woodItem.origin} • Grade {item.woodItem.grade}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.quantity} CBM</TableCell>
                                            <TableCell>XAF {item.unitPrice.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                XAF {item.totalPrice.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Order Summary */}
                            <div className="mt-6 pt-6 border-t space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>XAF {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{shipping === 0 ? 'Free' : `XAF ${shipping}`}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (19% VAT)</span>
                                    <span>XAF {tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-medium">
                                    <span>Total</span>
                                    <span className="text-lg text-primary">
                                        XAF {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.documents && order.documents.length > 0 ? (
                                <div className="space-y-2">
                                    {order.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="font-medium">{doc.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {doc.type.replace(/_/g, ' ')} • Uploaded {format(new Date(doc.uploadedAt), 'PP')}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedDocument(doc);
                                                    setShowDocumentDialog(true);
                                                }}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No documents available yet</p>
                                    <p className="text-sm">Documents will appear here once processed</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Shipping & Info */}
                <div className="space-y-6">
                    {/* Shipping Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-medium">Delivery Address</p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.shippingAddress?.address || company?.address}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.shippingAddress?.city || 'Douala'}, {order.shippingAddress?.country || 'Cameroon'}
                                    </p>
                                </div>
                            </div>

                            {order.status === 'SHIPPED' && (
                                <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={handleTrackShipment}
                                >
                                    <Truck className="w-4 h-4 mr-2" />
                                    Track Shipment
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Company Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Building2 className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-medium">{company?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Tax ID: {company?.taxId}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-medium">{user?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-medium">Contact</p>
                                    <p className="text-sm text-muted-foreground">
                                        {company?.phone || 'Not provided'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-medium">Payment Status</p>
                                    <Badge variant="outline" className="mt-1 bg-green-50 text-green-700">
                                        {order.paymentStatus || 'PAID'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-medium">Order Date</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Package className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-medium">Last Updated</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(order.updatedAt)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <Card>
                        <CardContent className="p-6 space-y-3">
                            <Button 
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white"
                                onClick={handleReorder}
                            >
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Reorder Items
                            </Button>
                            
                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={handleContactSupport}
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Contact Support
                            </Button>

                            <Button 
                                variant="ghost" 
                                className="w-full"
                                onClick={() => navigate('/company/orders')}
                            >
                                View All Orders
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Document Preview Dialog */}
            <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDocument?.name}
                        </DialogTitle>
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
                        <Button onClick={() => setShowDocumentDialog(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}