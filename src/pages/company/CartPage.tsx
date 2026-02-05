 import { Link, useNavigate } from 'react-router-dom';
 import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Package } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Separator } from '@/components/ui/separator';
 import { PageHeader } from '@/components/shared/PageHeader';
 import { EmptyState } from '@/components/shared/EmptyState';
 import { useCartStore } from '@/stores/cartStore';
 import { useAuthStore } from '@/stores/authStore';
 import { orderService } from '@/services/api';
 import { toast } from 'sonner';
 
 export default function CartPage() {
   const navigate = useNavigate();
   const { company } = useAuthStore();
   const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
 
   const isApproved = company?.status === 'APPROVED';
   const total = getTotal();
 
   const handleCheckout = async () => {
     if (!company || !isApproved) {
       toast.error('Your company must be approved to place orders');
       return;
     }
 
     try {
       const orderItems = items.map((item) => ({
         woodItemId: item.woodItem.id,
         quantity: item.quantity,
       }));
 
       await orderService.create(company.id, orderItems);
       clearCart();
       toast.success('Order placed successfully!');
       navigate('/company/orders');
     } catch (error) {
       toast.error('Failed to place order');
     }
   };
 
   if (items.length === 0) {
     return (
       <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
         <PageHeader title="Shopping Cart" />
         <Card className="card-timber">
           <CardContent className="py-8">
             <EmptyState
               icon={ShoppingCart}
               title="Your cart is empty"
               description="Browse our catalog to find premium timber for your needs"
               action={
                 <Button asChild className="btn-wood">
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
       <PageHeader
         title="Shopping Cart"
         description={`${items.length} item(s) in your cart`}
       />
 
       <div className="grid lg:grid-cols-3 gap-6">
         {/* Cart Items */}
         <div className="lg:col-span-2 space-y-4">
           {items.map((cartItem) => (
             <Card key={cartItem.woodItem.id} className="card-timber">
               <CardContent className="p-4">
                 <div className="flex gap-4">
                   {/* Product Image Placeholder */}
                   <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0">
                     <span className="text-2xl font-bold text-primary/40">
                       {cartItem.woodItem.species.charAt(0)}
                     </span>
                   </div>
 
                   {/* Product Info */}
                   <div className="flex-1 min-w-0">
                     <div className="flex items-start justify-between gap-2">
                       <div>
                         <h3 className="font-semibold text-foreground">
                           {cartItem.woodItem.species}
                         </h3>
                         <p className="text-sm text-muted-foreground">
                           {cartItem.woodItem.origin} • Grade {cartItem.woodItem.grade}
                         </p>
                       </div>
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => removeItem(cartItem.woodItem.id)}
                         className="text-destructive hover:text-destructive h-8 w-8"
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
 
                     <div className="flex items-center justify-between mt-3">
                       {/* Quantity Controls */}
                       <div className="flex items-center border rounded-lg">
                         <button
                           onClick={() =>
                             updateQuantity(cartItem.woodItem.id, cartItem.quantity - 1)
                           }
                           className="p-2 hover:bg-muted transition-colors touch-target"
                         >
                           <Minus className="w-4 h-4" />
                         </button>
                         <span className="w-12 text-center font-medium">
                           {cartItem.quantity}
                         </span>
                         <button
                           onClick={() =>
                             updateQuantity(cartItem.woodItem.id, cartItem.quantity + 1)
                           }
                           className="p-2 hover:bg-muted transition-colors touch-target"
                         >
                           <Plus className="w-4 h-4" />
                         </button>
                       </div>
 
                       {/* Price */}
                       <div className="text-right">
                         <p className="font-semibold">
                           ${(cartItem.woodItem.price * cartItem.quantity).toLocaleString()}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           ${cartItem.woodItem.price}/CBM × {cartItem.quantity}
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>
 
         {/* Order Summary */}
         <div className="lg:col-span-1">
           <Card className="card-timber sticky top-4">
             <CardHeader>
               <CardTitle>Order Summary</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 {items.map((item) => (
                   <div key={item.woodItem.id} className="flex justify-between text-sm">
                     <span className="text-muted-foreground">
                       {item.woodItem.species} × {item.quantity}
                     </span>
                     <span>
                       ${(item.woodItem.price * item.quantity).toLocaleString()}
                     </span>
                   </div>
                 ))}
               </div>
 
               <Separator />
 
               <div className="flex justify-between items-center">
                 <span className="font-medium">Subtotal</span>
                 <span className="font-medium">${total.toLocaleString()}</span>
               </div>
 
               <div className="flex justify-between items-center text-sm text-muted-foreground">
                 <span>Shipping</span>
                 <span>Calculated at confirmation</span>
               </div>
 
               <Separator />
 
               <div className="flex justify-between items-center">
                 <span className="text-lg font-semibold">Total</span>
                 <span className="text-lg font-semibold">${total.toLocaleString()}</span>
               </div>
 
               <Button
                 onClick={handleCheckout}
                 disabled={!isApproved}
                 className="w-full touch-target btn-wood"
               >
                 <Package className="w-4 h-4 mr-2" />
                 Place Order
               </Button>
 
               {!isApproved && (
                 <p className="text-sm text-center text-muted-foreground">
                   Your company must be approved to place orders
                 </p>
               )}
 
               <Button
                 variant="outline"
                 asChild
                 className="w-full"
               >
                 <Link to="/company/catalog">Continue Shopping</Link>
               </Button>
             </CardContent>
           </Card>
         </div>
       </div>
     </div>
   );
 }