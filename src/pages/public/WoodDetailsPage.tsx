import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    ShoppingCart,
    Package,
    Ruler,
    MapPin,
    Calendar,
    DollarSign,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Download,
    Share2,
    Check,
    Plus,
    Minus,
    Heart,
    Truck,
    Shield,
    Clock,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useWoodStore } from '@/stores/useWoodStore';
import { useCartStore } from '@/stores/usecartStore.ts';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

// Helper function to format dimensions safely
const formatDimensions = (dimensions: any): string => {
    if (!dimensions) return 'N/A';

    // If dimensions is an object with length, width, height
    if (typeof dimensions === 'object' && dimensions !== null) {
        const { length, width, height, unit = 'cm' } = dimensions;
        if (length && width && height) {
            return `${length}${unit} x ${width}${unit} x ${height}${unit}`;
        }
    }

    // If dimensions is already a string
    if (typeof dimensions === 'string') return dimensions;

    return 'N/A';
};

export default function WoodDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectedWood, fetchWoodItemById, isLoading, error } = useWoodStore();
    const { addItem, items: cartItems } = useCartStore();
    const { company } = useAuthStore();

    // Local state
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const isApproved = company?.status === 'APPROVED';
    const wood = selectedWood;

    // Check if item is in cart
    const isInCart = wood ? cartItems.some(item => item.woodItem.id === wood.id) : false;
    const cartItem = wood ? cartItems.find(item => item.woodItem.id === wood.id) : null;

    // Load wood details on mount
    useEffect(() => {
        if (id) {
            fetchWoodItemById(id);
        }
    }, [id, fetchWoodItemById]);

    // Reset quantity when wood changes
    useEffect(() => {
        if (wood) {
            setQuantity(1);
            setCurrentImageIndex(0);
            setIsAddedToCart(false);
        }
    }, [wood]);

    // Handle quantity change
    const handleQuantityChange = (delta: number) => {
        if (!wood) return;
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= wood.stockLevel) {
            setQuantity(newQuantity);
        }
    };

    // Handle add to cart
    const handleAddToCart = () => {
        if (!wood) return;

        if (!isApproved) {
            toast.error('Approval Required', {
                description: 'Your company must be approved to add items to cart',
            });
            return;
        }

        if (wood.status === 'OUT_OF_STOCK') {
            toast.error('Out of Stock', {
                description: 'This item is currently out of stock',
            });
            return;
        }

        if (quantity > wood.stockLevel) {
            toast.error('Insufficient Stock', {
                description: `Only ${wood.stockLevel} CBM available`,
            });
            return;
        }

        addItem(wood, quantity);
        setIsAddedToCart(true);

        toast.success('Added to Cart', {
            description: `${quantity} CBM of ${wood.species} added to your cart`,
        });

        setTimeout(() => setIsAddedToCart(false), 3000);
    };

    // Handle image navigation
    const nextImage = () => {
        if (!wood?.images || wood.images.length === 0) return;
        setCurrentImageIndex((prev) => (prev + 1) % wood.images.length);
    };

    const prevImage = () => {
        if (!wood?.images || wood.images.length === 0) return;
        setCurrentImageIndex((prev) => (prev - 1 + wood.images.length) % wood.images.length);
    };

    // Handle favorite toggle
    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    };

    // Generate PDF specification sheet
    const generateSpecSheet = () => {
        if (!wood) return;

        setIsGeneratingPDF(true);
        toast.info('Generating specification sheet...');

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;

            // Header
            doc.setFillColor(34, 197, 94);
            doc.rect(0, 0, pageWidth, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('TIMBERTRADE', margin, 25);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Product Specification Sheet', margin, 32);

            // Title
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(wood.species, margin, 55);

            // Basic Info
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Product Information', margin, 70);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            let yPos = 80;
            const lineHeight = 7;

            doc.text(`Origin: ${wood.origin}`, margin, yPos);
            yPos += lineHeight;
            doc.text(`Grade: ${wood.grade}`, margin, yPos);
            yPos += lineHeight;
            doc.text(`Dimensions: ${formatDimensions(wood.dimensions)}`, margin, yPos);
            yPos += lineHeight;
            doc.text(`Volume: ${wood.volume} CBM`, margin, yPos);
            yPos += lineHeight;
            doc.text(`Price: XAF ${wood.price.toLocaleString()}/CBM`, margin, yPos);
            yPos += lineHeight;
            doc.text(`Stock Level: ${wood.stockLevel} CBM`, margin, yPos);
            yPos += lineHeight;
            doc.text(`Status: ${wood.status}`, margin, yPos);

            // Description
            yPos += 15;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Description', margin, yPos);

            yPos += 7;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            // Split long description into multiple lines
            const descriptionLines = doc.splitTextToSize(wood.description || 'No description available.', pageWidth - (margin * 2));
            doc.text(descriptionLines, margin, yPos);

            // Footer
            yPos = doc.internal.pageSize.getHeight() - 20;
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(128, 128, 128);
            doc.text(`Generated on ${format(new Date(), 'PPP')}`, margin, yPos);
            doc.text('TimberTrade - Premium Timber Export', pageWidth - margin, yPos, { align: 'right' });

            // Save the PDF
            doc.save(`${wood.species}-Specifications.pdf`);
            toast.success('Specification sheet downloaded');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate specification sheet');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div className="grid md:grid-cols-2 gap-8">
                    <Skeleton className="h-96 rounded-lg" />
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !wood) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Alert variant="destructive" className="max-w-lg mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'Wood item not found'}
                    </AlertDescription>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate('/catalog')}
                    >
                        Browse Catalog
                    </Button>
                </Alert>
            </div>
        );
    }

    const images = wood.images?.length > 0 ? wood.images : ['/placeholder-wood.jpg'];
    const isOutOfStock = wood.status === 'OUT_OF_STOCK';
    const isLowStock = wood.status === 'LOW_STOCK';
    const totalPrice = wood.price * quantity;
    const formattedDimensions = formatDimensions(wood.dimensions);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 py-8 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Back Button */}
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Catalog
                </Button>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative bg-white rounded-xl overflow-hidden border-2 shadow-lg">
                            {/* Main Image */}
                            <div
                                className={`relative aspect-square cursor-zoom-in transition-transform duration-300 ${isZoomed ? 'scale-150' : ''
                                    }`}
                                onClick={() => setIsZoomed(!isZoomed)}
                            >
                                <img
                                    src={images[currentImageIndex]}
                                    alt={wood.species}
                                    className="w-full h-full object-cover"
                                />

                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <StatusBadge status={wood.status} />
                                </div>

                                {/* Grade Badge */}
                                <Badge className="absolute top-4 left-4 bg-primary text-white text-lg px-3 py-1">
                                    Grade {wood.grade}
                                </Badge>

                                {/* Favorite Button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute bottom-4 right-4 bg-white/90 hover:bg-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite();
                                    }}
                                >
                                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                                </Button>
                            </div>

                            {/* Image Navigation */}
                            {images.length > 1 && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                                        onClick={prevImage}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                                        onClick={nextImage}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Strip */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        className={`w-20 h-20 rounded-lg border-2 overflow-hidden flex-shrink-0 ${index === currentImageIndex
                                            ? 'border-primary'
                                            : 'border-transparent hover:border-gray-300'
                                            }`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    >
                                        <img
                                            src={img}
                                            alt={`${wood.species} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Zoom Controls */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ZoomIn className="w-4 h-4" />
                            <span>Click image to zoom</span>
                        </div>
                    </div>

                    {/* Wood Details */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-4xl font-bold text-foreground mb-2">
                                {wood.species}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {wood.origin}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Ruler className="w-4 h-4" />
                                    {formattedDimensions}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Package className="w-4 h-4" />
                                    {wood.stockLevel} CBM available
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-foreground">
                                    XAF {wood.price.toLocaleString()}
                                </span>
                                <span className="text-muted-foreground">/CBM</span>
                            </div>
                            {isLowStock && (
                                <p className="text-sm text-amber-600 mt-2">
                                    Only {wood.stockLevel} CBM left in stock
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="prose max-w-none">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {wood.description || 'No description available.'}
                            </p>
                        </div>

                        {/* Specifications */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Species</p>
                                        <p className="font-medium">{wood.species}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Origin</p>
                                        <p className="font-medium">{wood.origin}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Grade</p>
                                        <p className="font-medium">{wood.grade}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Dimensions</p>
                                        <p className="font-medium">{formattedDimensions}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Volume</p>
                                        <p className="font-medium">{wood.volume} CBM</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Stock</p>
                                        <p className="font-medium">{wood.stockLevel} CBM</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Details Tabs */}
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="shipping">Shipping</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details" className="p-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            Listed on {format(new Date(wood.createdAt), 'PPP')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            Last updated {format(new Date(wood.updatedAt), 'PPP')}
                                        </span>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="shipping" className="p-4">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Truck className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="font-medium">Shipping Information</p>
                                            <p className="text-sm text-muted-foreground">
                                                Free shipping on orders over XAF 1,000,000
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="font-medium">Quality Guarantee</p>
                                            <p className="text-sm text-muted-foreground">
                                                All timber is certified and inspected
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="reviews" className="p-4">
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No reviews yet. Be the first to review this product.
                                </p>
                            </TabsContent>
                        </Tabs>

                        {/* Purchase Section */}
                        <Card className="border-2 border-primary/20">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {/* Quantity Selector */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Quantity (CBM)
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center border rounded-lg">
                                                <button
                                                    onClick={() => handleQuantityChange(-1)}
                                                    disabled={quantity <= 1 || isOutOfStock}
                                                    className="p-3 hover:bg-muted transition-colors disabled:opacity-50"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-16 text-center font-medium">
                                                    {quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(1)}
                                                    disabled={quantity >= wood.stockLevel || isOutOfStock}
                                                    className="p-3 hover:bg-muted transition-colors disabled:opacity-50"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                Max: {wood.stockLevel} CBM
                                            </span>
                                        </div>
                                    </div>

                                    {/* Total Price */}
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-lg">Total Price:</span>
                                        <span className="text-2xl font-bold text-primary">
                                            XAF {totalPrice.toLocaleString()}
                                        </span>
                                    </div>

                                    <Separator />

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {isInCart ? (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => navigate('/company/cart')}
                                            >
                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                                View in Cart
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleAddToCart}
                                                disabled={isOutOfStock || !isApproved}
                                                className="w-full bg-gradient-to-r from-primary to-secondary text-white"
                                                size="lg"
                                            >
                                                {isAddedToCart ? (
                                                    <>
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Added!
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                                        Add to Cart
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={() => window.open(`mailto:?subject=Check out this ${wood.species}&body=Check out this wood: ${window.location.href}`)}
                                        >
                                            <Share2 className="w-4 h-4 mr-2" />
                                            Share
                                        </Button>
                                    </div>

                                    {/* Download Specs */}
                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={generateSpecSheet}
                                        disabled={isGeneratingPDF}
                                    >
                                        {isGeneratingPDF ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4 mr-2" />
                                        )}
                                        Download Specifications
                                    </Button>

                                    {/* Approval Message */}
                                    {!isApproved && company && (
                                        <p className="text-sm text-center text-amber-600 mt-2">
                                            Approval required to purchase
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}