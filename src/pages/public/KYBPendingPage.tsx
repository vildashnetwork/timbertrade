import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    TreePine,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Building2,
    User,
    FileText,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Loader2,
    RefreshCw,
    ArrowLeft,
    Download,
    Eye,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { toast } from 'sonner';
import type { Company, KYBDocument, User } from '@/types';
import { format } from 'date-fns';

interface SubmissionDetails {
    user: User | null;
    company: Company | null;
    documents: KYBDocument[];
    submittedAt: string;
    estimatedReviewTime: string;
}

// Backend document type (from your schema)
interface BackendDocument {
    _id: string;
    documentType: 'NIU' | 'RCCM';
    documentUrl: string;
    uploadedAt: string;
}

export default function KYBPendingPage() {
    const navigate = useNavigate();
    const { user, company, isLoading: authLoading, fetchProfile, refreshCompanyData } = useAuthStore();
    const { fetchCompanyById, uploadKYBDocument, isLoading: companyLoading } = useCompanyStore();

    const [submissionDetails, setSubmissionDetails] = useState<SubmissionDetails | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<KYBDocument | null>(null);
    const [showDocumentDialog, setShowDocumentDialog] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Use refs to prevent infinite loops
    const loadingRef = useRef(false);
    const initialLoadRef = useRef(false);

    // Helper function to map backend documents to frontend KYBDocument type
    const mapBackendDocuments = (docs: BackendDocument[] | undefined): KYBDocument[] => {
        if (!docs || !Array.isArray(docs)) return [];

        return docs.map((doc) => ({
            id: doc._id,
            type: doc.documentType,
            name: `${doc.documentType} Document - ${format(new Date(doc.uploadedAt), 'PP')}`,
            url: doc.documentUrl,
            uploadedAt: doc.uploadedAt,
        }));
    };

    const loadSubmissionDetails = useCallback(async (showToast = false) => {
        // Prevent concurrent calls
        if (loadingRef.current) return;

        try {
            loadingRef.current = true;
            setLoadError(null);

            // Fetch profile if needed
            if (!user) {
                await fetchProfile();
            }

            // Check if we have user and company data
            if (!user) {
                setLoadError('User not authenticated');
                return;
            }

            if (!company) {
                setLoadError('Company information not found');
                return;
            }

            // Safely access company ID (handle both _id and id)
            const companyId = company._id || company.id;

            if (!companyId) {
                console.error('Company ID is missing:', company);
                setLoadError('Company ID not found');
                return;
            }

            console.log('Fetching company with ID:', companyId);
            console.log('Current user:', user);
            console.log('Current company from store:', company);

            // Map backend documents to frontend format
            const mappedDocuments = mapBackendDocuments(company.kybDocs as BackendDocument[]);

            // Use the data from store directly first
            setSubmissionDetails({
                user,
                company,
                documents: mappedDocuments,
                submittedAt: company.createdAt || new Date().toISOString(),
                estimatedReviewTime: '24-48 hours',
            });

            // Then try to fetch fresh data in the background
            try {
                const freshCompany = await fetchCompanyById(companyId);

                if (freshCompany) {
                    const freshMappedDocuments = mapBackendDocuments(freshCompany.kybDocs as BackendDocument[]);

                    setSubmissionDetails({
                        user,
                        company: freshCompany,
                        documents: freshMappedDocuments,
                        submittedAt: freshCompany.createdAt || new Date().toISOString(),
                        estimatedReviewTime: '24-48 hours',
                    });

                    if (showToast) {
                        toast.success('Company data refreshed');
                    }
                }
            } catch (fetchError: any) {
                console.error('Background fetch error:', fetchError);

                // Don't show error toast for background fetch unless it's not a 403
                if (fetchError.response?.status !== 403 && showToast) {
                    toast.error('Unable to refresh company data');
                }
            }
        } catch (error) {
            console.error('Failed to load submission details:', error);
            setLoadError('Failed to load submission details');
            toast.error('Failed to load submission details');
        } finally {
            loadingRef.current = false;
            setIsInitialized(true);
        }
    }, [user, company, fetchProfile, fetchCompanyById]);

    // Initial load - only once
    useEffect(() => {
        if (!initialLoadRef.current) {
            initialLoadRef.current = true;
            loadSubmissionDetails();
        }
    }, [loadSubmissionDetails]);

    const handleDocumentUpload = async (file: File, documentType: 'NIU' | 'RCCM') => {
        if (!company) return;

        const companyId = company.id || company._id;
        if (!companyId) {
            toast.error('Company ID not found');
            return;
        }

        try {
            const success = await uploadKYBDocument(companyId, file, documentType);
            if (success) {
                toast.success(`${documentType} document uploaded successfully`);
                await loadSubmissionDetails(true);
            }
        } catch (error) {
            toast.error(`Failed to upload ${documentType} document`);
        }
    };

    // Auto-refresh effect
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        // Only run if company is pending
        if (company?.status === 'PENDING' && isInitialized) {
            console.log('Setting up auto-refresh every 10 seconds...');

            intervalId = setInterval(async () => {
                console.log('Auto-refreshing company status...');

                try {
                    const refreshedCompany = await refreshCompanyData?.();

                    if (refreshedCompany?.status === 'APPROVED') {
                        console.log('Company approved! Redirecting...');
                        clearInterval(intervalId);

                        toast.success('Your company has been approved! Redirecting to dashboard...');

                        setTimeout(() => {
                            navigate('/company/dashboard');
                        }, 2000);
                    }
                } catch (error) {
                    console.error('Auto-refresh failed:', error);
                }
            }, 10000); // Check every 10 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [company?.status, isInitialized, refreshCompanyData, navigate]);

    // Manual refresh handler
    const handleRefresh = async () => {
        setIsRefreshing(true);

        try {
            // Use the store's refresh function
            const refreshedCompany = await refreshCompanyData?.();

            if (refreshedCompany) {
                console.log('Refreshed company:', refreshedCompany);

                // Update local state
                setSubmissionDetails(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        company: refreshedCompany,
                        documents: mapBackendDocuments(refreshedCompany.kybDocs as BackendDocument[]),
                    };
                });

                // Check if company is now approved
                if (refreshedCompany.status === 'APPROVED') {
                    toast.success('Your company has been approved! Redirecting to dashboard...');
                    setTimeout(() => {
                        navigate('/company/dashboard');
                    }, 2000);
                } else {
                    toast.success('Company data refreshed');
                }
            }
        } catch (error) {
            console.error('Refresh failed:', error);
            toast.error('Failed to refresh company data');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleViewDocument = (doc: KYBDocument) => {
        if (!doc) {
            toast.error('Document information is missing');
            return;
        }

        if (!doc.url) {
            console.error('Document URL missing:', doc);
            toast.error('Document URL is not available', {
                description: 'The document may still be processing or was not uploaded correctly.'
            });
            return;
        }

        // Validate URL format
        try {
            new URL(doc.url);
            setSelectedDocument(doc);
            setShowDocumentDialog(true);
        } catch (e) {
            console.error('Invalid document URL:', doc.url);
            toast.error('Invalid document URL format');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'REJECTED':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'PENDING':
            default:
                return <Clock className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'PENDING':
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getDocumentTypeLabel = (type: string | undefined) => {
        if (!type) return 'Your Document';
        switch (type) {
            case 'NIU':
                return 'NIU Certificate';
            case 'RCCM':
                return 'RCCM Document';
            default:
                return type;
        }
    };

    // Show loading state
    if (!isInitialized || authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (loadError || !user || !company) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <Alert variant="destructive" className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {loadError || 'Unable to load submission details. Please try again.'}
                        </AlertDescription>
                    </Alert>

                    <div className="flex justify-center gap-4">
                        <Button onClick={handleRefresh} disabled={isRefreshing}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Try Again
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // If company is approved, redirect to dashboard
    if (company.status === 'APPROVED') {
        navigate('/company/dashboard');
        return null;
    }

    // Get mapped documents from submissionDetails or map them on the fly
    const documents = submissionDetails?.documents || mapBackendDocuments(company.kybDocs as BackendDocument[]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 py-8 px-4">
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header with Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" asChild>
                        <Link to="/">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh Status
                    </Button>
                </div>

                {/* Logo and Title */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                        <TreePine className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        KYB Application Status
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Track your Know Your Business verification progress
                    </p>
                </div>

                {/* Status Banner */}
                <Card className="mb-6 border-2 border-yellow-200 bg-yellow-50">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-yellow-800 mb-1">
                                    Application Under Review
                                </h3>
                                <p className="text-yellow-700 mb-3">
                                    Your KYB application has been submitted and is currently being reviewed by our team.
                                    This process typically takes 24-48 hours.
                                </p>
                                <div className="flex items-center gap-4 text-sm text-yellow-600">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        Submitted: {format(new Date(company.createdAt || new Date()), 'PPP')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        Status: {company.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="company">Company Details</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="contact">Contact Info</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Application Overview</CardTitle>
                                <CardDescription>
                                    Summary of your KYB submission
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                            <Building2 className="w-4 h-4" />
                                            Company Name
                                        </div>
                                        <p className="font-semibold">{company.name}</p>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                            <CreditCard className="w-4 h-4" />
                                            Tax ID (NIU)
                                        </div>
                                        <p className="font-semibold">{company.taxId}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                        <FileText className="w-4 h-4" />
                                        Documents Status
                                    </div>
                                    <div className="space-y-3">
                                        {documents.map((doc, index) => (
                                            <div key={doc.id || index} className="flex items-center justify-between">
                                                <span className="text-sm">{getDocumentTypeLabel(doc.type)}</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                                        Uploaded
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDocument(doc)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-muted-foreground">Verification Progress</span>
                                        <span className="text-sm font-medium">60%</span>
                                    </div>
                                    <Progress value={60} className="h-2" />
                                    <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-center">
                                        <div>
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mb-1" />
                                            <span>Submitted</span>
                                        </div>
                                        <div>
                                            <Clock className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                                            <span>Under Review</span>
                                        </div>
                                        <div>
                                            <AlertCircle className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                                            <span>Approval</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Company Details Tab */}
                    <TabsContent value="company" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Company Information</CardTitle>
                                <CardDescription>
                                    Details provided during registration
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Company Name</p>
                                            <p className="font-medium">{company.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tax ID (NIU)</p>
                                            <p className="font-medium">{company.taxId}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-muted-foreground">Address</p>
                                            <p className="font-medium">{company.address}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Registration Date</p>
                                            <p className="font-medium">
                                                {format(new Date(company.createdAt || new Date()), 'PPP')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Status</p>
                                            <div>
                                                <Badge className={getStatusColor(company.status)}>
                                                    {company.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Director Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Director Name</p>
                                        <p className="font-medium">{user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Director Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>KYB Documents</CardTitle>
                                <CardDescription>
                                    Uploaded documents for verification
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Document Type</TableHead>
                                            <TableHead>Upload Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {documents.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell className="font-medium">
                                                    {getDocumentTypeLabel(doc.type)}
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(doc.uploadedAt), 'PP')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                                        Verified
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewDocument(doc)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        {doc.url && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => window.open(doc.url, '_blank')}
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {documents.length === 0 && (
                                    <div className="text-center py-8">
                                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground">No documents uploaded yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Document Preview Dialog */}
                        <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedDocument && getDocumentTypeLabel(selectedDocument.type)}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Uploaded on {selectedDocument?.uploadedAt
                                            ? format(new Date(selectedDocument.uploadedAt), 'PPP')
                                            : 'Unknown date'}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4">
                                    {selectedDocument?.url ? (
                                        selectedDocument.url.toLowerCase().endsWith('.pdf') ? (
                                            <iframe
                                                src={selectedDocument.url}
                                                className="w-full h-[500px] rounded-lg border"
                                                title="Document Preview"
                                            />
                                        ) : (
                                            <img
                                                src={selectedDocument.url}
                                                alt={getDocumentTypeLabel(selectedDocument.type)}
                                                className="w-full rounded-lg border"
                                                onError={(e) => {
                                                    // Fallback if image fails to load
                                                    e.currentTarget.style.display = 'none';
                                                    const parent = e.currentTarget.parentElement;
                                                    if (parent) {
                                                        const fallback = document.createElement('div');
                                                        fallback.className = 'p-8 text-center';
                                                        fallback.innerHTML = `
                                                            <AlertCircle class="w-12 h-12 text-destructive mx-auto mb-3" />
                                                            <p class="text-destructive">Failed to load image</p>
                                                            <button class="mt-4 px-4 py-2 bg-primary text-white rounded-md" onclick="window.open('${selectedDocument.url}', '_blank')">
                                                                Open Original
                                                            </button>
                                                        `;
                                                        parent.appendChild(fallback);
                                                    }
                                                }}
                                            />
                                        )
                                    ) : (
                                        <div className="text-center py-12">
                                            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                                            <p className="text-destructive font-medium">Document URL not available</p>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                The document may have been removed or not properly uploaded.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    {selectedDocument?.url && (
                                        <Button
                                            variant="outline"
                                            onClick={() => window.open(selectedDocument.url, '_blank')}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                    )}
                                    <Button onClick={() => setShowDocumentDialog(false)}>
                                        Close
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* Contact Info Tab */}
                    <TabsContent value="contact" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                                <CardDescription>
                                    How to reach you and your company
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                        <Mail className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email Address</p>
                                            <p className="font-medium">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                        <Phone className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone Number</p>
                                            <p className="font-medium">{company?.number || 'Not provided'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Business Address</p>
                                            <p className="font-medium">{company.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Need Help?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    If you have any questions about your KYB application or need to update your information,
                                    please contact our support team.
                                </p>
                                <div className="flex gap-3">
                                    <Button variant="outline" asChild>
                                        <a href="mailto:support@timbertrade.com">
                                            <Mail className="w-4 h-4 mr-2" />
                                            Email Support
                                        </a>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <a href="tel:+237600000000">
                                            <Phone className="w-4 h-4 mr-2" />
                                            Call Us
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* What Happens Next Section */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>What happens next?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-primary">1</span>
                                </div>
                                <div>
                                    <h4 className="font-medium">Document Verification</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Our team will verify your uploaded documents for authenticity and completeness.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-primary">2</span>
                                </div>
                                <div>
                                    <h4 className="font-medium">Company Background Check</h4>
                                    <p className="text-sm text-muted-foreground">
                                        We'll perform a standard background check on your company to ensure compliance.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-primary">3</span>
                                </div>
                                <div>
                                    <h4 className="font-medium">Final Approval</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Once verified, your account will be approved and you'll receive an email notification.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-muted rounded-lg">
                            <p className="text-sm">
                                <span className="font-medium">Note:</span> You'll receive an email notification once your
                                application has been reviewed. The average review time is 24-48 hours during business days.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-muted-foreground">
                    <p>Need to update your information? Contact our support team.</p>
                </div>
            </div>
        </div>
    );
}