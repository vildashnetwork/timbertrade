 import { useEffect, useState } from 'react';
 import { Search, Filter, FileText, Eye, Package } from 'lucide-react';
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
 import { TableRowSkeleton } from '@/components/shared/LoadingSkeleton';
 import { orderService } from '@/services/api';
 import { toast } from 'sonner';
 import type { Order, OrderStatus } from '@/types';
 
 export default function OrdersPage() {
   const [orders, setOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [statusFilter, setStatusFilter] = useState<string>('all');
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
 
   useEffect(() => {
     loadOrders();
   }, []);
 
   const loadOrders = async () => {
     setLoading(true);
     const data = await orderService.getAll();
     setOrders(data);
     setLoading(false);
   };
 
   const filteredOrders = orders.filter((order) => {
     const matchesSearch =
       order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
       order.company.name.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
     return matchesSearch && matchesStatus;
   });
 
   const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
     await orderService.updateStatus(orderId, newStatus);
     toast.success(`Order status updated to ${newStatus}`);
     loadOrders();
     if (selectedOrder?.id === orderId) {
       setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
     }
   };
 
   const formatDate = (dateString: string) => {
     return new Date(dateString).toLocaleDateString('en-US', {
       year: 'numeric',
       month: 'short',
       day: 'numeric',
     });
   };
 
   return (
     <div className="space-y-6 animate-fade-in">
       <PageHeader
         title="Order Management"
         description="Track and manage customer orders"
       />
 
       {/* Filters */}
       <Card className="card-timber">
         <CardContent className="p-4">
           <div className="flex flex-col md:flex-row gap-4">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input
                 placeholder="Search by order number or company..."
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
 
       {/* Table */}
       <Card className="card-timber overflow-hidden">
         <div className="overflow-x-auto">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Order #</TableHead>
                 <TableHead>Company</TableHead>
                 <TableHead>Items</TableHead>
                 <TableHead>Total</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead>Date</TableHead>
                 <TableHead className="text-right">Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                   <TableRowSkeleton key={i} columns={7} />
                 ))
               ) : filteredOrders.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={7}>
                     <EmptyState
                       icon={Package}
                       title="No orders found"
                       description="Orders will appear here when companies place them"
                     />
                   </TableCell>
                 </TableRow>
               ) : (
                 filteredOrders.map((order) => (
                   <TableRow key={order.id}>
                     <TableCell className="font-medium">{order.orderNumber}</TableCell>
                     <TableCell>
                       <div>
                         <p className="font-medium">{order.company.name}</p>
                         <p className="text-sm text-muted-foreground">{order.company.email}</p>
                       </div>
                     </TableCell>
                     <TableCell>{order.items.length} item(s)</TableCell>
                     <TableCell className="font-medium">
                       ${order.totalAmount.toLocaleString()}
                     </TableCell>
                     <TableCell>
                       <StatusBadge status={order.status} />
                     </TableCell>
                     <TableCell className="text-sm text-muted-foreground">
                       {formatDate(order.createdAt)}
                     </TableCell>
                     <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-2">
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={() => setSelectedOrder(order)}
                           className="h-8 w-8"
                         >
                           <Eye className="w-4 h-4" />
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
                 {/* Company Info */}
                 <div className="p-4 bg-muted rounded-lg">
                   <h4 className="font-medium mb-2">Customer</h4>
                   <p className="font-medium">{selectedOrder.company.name}</p>
                   <p className="text-sm text-muted-foreground">{selectedOrder.company.email}</p>
                   <p className="text-sm text-muted-foreground">{selectedOrder.company.address}</p>
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
                         <div>
                           <p className="font-medium">{item.woodItem.species}</p>
                           <p className="text-sm text-muted-foreground">
                             {item.woodItem.origin} • Grade {item.woodItem.grade}
                           </p>
                         </div>
                         <div className="text-right">
                           <p className="font-medium">${item.totalPrice.toLocaleString()}</p>
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
                     <p className="text-sm text-muted-foreground">No documents attached</p>
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
                             Download
                           </Button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
 
                 {/* Status Update */}
                 <div className="pt-4 border-t">
                   <h4 className="font-medium mb-3">Update Status</h4>
                   <div className="flex gap-2 flex-wrap">
                     {(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as OrderStatus[]).map(
                       (status) => (
                         <Button
                           key={status}
                           variant={selectedOrder.status === status ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                           disabled={selectedOrder.status === status}
                           className={selectedOrder.status === status ? 'btn-wood' : ''}
                         >
                           {status}
                         </Button>
                       )
                     )}
                   </div>
                 </div>
               </div>
             </>
           )}
         </DialogContent>
       </Dialog>
     </div>
   );
 }