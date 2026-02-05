 import { useEffect, useState } from 'react';
 import { Search, Filter, FileText, Eye, Package, Download } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Card, CardContent } from '@/components/ui/card';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { PageHeader } from '@/components/shared/PageHeader';
 import { StatusBadge } from '@/components/shared/StatusBadge';
 import { EmptyState } from '@/components/shared/EmptyState';
 import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
 import { useAuthStore } from '@/stores/authStore';
 import { orderService } from '@/services/api';
 import type { Order } from '@/types';
 
 export default function CompanyOrdersPage() {
   const { company } = useAuthStore();
   const [orders, setOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [statusFilter, setStatusFilter] = useState<string>('all');
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
 
   useEffect(() => {
     loadOrders();
   }, [company]);
 
   const loadOrders = async () => {
     if (!company) return;
     setLoading(true);
     const data = await orderService.getByCompany(company.id);
     setOrders(data);
     setLoading(false);
   };
 
   const filteredOrders = orders.filter((order) => {
     const matchesSearch = order.orderNumber
       .toLowerCase()
       .includes(searchQuery.toLowerCase());
     const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
     return matchesSearch && matchesStatus;
   });
 
   const formatDate = (dateString: string) => {
     return new Date(dateString).toLocaleDateString('en-US', {
       year: 'numeric',
       month: 'short',
       day: 'numeric',
     });
   };
 
   return (
     <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
       <PageHeader
         title="My Orders"
         description="Track your order history and status"
       />
 
       {/* Filters */}
       <Card className="card-timber">
         <CardContent className="p-4">
           <div className="flex flex-col md:flex-row gap-4">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input
                 placeholder="Search by order number..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-10"
               />
             </div>
             <Select value={statusFilter} onValueChange={setStatusFilter}>
               <SelectTrigger className="w-full md:w-40">
                 <Filter className="w-4 h-4 mr-2" />
                 <SelectValue placeholder="All Status" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Status</SelectItem>
                 <SelectItem value="PENDING">Pending</SelectItem>
                 <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                 <SelectItem value="SHIPPED">Shipped</SelectItem>
                 <SelectItem value="DELIVERED">Delivered</SelectItem>
               </SelectContent>
             </Select>
           </div>
         </CardContent>
       </Card>
 
       {/* Orders List */}
       {loading ? (
         <Card className="card-timber">
           <CardContent className="p-6">
             <LoadingSkeleton count={3} />
           </CardContent>
         </Card>
       ) : filteredOrders.length === 0 ? (
         <Card className="card-timber">
           <CardContent className="py-8">
             <EmptyState
               icon={Package}
               title="No orders found"
               description="Your orders will appear here once you place them"
             />
           </CardContent>
         </Card>
       ) : (
         <div className="space-y-4">
           {filteredOrders.map((order) => (
             <Card key={order.id} className="card-timber">
               <CardContent className="p-4">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                       <h3 className="font-semibold">{order.orderNumber}</h3>
                       <StatusBadge status={order.status} />
                     </div>
                     <p className="text-sm text-muted-foreground">
                       {order.items.length} item(s) • Placed on{' '}
                       {formatDate(order.createdAt)}
                     </p>
                   </div>
 
                   <div className="flex items-center gap-4">
                     <div className="text-right">
                       <p className="text-lg font-semibold">
                         ${order.totalAmount.toLocaleString()}
                       </p>
                       {order.documents.length > 0 && (
                         <p className="text-xs text-muted-foreground">
                           {order.documents.length} document(s)
                         </p>
                       )}
                     </div>
                     <Button
                       variant="outline"
                       onClick={() => setSelectedOrder(order)}
                       className="touch-target"
                     >
                       <Eye className="w-4 h-4 mr-2" />
                       Details
                     </Button>
                   </div>
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>
       )}
 
       {/* Order Detail Dialog */}
       <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
           {selectedOrder && (
             <>
               <DialogHeader>
                 <DialogTitle className="flex items-center gap-2">
                   Order {selectedOrder.orderNumber}
                   <StatusBadge status={selectedOrder.status} />
                 </DialogTitle>
               </DialogHeader>
 
               <div className="space-y-6 mt-4">
                 {/* Order Timeline */}
                 <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                   {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map(
                     (status, index) => {
                       const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
                       const currentIndex = statusOrder.indexOf(selectedOrder.status);
                       const isCompleted = index <= currentIndex;
                       const isCurrent = index === currentIndex;
 
                       return (
                         <div key={status} className="flex items-center">
                           <div
                             className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                               isCompleted
                                 ? 'bg-accent text-accent-foreground'
                                 : 'bg-border text-muted-foreground'
                             } ${isCurrent ? 'ring-2 ring-accent ring-offset-2' : ''}`}
                           >
                             {index + 1}
                           </div>
                           <span
                             className={`hidden md:block ml-2 text-xs ${
                               isCompleted ? 'text-foreground' : 'text-muted-foreground'
                             }`}
                           >
                             {status.charAt(0) + status.slice(1).toLowerCase()}
                           </span>
                           {index < 3 && (
                             <div
                               className={`w-8 md:w-16 h-0.5 mx-2 ${
                                 index < currentIndex ? 'bg-accent' : 'bg-border'
                               }`}
                             />
                           )}
                         </div>
                       );
                     }
                   )}
                 </div>
 
                 {/* Items */}
                 <div>
                   <h4 className="font-medium mb-3">Order Items</h4>
                   <div className="space-y-2">
                     {selectedOrder.items.map((item) => (
                       <div
                         key={item.id}
                         className="flex items-center justify-between p-3 border rounded-lg"
                       >
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                             <span className="text-sm font-bold text-primary/60">
                               {item.woodItem.species.charAt(0)}
                             </span>
                           </div>
                           <div>
                             <p className="font-medium">{item.woodItem.species}</p>
                             <p className="text-sm text-muted-foreground">
                               {item.woodItem.origin} • Grade {item.woodItem.grade}
                             </p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="font-medium">
                             ${item.totalPrice.toLocaleString()}
                           </p>
                           <p className="text-sm text-muted-foreground">
                             {item.quantity} CBM × ${item.unitPrice}
                           </p>
                         </div>
                       </div>
                     ))}
                   </div>
                   <div className="mt-4 pt-4 border-t flex justify-between items-center">
                     <span className="font-medium">Total Amount</span>
                     <span className="text-xl font-bold">
                       ${selectedOrder.totalAmount.toLocaleString()}
                     </span>
                   </div>
                 </div>
 
                 {/* Documents */}
                 <div>
                   <h4 className="font-medium mb-3">Documents</h4>
                   {selectedOrder.documents.length === 0 ? (
                     <p className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                       Documents will be available once the order is confirmed
                     </p>
                   ) : (
                     <div className="space-y-2">
                       {selectedOrder.documents.map((doc) => (
                         <div
                           key={doc.id}
                           className="flex items-center gap-3 p-3 border rounded-lg"
                         >
                           <FileText className="w-5 h-5 text-muted-foreground" />
                           <div className="flex-1">
                             <p className="font-medium">{doc.name}</p>
                             <p className="text-xs text-muted-foreground">
                               {doc.type.replace(/_/g, ' ')}
                             </p>
                           </div>
                           <Button variant="outline" size="sm">
                             <Download className="w-4 h-4 mr-2" />
                             Download
                           </Button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
             </>
           )}
         </DialogContent>
       </Dialog>
     </div>
   );
 }