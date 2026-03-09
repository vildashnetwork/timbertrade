import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Package,
  AlertCircle,
  Truck,
  Shield,
  CreditCard,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useOrderStore } from '@/stores/useOrderStore';
import { toast } from 'sonner';

// Helper function to format dimensions
const formatDimensions = (dimensions: any): string => {
  if (!dimensions) return 'N/A';

  // If dimensions is an object with length, width, height
  if (typeof dimensions === 'object') {
    const { length, width, height, unit = 'cm' } = dimensions;
    if (length && width && height) {
      return `${length}${unit} x ${width}${unit} x ${height}${unit}`;
    }
  }

  // If dimensions is already a string
  if (typeof dimensions === 'string') return dimensions;

  return 'N/A';
};

export default function CartPage() {
  const navigate = useNavigate();
  const { company } = useAuthStore();
  const cartStore = useCartStore();
  const orderStore = useOrderStore();

  // Safely access cart store with defaults
  const items = cartStore.items || [];
  const removeItem = cartStore.removeItem || (() => { });
  const updateQuantity = cartStore.updateQuantity || (() => { });
  const getTotal = cartStore.getTotalPrice || (() => 0);
  const clearCart = cartStore.clearCart || (() => { });

  // Safely access order store
  const createOrder = orderStore.createOrder;
  const orderLoading = orderStore.isLoading || false;

  // Local state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const isApproved = company?.status === 'APPROVED';
  const total = getTotal();
  const itemCount = items.length;

  const handleCheckout = async () => {
    if (!company) {
      toast.error('Company Not Found', {
        description: 'Company information is missing. Please contact support.',
      });
      return;
    }

    if (!isApproved) {
      toast.error('Approval Required', {
        description: 'Your company must be approved to place orders',
      });
      return;
    }

    if (items.length === 0) {
      toast.error('Cart is empty', {
        description: 'Add items to your cart before checking out',
      });
      return;
    }

    // Validate stock before showing confirmation
    const stockErrors: string[] = [];
    items.forEach(item => {
      if (item.quantity > item.woodItem.stockLevel) {
        stockErrors.push(`${item.woodItem.species}: Only ${item.woodItem.stockLevel} CBM available`);
      }
    });

    if (stockErrors.length > 0) {
      toast.error('Insufficient Stock', {
        description: stockErrors.join('\n'),
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmCheckout = async () => {
    setIsProcessing(true);
    setShowConfirmDialog(false);

    try {
      // Prepare order items
      const orderItems = items.map((item) => ({
        id: item.woodItem.id,
        quantity: item.quantity,
      }));

      // Create order using the order store
      const order = await createOrder({
        items: orderItems,
        shippingAddress: {
          address: company?.address || 'Douala',
          city: 'Douala',
          country: 'Cameroon',
        },
      });

      if (order) {
        setOrderSuccess(true);
        clearCart();

        toast.success('Order Placed Successfully!', {
          description: `Order #${order.orderNumber || order.id.slice(-6)} has been placed.`,
        });

        // Redirect after showing success message
        setTimeout(() => {
          navigate('/company/orders');
        }, 2000);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error: any) {
      console.error('Checkout failed:', error);
      toast.error('Checkout Failed', {
        description: error.response?.data?.message || error.message || 'Failed to place order. Please try again.',
      });
      setOrderSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const item = items.find(i => i.woodItem.id === itemId);
    if (!item) return;

    if (newQuantity < 1) {
      removeItem(itemId);
      toast.info('Item removed from cart');
      return;
    }

    if (newQuantity > item.woodItem.stockLevel) {
      toast.error('Insufficient Stock', {
        description: `Only ${item.woodItem.stockLevel} CBM available`,
      });
      return;
    }

    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string, species: string) => {
    removeItem(itemId);
    toast.success('Item Removed', {
      description: `${species} has been removed from your cart`,
    });
  };

  const handleClearCart = () => {
    if (items.length === 0) return;

    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
      toast.info('Cart cleared');
    }
  };

  // Calculate shipping estimate (free over 1000)
  const subtotal = total;
  const shipping = subtotal > 1000 ? 0 : 50;
  const tax = subtotal * 0.19; // 19% VAT
  const grandTotal = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
        <PageHeader title="Shopping Cart" />
        <Card className="border-2 shadow-sm">
          <CardContent className="py-12">
            <EmptyState
              icon={ShoppingCart}
              title="Your cart is empty"
              description="Browse our catalog to find premium timber for your needs"
              action={
                <Button
                  asChild
                  className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                >
                  <Link to="/company/catalog">
                    Browse Catalog <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      {/* Success Dialog */}
      <Dialog open={orderSuccess} onOpenChange={setOrderSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              Order Placed Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your order has been placed and is being processed.
              Redirecting to orders page...
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
            <DialogDescription>
              Please review your order before proceeding.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {items.map((item) => (
                <div key={item.woodItem.id} className="flex justify-between text-sm">
                  <span>
                    {item.woodItem.species} x {item.quantity} CBM
                  </span>
                  <span className="font-medium">
                    XAF {(item.woodItem.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-1.5">
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
                <span>XAF {grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmCheckout}
              disabled={isProcessing || orderLoading}
              className="bg-gradient-to-r from-primary to-secondary text-white"
            >
              {isProcessing || orderLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Order'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Shopping Cart"
          description={`${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart`}
        />
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            className="text-destructive hover:text-destructive"
          >
            Clear Cart
          </Button>
        )}
      </div>

      {/* Approval Warning */}
      {!isApproved && company && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            Your company must be approved before you can place orders.
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((cartItem) => {
            const itemTotal = cartItem.woodItem.price * cartItem.quantity;
            const maxStock = cartItem.woodItem.stockLevel;
            const formattedDimensions = formatDimensions(cartItem.woodItem.dimensions);

            return (
              <Card key={cartItem.woodItem.id} className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image Placeholder */}
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0">
                      {cartItem.woodItem.images && cartItem.woodItem.images.length > 0 ? (
                        <img
                          src={cartItem.woodItem.images[0]}
                          alt={cartItem.woodItem.species}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary/40">
                          {cartItem.woodItem.species?.charAt(0) || 'W'}
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {cartItem.woodItem.species || 'Unknown Species'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {cartItem.woodItem.origin || 'Unknown Origin'} • Grade {cartItem.woodItem.grade || 'N/A'}
                          </p>
                          {cartItem.woodItem.dimensions && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Dimensions: {formattedDimensions}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(cartItem.woodItem.id, cartItem.woodItem.species)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(cartItem.woodItem.id, cartItem.quantity - 1)}
                            disabled={cartItem.quantity <= 1}
                            className="p-2 hover:bg-muted transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(cartItem.woodItem.id, cartItem.quantity + 1)}
                            disabled={cartItem.quantity >= maxStock}
                            className="p-2 hover:bg-muted transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Stock Warning */}
                        {cartItem.quantity >= maxStock && (
                          <p className="text-xs text-amber-600">
                            Max stock reached
                          </p>
                        )}

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-semibold">
                            XAF {itemTotal.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            XAF {cartItem.woodItem.price}/CBM × {cartItem.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="border-2 shadow-sm sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.woodItem.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate flex-1">
                      {item.woodItem.species} × {item.quantity}
                    </span>
                    <span className="font-medium ml-2">
                      XAF {(item.woodItem.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">XAF {subtotal.toLocaleString()}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  Shipping
                </span>
                <span className="font-medium">
                  {shipping === 0 ? 'Free' : `XAF ${shipping}`}
                </span>
              </div>

              {/* Tax */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Tax (19% VAT)
                </span>
                <span className="font-medium">
                  XAF {tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold text-primary">
                  XAF {grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Free Shipping Notice */}
              {subtotal < 1000 && (
                <p className="text-xs text-muted-foreground text-center">
                  Add XAF {(1000 - subtotal).toLocaleString()} more for free shipping
                </p>
              )}

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={!isApproved || isProcessing || orderLoading || items.length === 0}
                className="w-full touch-target bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                size="lg"
              >
                {isProcessing || orderLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Place Order
                  </>
                )}
              </Button>

              {/* Approval Message */}
              {!isApproved && company && (
                <p className="text-sm text-center text-amber-600">
                  Approval required to place orders
                </p>
              )}

              {/* Payment Methods */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                <span className="text-xs">Secure payment</span>
              </div>

              <Separator />

              {/* Continue Shopping */}
              <Button
                variant="outline"
                asChild
                className="w-full"
              >
                <Link to="/company/catalog">
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}