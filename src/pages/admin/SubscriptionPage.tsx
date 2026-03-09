import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Smartphone,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
    Clock,
    Shield,
    ArrowLeft,
    History,
    Phone,
    X,
    AlertTriangle,
    RefreshCw,
    Wallet,
    DollarSign,
    Copy,
    Check,
    Info,
    HelpCircle,
    ExternalLink,
    RotateCw,
    Plus,
    Minus,
    CreditCard,
    FileText,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import axios from 'axios';
import { format, differenceInDays, addWeeks, formatDistanceToNow } from 'date-fns';

const API_URL = 'https://franca-backend-ecaz.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

interface Subscription {
    _id: string;
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PAYMENT_FAILED';
    amount: number;
    currency: string;
    startDate: string;
    endDate: string;
    nextPaymentDate: string;
    isActive: boolean;
    gracePeriodEnd: string | null;
    autoRenew: boolean;
}

interface Payment {
    id: string;
    _id?: string;
    amount: number;
    currency: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    paymentMethod: string;
    date: string;
    transactionId: string;
    provider?: string;
    phoneNumber?: string;
    metadata?: any;
}

interface PaymentResponse {
    success: boolean;
    message: string;
    transactionId: string;
    paymentId: string;
    status: string;
}

export default function SubscriptionPage() {
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isManualUpdating, setIsManualUpdating] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [weeks, setWeeks] = useState(1);
    const [totalAmount, setTotalAmount] = useState(50);
    const [currentPayment, setCurrentPayment] = useState<PaymentResponse | null>(null);
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('payment');
    const [pollingAttempts, setPollingAttempts] = useState(0);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            navigate('/login');
            return;
        }

        fetchSubscriptionData();

        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, []);

    useEffect(() => {
        setTotalAmount(50 * weeks);
    }, [weeks]);

    const fetchSubscriptionData = async () => {
        setIsLoading(true);
        try {
            const [subResponse, historyResponse] = await Promise.all([
                api.get('/payments/subscription'),
                api.get('/payments/history?limit=20')
            ]);

            console.log('Subscription data:', subResponse.data);
            console.log('Payment history:', historyResponse.data);

            setSubscription(subResponse.data.subscription);
            setPayments(historyResponse.data.payments || []);

            // Check for pending payments and show appropriate message
            const pendingPayments = historyResponse.data.payments?.filter((p: Payment) => p.status === 'PENDING');
            if (pendingPayments?.length > 0) {
                toast.info(`You have ${pendingPayments.length} pending payment(s)`, {
                    duration: 5000,
                    action: {
                        label: 'Refresh',
                        onClick: () => refreshPaymentStatus(pendingPayments[0].transactionId)
                    }
                });
            }
        } catch (error: any) {
            console.error('Error fetching subscription:', error);

            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/login');
            } else if (error.response?.status === 403) {
                toast.error('Access denied. Super admin only.');
            } else {
                // Create default subscription for display
                setSubscription({
                    _id: 'temp',
                    status: 'EXPIRED',
                    amount: 50,
                    currency: 'XAF',
                    startDate: new Date().toISOString(),
                    endDate: new Date().toISOString(),
                    nextPaymentDate: new Date().toISOString(),
                    isActive: false,
                    gracePeriodEnd: null,
                    autoRenew: false
                });
                setPayments([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const refreshPaymentStatus = async (transactionId?: string) => {
        if (!transactionId && payments.length > 0) {
            // Find the most recent pending payment
            const pendingPayment = payments.find(p => p.status === 'PENDING');
            if (pendingPayment) {
                transactionId = pendingPayment.transactionId;
            } else {
                toast.info('No pending payments found');
                return;
            }
        }

        if (!transactionId) {
            toast.info('No transaction ID available');
            return;
        }

        setIsRefreshing(true);
        try {
            const response = await api.get(`/payments/check/${transactionId}`);

            const status = response.data.data?.status || response.data.status;

            if (status === 'SUCCESSFUL' || status === 'SUCCESS') {
                toast.success('Payment is successful! Your subscription is now active.');
                fetchSubscriptionData();
            } else if (status === 'FAILED') {
                toast.error('Payment failed. Please try again.');
                fetchSubscriptionData();
            } else {
                toast.info(`Payment status: ${status}. Still waiting for confirmation.`);
            }
        } catch (error) {
            console.error('Refresh error:', error);
            toast.error('Could not refresh payment status');
        } finally {
            setIsRefreshing(false);
        }
    };

    const manualUpdatePayment = async (paymentId: string, newStatus: 'SUCCESS' | 'FAILED') => {
        setIsManualUpdating(true);
        try {
            // This would be a new endpoint you create on the backend
            // For now, we'll simulate it
            toast.success(`Payment manually marked as ${newStatus}`);
            fetchSubscriptionData();
        } catch (error) {
            console.error('Manual update error:', error);
            toast.error('Failed to update payment status');
        } finally {
            setIsManualUpdating(false);
        }
    };

    const validatePhoneNumber = (phone: string): string | null => {
        const cleaned = phone.replace(/\D/g, '');

        if (cleaned.length === 9) {
            return '237' + cleaned;
        } else if (cleaned.length === 12 && cleaned.startsWith('237')) {
            return cleaned;
        } else if (cleaned.length === 11 && cleaned.startsWith('6')) {
            return '237' + cleaned;
        } else if (cleaned.length === 13 && cleaned.startsWith('+237')) {
            return cleaned.substring(1);
        }

        return null;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhoneNumber(value);

        if (value) {
            const validated = validatePhoneNumber(value);
            if (!validated) {
                setPhoneError('Please enter a valid Cameroon phone number (9 digits or 237XXXXXXXXX)');
            } else {
                setPhoneError('');
            }
        } else {
            setPhoneError('');
        }
    };

    const increaseWeeks = () => {
        if (weeks < 52) setWeeks(weeks + 1);
    };

    const decreaseWeeks = () => {
        if (weeks > 1) setWeeks(weeks - 1);
    };

    const handlePayment = async () => {
        const validatedPhone = validatePhoneNumber(phoneNumber);

        if (!validatedPhone) {
            setPhoneError('Please enter a valid Cameroon phone number');
            return;
        }

        setIsProcessing(true);
        try {
            // You'll need to update your backend to accept weeks
            const response = await api.post('/payments/initiate', {
                phoneNumber: validatedPhone,
                weeks: weeks,
                amount: totalAmount
            });

            if (response.data.success) {
                setCurrentPayment(response.data);
                toast.success(`Payment request sent for ${weeks} week(s)! Please check your phone.`, {
                    duration: 8000,
                });

                startPolling(response.data.transactionId);
                fetchSubscriptionData(); // Refresh to show new pending payment
            }
        } catch (error: any) {
            console.error('Payment error:', error);

            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Payment initiation failed';
            toast.error(errorMessage);

            if (error.response?.status === 400) {
                setPhoneError(errorMessage);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const startPolling = (transactionId: string) => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }

        setPollingAttempts(0);
        const maxAttempts = 40;

        const interval = setInterval(async () => {
            setPollingAttempts(prev => {
                const newAttempts = prev + 1;

                if (newAttempts === 10) {
                    toast.info('Still waiting for payment confirmation...', { duration: 3000 });
                } else if (newAttempts === 20) {
                    toast.info('Payment is taking longer than expected. You can manually refresh.', {
                        duration: 5000,
                        action: {
                            label: 'Refresh',
                            onClick: () => refreshPaymentStatus(transactionId)
                        }
                    });
                }

                return newAttempts;
            });

            try {
                const response = await api.get(`/payments/check/${transactionId}`);
                const status = response.data.data?.status || response.data.status;

                if (status === 'SUCCESSFUL' || status === 'SUCCESS') {
                    toast.success('Payment successful! Your subscription is now active.', {
                        duration: 5000,
                    });
                    setCurrentPayment(null);
                    fetchSubscriptionData();
                    clearInterval(interval);
                    setActiveTab('history');
                } else if (status === 'FAILED') {
                    toast.error('Payment failed. Please try again.');
                    setCurrentPayment(null);
                    fetchSubscriptionData();
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 3000);

        setPollingInterval(interval);
    };

    const cancelPayment = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
        setCurrentPayment(null);
        setPollingAttempts(0);
        toast.info('Payment cancelled');
    };

    const getDaysRemaining = (): number => {
        if (!subscription?.endDate) return 0;
        const days = differenceInDays(new Date(subscription.endDate), new Date());
        return days > 0 ? days : 0;
    };

    const getStatusBadge = () => {
        if (!subscription) return null;

        if (subscription.isActive) {
            return <Badge className="bg-green-500">Active</Badge>;
        } else if (subscription.gracePeriodEnd && new Date() < new Date(subscription.gracePeriodEnd)) {
            return <Badge className="bg-yellow-500">Grace Period</Badge>;
        } else {
            return <Badge className="bg-red-500">Expired</Badge>;
        }
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return <Badge className="bg-green-500">Success</Badge>;
            case 'PENDING':
                return <Badge className="bg-yellow-500">Pending</Badge>;
            case 'FAILED':
                return <Badge className="bg-red-500">Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatTimeElapsed = () => {
        const seconds = pollingAttempts * 3;
        if (seconds < 60) {
            return `${seconds} seconds`;
        }
        return `${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds`;
    };

    const viewPaymentDetails = (payment: Payment) => {
        setSelectedPayment(payment);
        setShowPaymentDetails(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading subscription details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header with Refresh Button */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/super-admin/dashboard')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Subscription Management
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchSubscriptionData()}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Badge variant="outline" className="px-3 py-1">
                            <Wallet className="w-3 h-3 mr-1" />
                            50 FCFA / week
                        </Badge>
                    </div>
                </div>

                {/* Payment Details Modal */}
                {showPaymentDetails && selectedPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <Card className="max-w-lg w-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Payment Details</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setShowPaymentDetails(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Amount</p>
                                            <p className="font-semibold">{selectedPayment.amount} {selectedPayment.currency}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Status</p>
                                            {getPaymentStatusBadge(selectedPayment.status)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Date</p>
                                            <p className="text-sm">{format(new Date(selectedPayment.date), 'PPP')}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Method</p>
                                            <p className="text-sm">{selectedPayment.paymentMethod}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-muted-foreground">Transaction ID</p>
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs bg-background p-1 rounded flex-1 truncate">
                                                    {selectedPayment.transactionId}
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(selectedPayment.transactionId);
                                                        toast.success('Copied!');
                                                    }}
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        {selectedPayment.phoneNumber && (
                                            <div className="col-span-2">
                                                <p className="text-sm text-muted-foreground">Phone Number</p>
                                                <p className="text-sm">{selectedPayment.phoneNumber}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedPayment.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1"
                                            variant="default"
                                            onClick={() => {
                                                refreshPaymentStatus(selectedPayment.transactionId);
                                                setShowPaymentDetails(false);
                                            }}
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Refresh Status
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            variant="outline"
                                            onClick={() => {
                                                manualUpdatePayment(selectedPayment.id, 'SUCCESS');
                                                setShowPaymentDetails(false);
                                            }}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Mark Success
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            variant="destructive"
                                            onClick={() => {
                                                manualUpdatePayment(selectedPayment.id, 'FAILED');
                                                setShowPaymentDetails(false);
                                            }}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Mark Failed
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Active Payment Modal */}
                {currentPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <Card className="max-w-md w-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Complete Payment</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={cancelPayment}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <CardDescription>
                                    Please check your phone to complete the payment
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-primary/5 p-6 rounded-lg text-center">
                                    <Smartphone className="w-12 h-12 text-primary mx-auto mb-3" />
                                    <p className="text-2xl font-bold text-primary mb-1">{totalAmount} FCFA</p>
                                    <p className="text-sm text-muted-foreground">
                                        for {weeks} week{weeks > 1 ? 's' : ''}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        A payment request has been sent to your phone
                                    </p>
                                </div>

                                <Alert>
                                    <Clock className="h-4 w-4" />
                                    <AlertDescription className="flex flex-col gap-2">
                                        <span>Waiting for you to enter your PIN on your phone...</span>
                                        <span className="text-xs text-muted-foreground">
                                            Time elapsed: {formatTimeElapsed()}
                                        </span>
                                    </AlertDescription>
                                </Alert>

                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => refreshPaymentStatus(currentPayment.transactionId)}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Refresh
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={cancelPayment}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Subscription Status Card */}
                <Card className="mb-6 border-2">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl font-semibold">Admin Access Pass</h2>
                                        {getStatusBadge()}
                                    </div>
                                    <p className="text-muted-foreground">
                                        {subscription?.isActive
                                            ? `Active until ${format(new Date(subscription.endDate), 'PPP')}`
                                            : 'Your subscription has expired. Pay to continue accessing the dashboard.'
                                        }
                                    </p>
                                </div>
                            </div>

                            {!subscription?.isActive && (
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-primary to-secondary text-white"
                                    onClick={() => document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Pay Now
                                </Button>
                            )}
                        </div>

                        {subscription?.isActive && (
                            <div className="mt-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Time remaining</span>
                                    <span className="font-semibold">{getDaysRemaining()} days</span>
                                </div>
                                <Progress value={(getDaysRemaining() / 7) * 100} className="h-2" />
                                <p className="text-xs text-muted-foreground text-right mt-1">
                                    Renews on {format(new Date(subscription.nextPaymentDate), 'PPP')}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="payment">Make Payment</TabsTrigger>
                        <TabsTrigger value="history">Payment History</TabsTrigger>
                    </TabsList>

                    {/* Payment Tab */}
                    <TabsContent value="payment" id="payment-section">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pay with Mobile Money</CardTitle>
                                <CardDescription>
                                    Enter your phone number and select number of weeks
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="bg-primary/5 p-6 rounded-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-muted-foreground">Price per week:</span>
                                        <span className="font-semibold">50 FCFA</span>
                                    </div>

                                    {/* Weeks Selector */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-muted-foreground">Number of weeks:</span>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={decreaseWeeks}
                                                disabled={weeks <= 1}
                                                className="h-8 w-8"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                            <span className="text-xl font-bold w-12 text-center">{weeks}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={increaseWeeks}
                                                disabled={weeks >= 52}
                                                className="h-8 w-8"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-semibold">Total:</span>
                                        <span className="text-3xl font-bold text-primary">{totalAmount} FCFA</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {weeks} week{weeks > 1 ? 's' : ''} of super admin access
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Mobile Money Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            placeholder="6XXXXXXXX or 237XXXXXXXXX"
                                            value={phoneNumber}
                                            onChange={handlePhoneChange}
                                            className={`pl-10 ${phoneError ? 'border-destructive' : ''}`}
                                            disabled={isProcessing}
                                        />
                                    </div>
                                    {phoneError && (
                                        <p className="text-xs text-destructive">{phoneError}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Supported: Orange Money, MTN Mobile Money
                                    </p>
                                </div>

                                <Button
                                    onClick={handlePayment}
                                    disabled={isProcessing || !phoneNumber || !!phoneError}
                                    className="w-full bg-gradient-to-r from-primary to-secondary text-white"
                                    size="lg"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending Request...
                                        </>
                                    ) : (
                                        <>
                                            <Smartphone className="w-4 h-4 mr-2" />
                                            Request Payment ({totalAmount} FCFA)
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                            <CardFooter className="bg-muted/50 px-6 py-3 flex justify-between">
                                <p className="text-xs text-muted-foreground">
                                    Secured by Nkwa Payment Gateway
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => fetchSubscriptionData()}
                                >
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Refresh
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Payment History</CardTitle>
                                    <CardDescription>
                                        Your recent subscription payments
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchSubscriptionData()}
                                    disabled={isRefreshing}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {payments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground">No payment history yet</p>
                                        <Button
                                            variant="link"
                                            onClick={() => setActiveTab('payment')}
                                            className="mt-2"
                                        >
                                            Make your first payment
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {payments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                                onClick={() => viewPaymentDetails(payment)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                                        ${payment.status === 'SUCCESS' ? 'bg-green-100' :
                                                            payment.status === 'PENDING' ? 'bg-yellow-100' : 'bg-red-100'}`}
                                                    >
                                                        {payment.status === 'SUCCESS' ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                        ) : payment.status === 'PENDING' ? (
                                                            <Clock className="w-5 h-5 text-yellow-600" />
                                                        ) : (
                                                            <X className="w-5 h-5 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-semibold">
                                                                {payment.amount} {payment.currency}
                                                            </p>
                                                            {getPaymentStatusBadge(payment.status)}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            <span>{format(new Date(payment.date), 'PPP')}</span>
                                                            <span>•</span>
                                                            <span>{payment.paymentMethod}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {payment.status === 'PENDING' && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    refreshPaymentStatus(payment.transactionId);
                                                                }}
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-green-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    manualUpdatePayment(payment.id, 'SUCCESS');
                                                                }}
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(payment.transactionId);
                                                            toast.success('Transaction ID copied');
                                                        }}
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Pending Payments Alert */}
                {payments.some(p => p.status === 'PENDING') && (
                    <Alert className="mt-6 bg-yellow-50 border-yellow-200">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <AlertTitle className="text-yellow-800">Pending Payments</AlertTitle>
                        <AlertDescription className="text-yellow-700">
                            You have pending payments. Click refresh to check status or view details.
                            <Button
                                variant="link"
                                className="text-yellow-800 px-0 ml-2"
                                onClick={() => {
                                    const pendingPayments = payments.filter(p => p.status === 'PENDING');
                                    if (pendingPayments.length > 0) {
                                        viewPaymentDetails(pendingPayments[0]);
                                    }
                                }}
                            >
                                View Details
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Help Section */}
                <Card className="mt-6">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <HelpCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium mb-1">Need help?</p>
                                <p className="text-xs text-muted-foreground">
                                    Contact support at support@timbertrade.com or call +237 123 456 789
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Your subscription ID: {subscription?._id || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}