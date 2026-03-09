import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Building2,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Loader2,
    Eye,
    Download,
    X,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    User,
    Calendar,
    Upload,
    Trash2,
    Plus,
    Image as ImageIcon,
    FileSpreadsheet,
    FileJson,
    File as FileIcon
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableRowSkeleton } from '@/components/shared/LoadingSkeleton';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Company, CompanyStatus, KYBDocument } from '@/types';

// Status configuration
const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
    'PENDING': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Pending'
    },
    'APPROVED': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Approved'
    },
    'SUSPENDED': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        label: 'Suspended'
    }
};

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dsewg9nlw';
const CLOUDINARY_UPLOAD_PRESET = 'blisssz';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export default function KYBPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        companies,
        pendingCompanies,
        selectedCompany,
        isLoading,
        error,
        fetchAllCompanies,
        fetchPendingCompanies,
        fetchCompanyById,
        approveCompany,
        rejectCompany,
        uploadKYBDocument,
        clearSelectedCompany
    } = useCompanyStore();

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
    const [selectedCompanyLocal, setSelectedCompanyLocal] = useState<Company | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<KYBDocument | null>(null);
    const [uploadingFile, setUploadingFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [documentName, setDocumentName] = useState('');
    const [documentType, setDocumentType] = useState('NIU');
    const [documentNotes, setDocumentNotes] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('details');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load companies on mount
    useEffect(() => {
        loadCompanies();
    }, []);

    // Set selected company when store updates
    useEffect(() => {
        if (selectedCompany) {
            setSelectedCompanyLocal(selectedCompany);
            setDetailDialogOpen(true);
        }
    }, [selectedCompany]);

    const loadCompanies = async () => {
        try {
            await Promise.all([
                fetchAllCompanies(),
                fetchPendingCompanies()
            ]);
        } catch (error) {
            console.error('Failed to load companies:', error);
            toast.error('Failed to load companies');
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadCompanies();
        setIsRefreshing(false);
        toast.success('Companies refreshed');
    };

    // Filter companies
    const filteredCompanies = useMemo(() => {
        if (!companies || !Array.isArray(companies)) return [];

        return companies.filter((company) => {
            if (!company) return false;

            // Search filter - removed director fields
            const matchesSearch = searchQuery === '' ||
                (company.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (company.taxId?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (company.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());

            // Status filter
            const matchesStatus = statusFilter === 'all' || company.status === statusFilter;

            // Date filter
            let matchesDate = true;
            if (dateRange !== 'all' && company.createdAt) {
                const companyDate = new Date(company.createdAt);
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                if (dateRange === 'today') {
                    matchesDate = companyDate >= today;
                } else if (dateRange === 'week') {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    matchesDate = companyDate >= weekAgo;
                } else if (dateRange === 'month') {
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    matchesDate = companyDate >= monthAgo;
                }
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [companies, searchQuery, statusFilter, dateRange]);

    // Pagination
    const paginatedCompanies = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredCompanies.slice(start, end);
    }, [filteredCompanies, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

    // Fixed status update handler
    const handleStatusUpdate = async (companyId: string, newStatus: CompanyStatus) => {
        if (!companyId) {
            toast.error('Invalid company ID');
            return;
        }

        setProcessingId(companyId);
        try {
            let success: boolean;

            if (newStatus === 'APPROVED') {
                success = await approveCompany(companyId);
            } else if (newStatus === 'SUSPENDED') {
                success = await rejectCompany(companyId);
            } else if (newStatus === 'PENDING') {
                // You might want to implement a reset to pending function
                toast.info('Reset to pending functionality');
                return;
            } else {
                toast.error('Invalid status');
                return;
            }

            if (success) {
                toast.success(`Company ${newStatus.toLowerCase()} successfully`);

                // Update local state
                if (selectedCompanyLocal?.id === companyId) {
                    setSelectedCompanyLocal(prev => prev ? { ...prev, status: newStatus } : null);
                }

                // Refresh data
                await Promise.all([
                    fetchAllCompanies(),
                    fetchPendingCompanies()
                ]);
            }
        } catch (error: any) {
            console.error('Status update error:', error);
            toast.error(error.message || `Failed to update company status`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleViewCompany = async (company: Company) => {
        if (!company || !company.id) {
            toast.error('Invalid company data');
            return;
        }

        try {
            setProcessingId(company.id);
            const detailedCompany = await fetchCompanyById(company.id);
            if (detailedCompany) {
                setSelectedCompanyLocal(detailedCompany);
                setDetailDialogOpen(true);
            }
        } catch (error) {
            console.error('Failed to fetch company details:', error);
            toast.error('Failed to load company details');
        } finally {
            setProcessingId(null);
        }
    };

    const handleViewDocument = (doc: KYBDocument) => {
        setSelectedDocument(doc);
        setDocumentDialogOpen(true);
    };

    const handleDownloadDocument = (doc: KYBDocument) => {
        window.open(doc.url, '_blank');
    };

    const handleContactCompany = (company: Company) => {
        if (!company.email) {
            toast.error('Company email not available');
            return;
        }
        window.location.href = `mailto:${company.email}?subject=KYB Application Status - ${company.name}`;
    };

    const handleFileSelect = () => {
        if (!selectedCompanyLocal) {
            toast.error('Please select a company first');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedCompanyLocal) return;

        // Validate file
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error('File too large', {
                description: 'Maximum file size is 10MB'
            });
            return;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type', {
                description: 'Please upload PDF, JPG, or PNG files'
            });
            return;
        }

        setUploadingFile(file);
        setDocumentName(file.name);
        setUploadDialogOpen(true);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadDocument = async () => {
        if (!uploadingFile || !selectedCompanyLocal) {
            toast.error('No file selected');
            return;
        }

        setUploadProgress(0);

        try {
            // Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', uploadingFile);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'timber-platform/kyb-docs');

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded * 100) / event.total);
                    setUploadProgress(percentComplete);
                }
            });

            const uploadPromise = new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(new Error('Upload failed'));
                    }
                };
                xhr.onerror = () => reject(new Error('Upload failed'));
            });

            xhr.open('POST', CLOUDINARY_URL);
            xhr.send(formData);

            const data = await uploadPromise as any;
            const imageUrl = data.secure_url;

            // Upload to backend
            const success = await uploadKYBDocument(
                selectedCompanyLocal.id,
                uploadingFile,
                documentType
            );

            if (success) {
                toast.success('Document uploaded successfully');
                setUploadDialogOpen(false);
                setUploadingFile(null);
                setDocumentName('');
                setDocumentType('NIU');
                setDocumentNotes('');
                setUploadProgress(0);

                // Refresh company data
                await handleViewCompany(selectedCompanyLocal);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document');
        }
    };

    const handleCloseDialog = () => {
        setDetailDialogOpen(false);
        setSelectedCompanyLocal(null);
        clearSelectedCompany();
        setActiveTab('details');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PPP');
        } catch {
            return 'N/A';
        }
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PPP p');
        } catch {
            return 'N/A';
        }
    };

    const getStatusColor = (status: CompanyStatus) => {
        return STATUS_CONFIG[status]?.color || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: CompanyStatus) => {
        const Icon = STATUS_CONFIG[status]?.icon || Building2;
        return <Icon className="w-4 h-4" />;
    };

    // Calculate statistics
    const stats = useMemo(() => {
        if (!companies || !Array.isArray(companies)) return { total: 0, pending: 0, approved: 0, suspended: 0 };

        const total = companies.length;
        const pending = companies.filter(c => c?.status === 'PENDING').length;
        const approved = companies.filter(c => c?.status === 'APPROVED').length;
        const suspended = companies.filter(c => c?.status === 'SUSPENDED').length;

        return { total, pending, approved, suspended };
    }, [companies]);

    // Clear filters
    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setDateRange('all');
        setCurrentPage(1);
    };

    if (isLoading && !companies?.length) {
        return (
            <div className="space-y-6 animate-fade-in p-6">
                <PageHeader
                    title="KYB Management"
                    description="Review and approve company registrations"
                />
                <Card className="border-2 shadow-sm">
                    <CardContent className="p-6">
                        <TableRowSkeleton columns={6} count={5} />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in p-6">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageHeader
                    title="KYB Management"
                    description="Review and approve company registrations"
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card key="total-stats" className="border-2 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Companies</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card key="pending-stats" className="border-2 border-yellow-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card key="approved-stats" className="border-2 border-green-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600">Approved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card key="suspended-stats" className="border-2 border-red-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600">Suspended</p>
                                <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                            </div>
                            <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert key="error-alert" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Filters */}
            <Card key="filters-card" className="border-2 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by company name, tax ID, or email..."
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
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
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

                        {(searchQuery || statusFilter !== 'all' || dateRange !== 'all') && (
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
            <div key="results-count" className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {paginatedCompanies.length} of {filteredCompanies.length} companies
                </p>
            </div>

            {/* Table */}
            <Card key="companies-table" className="border-2 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company</TableHead>
                                <TableHead>Tax ID (NIU)</TableHead>
                                <TableHead>Documents</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Applied</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRowSkeleton key={`skeleton-${i}`} columns={6} />
                                ))
                            ) : paginatedCompanies.length === 0 ? (
                                <TableRow key="empty-row">
                                    <TableCell colSpan={6}>
                                        <EmptyState
                                            icon={Building2}
                                            title="No companies found"
                                            description={
                                                searchQuery || statusFilter !== 'all' || dateRange !== 'all'
                                                    ? "No companies match your search criteria"
                                                    : "Companies will appear here when they register"
                                            }
                                            action={
                                                (searchQuery || statusFilter !== 'all' || dateRange !== 'all') && (
                                                    <Button variant="outline" onClick={clearFilters}>
                                                        Clear Filters
                                                    </Button>
                                                )
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedCompanies.map((company) => (
                                    <TableRow key={company.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{company.name}</p>
                                                <p className="text-sm text-muted-foreground">{company.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{company.taxId}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-primary/10">
                                                {company.kybDocs?.length || 0} document(s)
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(company.status)}>
                                                <span className="flex items-center gap-1">
                                                    {getStatusIcon(company.status)}
                                                    {company.status}
                                                </span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(company.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewCompany(company)}
                                                    className="h-8 w-8 hover:text-primary"
                                                    title="Review Company"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleContactCompany(company)}
                                                    className="h-8 w-8 hover:text-primary"
                                                    title="Contact Company"
                                                >
                                                    <Mail className="w-4 h-4" />
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
                <div key="pagination" className="flex items-center justify-between">
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

            {/* Upload Document Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                            Add a document for this company's KYB review.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="docName">Document Name</Label>
                            <Input
                                id="docName"
                                value={documentName}
                                onChange={(e) => setDocumentName(e.target.value)}
                                placeholder="e.g., NIU Certificate"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="docType">Document Type</Label>
                            <Select value={documentType} onValueChange={setDocumentType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NIU">NIU Certificate</SelectItem>
                                    <SelectItem value="RCCM">RCCM Document</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={documentNotes}
                                onChange={(e) => setDocumentNotes(e.target.value)}
                                placeholder="Additional notes about this document"
                                rows={3}
                            />
                        </div>

                        {uploadProgress > 0 && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUploadDocument}
                            disabled={uploadProgress > 0 || !uploadingFile}
                        >
                            {uploadProgress > 0 ? 'Uploading...' : 'Upload Document'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Company Detail Dialog */}
            <Dialog open={detailDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {selectedCompanyLocal && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-xl">
                                    {selectedCompanyLocal.name}
                                    <Badge className={getStatusColor(selectedCompanyLocal.status)}>
                                        <span className="flex items-center gap-1">
                                            {getStatusIcon(selectedCompanyLocal.status)}
                                            {selectedCompanyLocal.status}
                                        </span>
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription>
                                    Registered on {formatDateTime(selectedCompanyLocal.createdAt)}
                                </DialogDescription>
                            </DialogHeader>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="documents">Documents</TabsTrigger>
                                </TabsList>

                                <TabsContent value="details" className="space-y-4 mt-4">
                                    {/* Company Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Company Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-start gap-3">
                                                    <Building2 className="w-4 h-4 text-primary mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Company Name</p>
                                                        <p className="font-medium">{selectedCompanyLocal.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <CreditCard className="w-4 h-4 text-primary mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Tax ID (NIU)</p>
                                                        <p className="font-medium">{selectedCompanyLocal.taxId}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Mail className="w-4 h-4 text-primary mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Email</p>
                                                        <p className="font-medium">{selectedCompanyLocal.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Phone className="w-4 h-4 text-primary mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Phone</p>
                                                        <p className="font-medium">{selectedCompanyLocal.phone || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 flex items-start gap-3">
                                                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Address</p>
                                                        <p className="font-medium">{selectedCompanyLocal.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Dates */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Important Dates</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="w-4 h-4 text-primary mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Registered</p>
                                                        <p className="font-medium">{formatDateTime(selectedCompanyLocal.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="w-4 h-4 text-primary mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Last Updated</p>
                                                        <p className="font-medium">{formatDateTime(selectedCompanyLocal.updatedAt)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="documents" className="space-y-4 mt-4">
                                    {/* Upload Button */}
                                    <div className="flex justify-end">
                                        <Button onClick={handleFileSelect} size="sm">
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Document
                                        </Button>
                                    </div>

                                    {/* Documents List */}
                                    {!selectedCompanyLocal.kybDocs || selectedCompanyLocal.kybDocs.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p>No documents uploaded</p>
                                            <p className="text-sm">Upload NIU or RCCM documents for verification</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedCompanyLocal.kybDocs.map((doc) => (
                                                <Card key={doc.id}>
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                                    <FileText className="w-5 h-5 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{doc.name}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {doc.type.replace(/_/g, ' ')} • Uploaded {formatDate(doc.uploadedAt)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleViewDocument(doc)}
                                                                >
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDownloadDocument(doc)}
                                                                >
                                                                    <Download className="w-4 h-4 mr-2" />
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {/* Action Buttons */}
                            <div className="pt-4 border-t mt-4">
                                <h4 className="font-medium mb-3">Actions</h4>
                                <div className="flex gap-3 flex-wrap">
                                    <Button
                                        onClick={() => handleStatusUpdate(selectedCompanyLocal.id, 'APPROVED')}
                                        disabled={selectedCompanyLocal.status === 'APPROVED' || processingId === selectedCompanyLocal.id}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {processingId === selectedCompanyLocal.id ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                        )}
                                        Approve
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(selectedCompanyLocal.id, 'PENDING')}
                                        disabled={selectedCompanyLocal.status === 'PENDING' || processingId === selectedCompanyLocal.id}
                                        className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                                    >
                                        <Clock className="w-4 h-4 mr-2" />
                                        Mark Pending
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        onClick={() => handleStatusUpdate(selectedCompanyLocal.id, 'SUSPENDED')}
                                        disabled={selectedCompanyLocal.status === 'SUSPENDED' || processingId === selectedCompanyLocal.id}
                                    >
                                        {processingId === selectedCompanyLocal.id ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <XCircle className="w-4 h-4 mr-2" />
                                        )}
                                        Suspend
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => handleContactCompany(selectedCompanyLocal)}
                                        className="ml-auto"
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Contact Company
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Document Preview Dialog */}
            <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDocument?.name}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedDocument?.type.replace(/_/g, ' ')} • Uploaded {selectedDocument && formatDate(selectedDocument.uploadedAt)}
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
        </div>
    );
}