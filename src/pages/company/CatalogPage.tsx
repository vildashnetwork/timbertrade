import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  AlertCircle,
  RefreshCw,
  X,
  SlidersHorizontal,
  Grid,
  List,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CatalogGridSkeleton } from '@/components/shared/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWoodStore } from '@/stores/useWoodStore';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import type { WoodItem, WoodGrade } from '@/types';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc';

export default function CatalogPage() {
  const navigate = useNavigate();
  const { company } = useAuthStore();
  const woodStore = useWoodStore();
  const cartStore = useCartStore();

  // Safely access store properties with defaults
  const woodItems = woodStore.woodItems || [];
  const isLoading = woodStore.isLoading || false;
  const error = woodStore.error || null;
  const fetchWoodItems = woodStore.fetchWoodItems || (async () => {});
  const cartItems = cartStore.items || [];
  const addItem = cartStore.addItem || (() => {});
  const updateCartQuantity = cartStore.updateQuantity || (() => {});

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<WoodGrade | 'all'>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const isApproved = company?.status === 'APPROVED';
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load items on mount and when filters change
  useEffect(() => {
    loadItems();
  }, [gradeFilter, speciesFilter, debouncedSearch, sortBy, retryCount]);

  // Initialize quantities when items load
  useEffect(() => {
    if (woodItems && woodItems.length > 0) {
      const initialQuantities: Record<string, number> = {};
      woodItems.forEach((item) => {
        if (item && item.id) {
          // Check if item is already in cart
          const cartItem = cartItems?.find(ci => ci?.woodItem?.id === item.id);
          initialQuantities[item.id] = cartItem?.quantity || 1;
        }
      });
      setQuantities(initialQuantities);
    }
  }, [woodItems, cartItems]);

  const loadItems = async () => {
    try {
      await fetchWoodItems(1, {
        grade: gradeFilter !== 'all' ? gradeFilter : undefined,
        search: debouncedSearch || undefined,
      });
    } catch (error) {
      console.error('Failed to load catalog:', error);
      toast.error('Failed to load catalog');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    toast.info('Retrying...');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setGradeFilter('all');
    setSpeciesFilter('all');
    setSortBy('name-asc');
    toast.success('Filters cleared');
  };

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const currentQty = prev[id] || 1;
      const newQty = Math.max(1, Math.min(currentQty + delta, 100));
      
      // Update cart if item is already in cart
      const cartItem = cartItems?.find(ci => ci?.woodItem?.id === id);
      if (cartItem && updateCartQuantity) {
        updateCartQuantity(id, newQty);
      }
      
      return {
        ...prev,
        [id]: newQty,
      };
    });
  };

  const handleAddToCart = (item: WoodItem) => {
    if (!item || !item.id) return;

    if (!isApproved) {
      toast.error('Approval Required', {
        description: 'Your company must be approved to add items to cart',
      });
      return;
    }

    if (item.status === 'OUT_OF_STOCK') {
      toast.error('Out of Stock', {
        description: 'This item is currently out of stock',
      });
      return;
    }

    const quantity = quantities[item.id] || 1;
    
    // Check if enough stock
    if (quantity > (item.stockLevel || 0)) {
      toast.error('Insufficient Stock', {
        description: `Only ${item.stockLevel} CBM available`,
      });
      return;
    }

    addItem(item, quantity);
    toast.success('Added to Cart', {
      description: `${quantity} CBM of ${item.species} added to your cart`,
    });
  };

  const isInCart = (itemId: string) => {
    return cartItems?.some((ci) => ci?.woodItem?.id === itemId) || false;
  };

  const getCartQuantity = (itemId: string) => {
    const cartItem = cartItems?.find(ci => ci?.woodItem?.id === itemId);
    return cartItem?.quantity || quantities[itemId] || 1;
  };

  // Get unique species for filter
  const uniqueSpecies = useMemo(() => {
    if (!woodItems || woodItems.length === 0) return ['all'];
    const species = woodItems
      .map(item => item?.species)
      .filter((s): s is string => !!s);
    return ['all', ...new Set(species)];
  }, [woodItems]);

  // Sort items
  const sortedItems = useMemo(() => {
    if (!woodItems || woodItems.length === 0) return [];
    
    let sorted = [...woodItems].filter(item => item !== null);
    
    switch (sortBy) {
      case 'name-asc':
        sorted.sort((a, b) => (a.species || '').localeCompare(b.species || ''));
        break;
      case 'name-desc':
        sorted.sort((a, b) => (b.species || '').localeCompare(a.species || ''));
        break;
      case 'price-asc':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'stock-desc':
        sorted.sort((a, b) => (b.stockLevel || 0) - (a.stockLevel || 0));
        break;
    }
    
    return sorted;
  }, [woodItems, sortBy]);

  // Filter items
  const filteredItems = useMemo(() => {
    return sortedItems.filter((item) => {
      if (!item) return false;
      
      // Apply species filter
      if (speciesFilter !== 'all' && item.species !== speciesFilter) {
        return false;
      }
      return true;
    });
  }, [sortedItems, speciesFilter]);

  // Show loading state
  if (isLoading && (!woodItems || woodItems.length === 0)) {
    return (
      <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
        <PageHeader
          title="Wood Catalog"
          description="Browse our premium timber selection"
        />
        <CatalogGridSkeleton count={6} />
      </div>
    );
  }

  // Show error state
  if (error && (!woodItems || woodItems.length === 0)) {
    return (
      <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
        <PageHeader
          title="Wood Catalog"
          description="Browse our premium timber selection"
        />
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load catalog. Please try again.
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
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Wood Catalog"
          description="Browse our premium timber selection"
        />
        
        {/* View Toggle & Sort (Desktop) */}
        <div className="hidden sm:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('name-asc')}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('name-desc')}>
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('price-asc')}>
                Price (Low to High)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('price-desc')}>
                Price (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('stock-desc')}>
                Stock (High to Low)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 ${viewMode === 'list' ? 'bg-muted' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Approval Warning */}
      {!isApproved && company && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <h5 className="font-medium text-yellow-800 mb-1">Approval Required</h5>
          <AlertDescription className="text-yellow-700">
            Your company must be approved before you can add items to cart.
            <Button 
              variant="link" 
              className="text-yellow-800 font-medium px-1 h-auto"
              onClick={() => navigate('/company/kyb-pending')}
            >
              Check Status
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="border-2 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
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

            {/* Grade Filter */}
            <Select value={gradeFilter} onValueChange={(value) => setGradeFilter(value as WoodGrade | 'all')}>
              <SelectTrigger className="w-full lg:w-40">
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

            {/* Species Filter */}
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Species" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                {uniqueSpecies.filter(s => s !== 'all').map(species => (
                  <SelectItem key={species} value={species}>
                    {species}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Sort & View
            </Button>

            {/* Clear Filters */}
            {(searchQuery || gradeFilter !== 'all' || speciesFilter !== 'all') && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="text-muted-foreground"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Mobile Sort Options */}
          {showMobileFilters && (
            <div className="mt-4 space-y-4 lg:hidden">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredItems.length} of {woodItems?.length || 0} items
        </p>
        <p className="text-sm text-muted-foreground">
          {cartItems?.length || 0} items in cart
        </p>
      </div>

      {/* Product Grid/List */}
      {isLoading ? (
        <CatalogGridSkeleton count={6} />
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className={`hover:shadow-lg transition-all duration-300 overflow-hidden border-2 hover:border-primary/20 ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Image Section */}
              <div className={viewMode === 'list' ? 'w-48 h-full' : 'h-48'}>
                <div className="h-full bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 relative overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.species}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary/40">
                          {item.species?.charAt(0) || 'W'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">
                      Grade {item.grade || 'N/A'}
                    </Badge>
                    <Badge variant="outline" className="bg-background/90 backdrop-blur">
                      {item.origin || 'Unknown'}
                    </Badge>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={item.status || 'OUT_OF_STOCK'} />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <CardContent className={`p-4 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.species || 'Unknown Species'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.origin || 'Unknown Origin'}
                  </p>

                  {/* Details */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <span>{item.dimensions || 'N/A'}</span>
                    <span>•</span>
                    <span>{item.stockLevel || 0} CBM available</span>
                  </div>

                  {/* Description (if available) */}
                  {item.description && viewMode === 'list' && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div>
                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-foreground">
                      XAF{" " + item.price?.toLocaleString() || '0'}
                    </span>
                    <span className="text-sm text-muted-foreground">/CBM</span>
                  </div>

                  {/* Quantity & Add to Cart */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2 hover:bg-muted transition-colors touch-target disabled:opacity-50"
                        disabled={!isApproved || item.status === 'OUT_OF_STOCK'}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {getCartQuantity(item.id)}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2 hover:bg-muted transition-colors touch-target disabled:opacity-50"
                        disabled={!isApproved || item.status === 'OUT_OF_STOCK'}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.status === 'OUT_OF_STOCK' || !isApproved}
                      className={`flex-1 touch-target ${
                        isInCart(item.id) 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white'
                      }`}
                    >
                      {isInCart(item.id) ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          In Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>

                  {!isApproved && company && (
                    <p className="text-xs text-amber-600 mt-2 text-center">
                      Approval required to order
                    </p>
                  )}

                  {isInCart(item.id) && (
                    <p className="text-xs text-green-600 mt-2 text-center">
                      {getCartQuantity(item.id)} CBM in cart
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* Cart Summary (Mobile) */}
      {cartItems && cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div>
              <p className="text-sm text-muted-foreground">Cart Total</p>
              <p className="font-bold text-lg">
                XAF{" "+ cartItems.reduce((sum, item) => {
                  const price = item?.woodItem?.price || 0;
                  const quantity = item?.quantity || 0;
                  return sum + (price * quantity);
                }, 0).toLocaleString()}
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-primary to-secondary text-white">
              <a href="/company/cart">
                View Cart ({cartItems.length})
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}