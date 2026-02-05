 import { useEffect, useState } from 'react';
 import { Link } from 'react-router-dom';
 import {
   Package,
   ShoppingCart,
   FileText,
   TrendingUp,
   ArrowRight,
   AlertCircle,
 } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
 import { PageHeader } from '@/components/shared/PageHeader';
 import { StatusBadge } from '@/components/shared/StatusBadge';
 import { useAuthStore } from '@/stores/authStore';
 import { useCartStore } from '@/stores/cartStore';
 import { orderService } from '@/services/api';
 import type { Order } from '@/types';
 
 export default function CompanyDashboard() {
   const { company } = useAuthStore();
   const cartItemCount = useCartStore((state) => state.items.length);
   const cartTotal = useCartStore((state) => state.getTotal());
   const [orders, setOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     const loadOrders = async () => {
       if (company) {
         const data = await orderService.getByCompany(company.id);
         setOrders(data);
       }
       setLoading(false);
     };
     loadOrders();
   }, [company]);
 
   const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
   const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
 
   return (
     <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
       <PageHeader
         title={`Welcome, ${company?.name || 'Company'}`}
         description="Manage your timber procurement"
       />
 
       {/* KYB Status Alert */}
       {company?.status !== 'APPROVED' && (
         <Alert variant="default" className="border-status-pending bg-yellow-50">
           <AlertCircle className="h-4 w-4 text-status-pending" />
           <AlertTitle>KYB Verification {company?.status === 'PENDING' ? 'Pending' : 'Suspended'}</AlertTitle>
           <AlertDescription>
             {company?.status === 'PENDING'
               ? 'Your company verification is under review. Some features may be limited.'
               : 'Your account has been suspended. Please contact support.'}
           </AlertDescription>
         </Alert>
       )}
 
       {/* Quick Stats */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <Card className="card-timber">
           <CardContent className="p-4">
             <div className="flex items-start justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">Total Spent</p>
                 <p className="text-2xl font-bold mt-1">
                   ${totalSpent.toLocaleString()}
                 </p>
               </div>
               <div className="p-2 rounded-lg bg-accent/10">
                 <TrendingUp className="w-5 h-5 text-accent" />
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card className="card-timber">
           <CardContent className="p-4">
             <div className="flex items-start justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">Total Orders</p>
                 <p className="text-2xl font-bold mt-1">{orders.length}</p>
               </div>
               <div className="p-2 rounded-lg bg-secondary/10">
                 <FileText className="w-5 h-5 text-secondary" />
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card className="card-timber">
           <CardContent className="p-4">
             <div className="flex items-start justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">Pending</p>
                 <p className="text-2xl font-bold mt-1">{pendingOrders}</p>
               </div>
               <div className="p-2 rounded-lg bg-yellow-50">
                 <Package className="w-5 h-5 text-status-pending" />
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card className="card-timber">
           <CardContent className="p-4">
             <div className="flex items-start justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">In Cart</p>
                 <p className="text-2xl font-bold mt-1">{cartItemCount}</p>
               </div>
               <div className="p-2 rounded-lg bg-primary/10">
                 <ShoppingCart className="w-5 h-5 text-primary" />
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Quick Actions */}
       <div className="grid md:grid-cols-2 gap-4">
         <Card className="card-timber">
           <CardContent className="p-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-wood flex items-center justify-center">
                 <Package className="w-6 h-6 text-primary-foreground" />
               </div>
               <div className="flex-1">
                 <h3 className="font-semibold">Browse Catalog</h3>
                 <p className="text-sm text-muted-foreground">
                   Explore our premium timber selection
                 </p>
               </div>
               <Button asChild className="btn-wood touch-target">
                 <Link to="/company/catalog">
                   Browse <ArrowRight className="w-4 h-4 ml-2" />
                 </Link>
               </Button>
             </div>
           </CardContent>
         </Card>
 
         {cartItemCount > 0 && (
           <Card className="card-timber border-secondary/30">
             <CardContent className="p-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                   <ShoppingCart className="w-6 h-6 text-secondary-foreground" />
                 </div>
                 <div className="flex-1">
                   <h3 className="font-semibold">Complete Your Order</h3>
                   <p className="text-sm text-muted-foreground">
                     {cartItemCount} items • ${cartTotal.toLocaleString()}
                   </p>
                 </div>
                 <Button asChild className="btn-sienna touch-target">
                   <Link to="/company/cart">
                     Checkout <ArrowRight className="w-4 h-4 ml-2" />
                   </Link>
                 </Button>
               </div>
             </CardContent>
           </Card>
         )}
       </div>
 
       {/* Recent Orders */}
       <Card className="card-timber">
         <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle className="text-lg">Recent Orders</CardTitle>
           <Button variant="ghost" size="sm" asChild>
             <Link to="/company/orders" className="text-secondary">
               View all <ArrowRight className="w-4 h-4 ml-1" />
             </Link>
           </Button>
         </CardHeader>
         <CardContent>
           {orders.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
               <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
               <p>No orders yet</p>
               <Button asChild className="mt-4" variant="outline">
                 <Link to="/company/catalog">Browse Catalog</Link>
               </Button>
             </div>
           ) : (
             <div className="space-y-3">
               {orders.slice(0, 3).map((order) => (
                 <div
                   key={order.id}
                   className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                 >
                   <div>
                     <p className="font-medium">{order.orderNumber}</p>
                     <p className="text-sm text-muted-foreground">
                       {order.items.length} item(s)
                     </p>
                   </div>
                   <div className="text-right">
                     <StatusBadge status={order.status} />
                     <p className="text-sm text-muted-foreground mt-1">
                       ${order.totalAmount.toLocaleString()}
                     </p>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }