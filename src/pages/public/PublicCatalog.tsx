import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  TreePine,
  LogIn,
  UserPlus,
  X,
  ChevronDown,
  MapPin,
  Ruler,
  Package,
  AlertCircle,
  RefreshCw
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CatalogGridSkeleton } from '@/components/shared/LoadingSkeleton';
import { useWoodStore } from '@/stores/useWoodStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDebounce } from '@/hooks/useDebounce';
import type { WoodItem, WoodGrade } from '@/types';
import { toast } from 'sonner';

// Grade options for filter
const GRADE_OPTIONS: { value: WoodGrade | 'all'; label: string }[] = [
  { value: 'all', label: 'All Grades' },
  { value: 'A', label: 'Grade A (Premium)' },
  { value: 'B', label: 'Grade B (Standard)' },
  { value: 'C', label: 'Grade C (Economy)' },
];

export default function PublicCatalog() {
  const navigate = useNavigate();
  // Ensure woodItems is always an array with default empty array
  const { woodItems = [], isLoading, error, fetchWoodItems } = useWoodStore();
  const { isAuthenticated, user } = useAuthStore();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<WoodGrade | 'all'>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Debounce search query to avoid too many re-renders
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load items on mount and when retry count changes
  useEffect(() => {
    loadItems();
  }, [retryCount]);

  const loadItems = async () => {
    try {
      await fetchWoodItems(1);
      setInitialLoadDone(true);
    } catch (err) {
      console.error('Failed to load catalog:', err);
      toast.error('Failed to load catalog', {
        description: 'Please try again later',
      });
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    toast.info('Retrying...');
  };

  // Safely filter and sort items with null checks
  const filteredItems = useMemo(() => {
    // Ensure woodItems is an array before spreading
    const itemsArray = Array.isArray(woodItems) ? woodItems : [];

    let filtered = [...itemsArray];

    // Apply search filter
    if (debouncedSearch) {
      filtered = filtered.filter((item) =>
        (item.species?.toLowerCase() || '').includes(debouncedSearch.toLowerCase()) ||
        (item.origin?.toLowerCase() || '').includes(debouncedSearch.toLowerCase()) ||
        (item.description?.toLowerCase() || '').includes(debouncedSearch.toLowerCase())
      );
    }

    // Apply grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter((item) => item.grade === gradeFilter);
    }

    // Apply species filter
    if (speciesFilter !== 'all') {
      filtered = filtered.filter((item) =>
        (item.species?.toLowerCase() || '') === speciesFilter.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'name':
        default:
          return (a.species || '').localeCompare(b.species || '');
      }
    });

    return filtered;
  }, [woodItems, debouncedSearch, gradeFilter, speciesFilter, sortBy]);

  // Get unique species for filter with null check
  const uniqueSpecies = useMemo(() => {
    const itemsArray = Array.isArray(woodItems) ? woodItems : [];
    const species = itemsArray
      .map(item => item.species)
      .filter((species): species is string => !!species);
    return ['all', ...new Set(species)];
  }, [woodItems]);

  // Handle login/register redirects
  const handleLogin = () => {
    navigate('/login', { state: { from: { pathname: '/catalog' } } });
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleViewDetails = (itemId: string) => {
    navigate(`/woods/${itemId}`);
  };

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setGradeFilter('all');
    setSpeciesFilter('all');
    setSortBy('name');
    toast.success('Filters cleared');
  }, []);

  // Get stock status color
  const getStockColor = (status: string = 'OUT_OF_STOCK') => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-green-600 bg-green-50';
      case 'LOW_STOCK':
        return 'text-yellow-600 bg-yellow-50';
      case 'OUT_OF_STOCK':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Render loading state
  if ((isLoading || !initialLoadDone) && (!woodItems || woodItems.length === 0)) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          isAuthenticated={isAuthenticated}
          user={user}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        <CatalogGridSkeleton count={6} />
        <Footer />
      </div>
    );
  }

  // Render error state
  if (error && (!woodItems || woodItems.length === 0)) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          isAuthenticated={isAuthenticated}
          user={user}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        <div className="container mx-auto px-4 py-16">
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
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 via-primary/10 to-background py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Premium Cameroon Timber
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore our curated selection of high-quality African hardwoods.
            Sustainably sourced from Cameroon's finest forests.
          </p>

          {/* Search & Filter */}
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 shadow-lg">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by species, origin, or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 h-12"
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

                  {/* Filter Toggle for Mobile */}
                  <Button
                    variant="outline"
                    className="w-full md:hidden"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </Button>

                  {/* Filter Row */}
                  <div className={`grid grid-cols-1 md:grid-cols-4 gap-3 ${showFilters ? 'block' : 'hidden md:grid'}`}>
                    <Select value={gradeFilter} onValueChange={(value) => setGradeFilter(value as WoodGrade | 'all')}>
                      <SelectTrigger className="w-full">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
                      <SelectTrigger className="w-full">
                        <TreePine className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Species" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueSpecies.map((species) => (
                          <SelectItem key={species} value={species}>
                            {species === 'all' ? 'All Species' : species}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                      <SelectTrigger className="w-full">
                        <span>Sort by</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                        <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full"
                      disabled={!searchQuery && gradeFilter === 'all' && speciesFilter === 'all'}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Count */}
      <div className="container mx-auto px-4 py-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredItems.length} of {Array.isArray(woodItems) ? woodItems.length : 0} items
        </p>
      </div>

      {/* Catalog Grid */}
      <section className="container mx-auto px-4 py-8">
        {isLoading ? (
          <CatalogGridSkeleton count={6} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <WoodCard
                  key={item.id}
                  item={item}
                  onViewDetails={handleViewDetails}
                  getStockColor={getStockColor}
                />
              ))}
            </div>

            {!isLoading && filteredItems.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Package className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-primary/5 py-12 mt-12">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to start ordering?</h3>
            <p className="text-muted-foreground mb-6">
              Register your company to access our full catalog and start placing orders.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={handleRegister} className="min-w-[150px]">
                <UserPlus className="w-4 h-4 mr-2" />
                Register Now
              </Button>
              <Button size="lg" variant="outline" onClick={handleLogin}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Header Component
interface HeaderProps {
  isAuthenticated: boolean;
  user: any;
  onLogin: () => void;
  onRegister: () => void;
}

function Header({ isAuthenticated, user, onLogin, onRegister }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-primary to-secondary text-primary-foreground sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-white/30 transition-all">
              <TreePine className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg">TimberTrade</h1>
              <p className="text-xs opacity-80">Cameroon Wood Export</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button
                asChild
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Link to={user?.role === 'SUPER_ADMIN' ? '/admin' : '/company'}>
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={onLogin}
                  className="text-white hover:bg-white/20"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={onRegister}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Register</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Wood Card Component
interface WoodCardProps {
  item: WoodItem;
  onViewDetails: (id: string) => void;
  getStockColor: (status: string) => string;
}

function WoodCard({ item, onViewDetails, getStockColor }: WoodCardProps) {
  // Ensure item has all required properties with defaults
  const safeItem = {
    id: item.id || '',
    species: item.species || 'Unknown Species',
    origin: item.origin || 'Unknown Origin',
    grade: item.grade || 'C',
    price: item.price || 0,
    stockLevel: item.stockLevel || 0,
    status: item.status || 'OUT_OF_STOCK',
    dimensions: item.dimensions || 'N/A',
    images: Array.isArray(item.images) ? item.images : [],
    description: item.description || '',
  };

  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/20"
    >
      {/* Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 relative overflow-hidden">
        {safeItem.images && safeItem.images.length > 0 ? (
          <img
            src={safeItem.images[0]}
            alt={safeItem.species}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <TreePine className="w-12 h-12 text-primary/40" />
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">
            Grade {safeItem.grade}
          </Badge>
          <Badge variant="outline" className="bg-background/90 backdrop-blur">
            {safeItem.origin}
          </Badge>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={safeItem.status} />
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {safeItem.species}
        </h3>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{safeItem.origin}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ruler className="w-4 h-4" />
            <span>{safeItem.dimensions}</span>
          </div>
          <div className={`flex items-center gap-2 text-sm px-2 py-1 rounded ${getStockColor(safeItem.status)}`}>
            <Package className="w-4 h-4" />
            <span>{safeItem.stockLevel} CBM available</span>
          </div>
        </div>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-bold text-foreground">
            XAF {" "+ safeItem.price.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">/CBM</span>
        </div>

        <Button
          onClick={() => onViewDetails(safeItem.id)}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0"
          disabled={safeItem.status === 'OUT_OF_STOCK'}
        >
          {safeItem.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'View Details'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TreePine className="w-6 h-6" />
              <span className="font-bold text-lg">TimberTrade</span>
            </div>
            <p className="text-sm opacity-80 max-w-md">
              Connecting Cameroon's finest timber with global markets.
              Sustainable, certified, and premium quality hardwoods.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/about" className="hover:opacity-100">About Us</Link></li>
              <li><Link to="/contact" className="hover:opacity-100">Contact</Link></li>
              <li><Link to="/faq" className="hover:opacity-100">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/terms" className="hover:opacity-100">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:opacity-100">Privacy Policy</Link></li>
              <li><Link to="/shipping" className="hover:opacity-100">Shipping Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-4 text-center text-sm opacity-60">
          <p>© {new Date().getFullYear()} TimberTrade. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}