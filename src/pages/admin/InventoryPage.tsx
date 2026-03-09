import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Package,
    X,
    Loader2,
    AlertCircle,
    RefreshCw,
    Upload,
    Image as ImageIcon,
    FileText,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableRowSkeleton } from '@/components/shared/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useWoodStore } from '@/stores/useWoodStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import type { WoodItem, WoodGrade } from '@/types';

export default function InventoryPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        woodItems,
        isLoading,
        error,
        fetchWoodItems,
        createWoodItem,
        updateWoodItem,
        deleteWoodItem,
        uploadImagesToCloudinary,
        uploadProgress
    } = useWoodStore();

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [gradeFilter, setGradeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<WoodItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<WoodItem | null>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [retryCount, setRetryCount] = useState(0);
    const [activeTab, setActiveTab] = useState('details');

    const [formData, setFormData] = useState({
        species: '',
        origin: '',
        grade: 'B' as WoodGrade,
        volume: 0,
        price: 0,
        stockLevel: 0,
        dimensions: '',
        description: '',
    });

    // Load items on mount and when retry changes
    useEffect(() => {
        loadItems();
    }, [retryCount]);

    const loadItems = async () => {
        try {
            await fetchWoodItems(1);
        } catch (error) {
            console.error('Failed to load inventory:', error);
            toast.error('Failed to load inventory');
        }
    };

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        toast.info('Retrying...');
    };

    const handleRefresh = async () => {
        await loadItems();
        toast.success('Inventory refreshed');
    };

    // Filter items
    const filteredItems = useMemo(() => {
        if (!woodItems) return [];

        return woodItems.filter((item) => {
            const matchesSearch = searchQuery === '' ||
                item.species?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.origin?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesGrade = gradeFilter === 'all' || item.grade === gradeFilter;

            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

            return matchesSearch && matchesGrade && matchesStatus;
        });
    }, [woodItems, searchQuery, gradeFilter, statusFilter]);

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        // Validate file types and sizes
        const validFiles = files.filter(file => {
            const isValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
            
            if (!isValidType) {
                toast.error(`${file.name} is not a valid image format`);
            }
            if (!isValidSize) {
                toast.error(`${file.name} exceeds 5MB limit`);
            }
            
            return isValidType && isValidSize;
        });

        setSelectedImages(prev => [...prev, ...validFiles]);

        // Create preview URLs
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(imagePreviews[index]);
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Validate form
    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.species.trim()) {
            errors.species = 'Species is required';
        }
        if (!formData.origin.trim()) {
            errors.origin = 'Origin is required';
        }
        if (formData.price <= 0) {
            errors.price = 'Price must be greater than 0';
        }
        if (formData.stockLevel < 0) {
            errors.stockLevel = 'Stock level cannot be negative';
        }
        if (formData.volume <= 0) {
            errors.volume = 'Volume must be greater than 0';
        }
        if (!formData.dimensions.trim()) {
            errors.dimensions = 'Dimensions are required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenDialog = (item?: WoodItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                species: item.species,
                origin: item.origin,
                grade: item.grade,
                volume: item.volume,
                price: item.price,
                stockLevel: item.stockLevel,
                dimensions: item.dimensions,
                description: item.description || '',
            });
            // Clear any existing images when editing
            setSelectedImages([]);
            setImagePreviews([]);
        } else {
            setEditingItem(null);
            setFormData({
                species: '',
                origin: '',
                grade: 'B',
                volume: 0,
                price: 0,
                stockLevel: 0,
                dimensions: '',
                description: '',
            });
            setSelectedImages([]);
            setImagePreviews([]);
        }
        setFormErrors({});
        setActiveTab('details');
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Validate images for new items
        if (!editingItem && selectedImages.length === 0) {
            toast.error('Please upload at least one image');
            return;
        }

        setUploading(true);

        try {
            let success: boolean;

            if (editingItem) {
                // Update existing item
                success = await updateWoodItem(
                    editingItem.id,
                    formData,
                    selectedImages.length > 0 ? selectedImages : undefined
                );
                if (success) {
                    toast.success('Item updated successfully');
                }
            } else {
                // Create new item
                success = await createWoodItem(formData, selectedImages);
                if (success) {
                    toast.success('Item added successfully');
                }
            }

            if (success) {
                setDialogOpen(false);
                await loadItems();
                
                // Clean up image previews
                imagePreviews.forEach(url => URL.revokeObjectURL(url));
                setSelectedImages([]);
                setImagePreviews([]);
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(editingItem ? 'Failed to update item' : 'Failed to add item');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (item: WoodItem) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const success = await deleteWoodItem(itemToDelete.id);
            if (success) {
                toast.success('Item deleted successfully');
                setDeleteDialogOpen(false);
                setItemToDelete(null);
                await loadItems();
            }
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    // Calculate statistics
    const stats = useMemo(() => {
        if (!woodItems) return { total: 0, totalValue: 0, lowStock: 0, outOfStock: 0 };

        const total = woodItems.length;
        const totalValue = woodItems.reduce((sum, item) => sum + (item.price * item.stockLevel), 0);
        const lowStock = woodItems.filter(item => item.status === 'LOW_STOCK').length;
        const outOfStock = woodItems.filter(item => item.status === 'OUT_OF_STOCK').length;

        return { total, totalValue, lowStock, outOfStock };
    }, [woodItems]);

    // Clean up previews on unmount
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    if (isLoading && !woodItems.length) {
        return (
            <div className="space-y-6 animate-fade-in p-6">
                <PageHeader
                    title="Wood Inventory"
                    description="Manage your timber stock and pricing"
                />
                <Card className="border-2 shadow-sm">
                    <CardContent className="p-6">
                        <TableRowSkeleton columns={8} count={5} />
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
                    title="Wood Inventory"
                    description="Manage your timber stock and pricing"
                />
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => handleOpenDialog()}
                        className="bg-gradient-to-r from-primary to-secondary text-white"
                        size="sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Items</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Inventory Value</p>
                                <p className="text-2xl font-bold">XAF { " " +stats.totalValue.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Package className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Low Stock</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                            </div>
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Out of Stock</p>
                                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                            </div>
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Package className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetry}
                        className="mt-2"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </Alert>
            )}

            {/* Filters */}
            <Card className="border-2 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by species or origin..."
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

                        <Select value={gradeFilter} onValueChange={setGradeFilter}>
                            <SelectTrigger className="w-full md:w-40">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Grade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Grades</SelectItem>
                                <SelectItem value="A">Grade A</SelectItem>
                                <SelectItem value="B">Grade B</SelectItem>
                                <SelectItem value="C">Grade C</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="AVAILABLE">Available</SelectItem>
                                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredItems.length} of {woodItems?.length || 0} items
                </p>
            </div>

            {/* Table */}
            <Card className="border-2 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Species</TableHead>
                                <TableHead>Origin</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Dimensions</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRowSkeleton key={i} columns={9} />
                                ))
                            ) : filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9}>
                                        <EmptyState
                                            icon={Package}
                                            title="No items found"
                                            description={
                                                searchQuery || gradeFilter !== 'all' || statusFilter !== 'all'
                                                    ? "No items match your search criteria"
                                                    : "Add your first wood item to get started"
                                            }
                                            action={
                                                <Button
                                                    onClick={() => handleOpenDialog()}
                                                    className="bg-gradient-to-r from-primary to-secondary text-white"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Item
                                                </Button>
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredItems.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
                                                {item.images && item.images.length > 0 ? (
                                                    <img
                                                        src={item.images[0]}
                                                        alt={item.species}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.species}</TableCell>
                                        <TableCell>{item.origin}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-primary/10">
                                                {item.grade}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">{item.dimensions}</TableCell>
                                        <TableCell>XAF { "  " + item.price.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <span className={item.stockLevel < 10 ? 'text-yellow-600 font-medium' : ''}>
                                                {item.stockLevel} CBM
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={item.status} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDialog(item)}
                                                    className="h-8 w-8 hover:text-primary"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteClick(item)}
                                                    className="h-8 w-8 hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit Wood Item' : 'Add New Wood Item'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem 
                                ? 'Update the details of this wood item'
                                : 'Fill in the details to add a new wood item to your inventory'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="images">Images</TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSubmit}>
                            <TabsContent value="details" className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="species">
                                            Species <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="species"
                                            value={formData.species}
                                            onChange={(e) =>
                                                setFormData({ ...formData, species: e.target.value })
                                            }
                                            placeholder="e.g., Sapelli"
                                            className={formErrors.species ? 'border-destructive' : ''}
                                        />
                                        {formErrors.species && (
                                            <p className="text-xs text-destructive">{formErrors.species}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="origin">
                                            Origin <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="origin"
                                            value={formData.origin}
                                            onChange={(e) =>
                                                setFormData({ ...formData, origin: e.target.value })
                                            }
                                            placeholder="e.g., East Region"
                                            className={formErrors.origin ? 'border-destructive' : ''}
                                        />
                                        {formErrors.origin && (
                                            <p className="text-xs text-destructive">{formErrors.origin}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="grade">Grade</Label>
                                        <Select
                                            value={formData.grade}
                                            onValueChange={(v) =>
                                                setFormData({ ...formData, grade: v as WoodGrade })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">Grade A (Premium)</SelectItem>
                                                <SelectItem value="B">Grade B (Standard)</SelectItem>
                                                <SelectItem value="C">Grade C (Economy)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dimensions">
                                            Dimensions <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="dimensions"
                                            value={formData.dimensions}
                                            onChange={(e) =>
                                                setFormData({ ...formData, dimensions: e.target.value })
                                            }
                                            placeholder="e.g., 4m x 0.5m x 0.5m"
                                            className={formErrors.dimensions ? 'border-destructive' : ''}
                                        />
                                        {formErrors.dimensions && (
                                            <p className="text-xs text-destructive">{formErrors.dimensions}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="volume">
                                            Volume (CBM) <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="volume"
                                            type="number"
                                            value={formData.volume}
                                            onChange={(e) =>
                                                setFormData({ ...formData, volume: Number(e.target.value) })
                                            }
                                            min={0}
                                            step={0.1}
                                            className={formErrors.volume ? 'border-destructive' : ''}
                                        />
                                        {formErrors.volume && (
                                            <p className="text-xs text-destructive">{formErrors.volume}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">
                                            Price (XAF/CBM) <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) =>
                                                setFormData({ ...formData, price: Number(e.target.value) })
                                            }
                                            min={0}
                                            className={formErrors.price ? 'border-destructive' : ''}
                                        />
                                        {formErrors.price && (
                                            <p className="text-xs text-destructive">{formErrors.price}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stockLevel">
                                            Stock Level <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="stockLevel"
                                            type="number"
                                            value={formData.stockLevel}
                                            onChange={(e) =>
                                                setFormData({ ...formData, stockLevel: Number(e.target.value) })
                                            }
                                            min={0}
                                            className={formErrors.stockLevel ? 'border-destructive' : ''}
                                        />
                                        {formErrors.stockLevel && (
                                            <p className="text-xs text-destructive">{formErrors.stockLevel}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        placeholder="Optional description..."
                                        rows={3}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="images" className="space-y-4 mt-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center w-full">
                                        <label
                                            htmlFor="image-upload"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PNG, JPG (Max 5MB each)
                                                </p>
                                            </div>
                                            <input
                                                id="image-upload"
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg"
                                                multiple
                                                className="hidden"
                                                onChange={handleImageSelect}
                                            />
                                        </label>
                                    </div>

                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Uploading...</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <Progress value={uploadProgress} className="h-2" />
                                        </div>
                                    )}

                                    {/* Image Previews */}
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-3 gap-4">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!editingItem && imagePreviews.length === 0 && (
                                        <p className="text-sm text-destructive text-center">
                                            At least one image is required
                                        </p>
                                    )}
                                </div>
                            </TabsContent>

                            <div className="flex gap-3 pt-6 mt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    className="flex-1"
                                    disabled={uploading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-primary to-secondary text-white"
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {editingItem ? 'Updating...' : 'Adding...'}
                                        </>
                                    ) : (
                                        editingItem ? 'Update Item' : 'Add Item'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Delete Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{itemToDelete?.species}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            className="flex-1"
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}