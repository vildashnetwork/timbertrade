 import { Badge } from '@/components/ui/badge';
 import { cn } from '@/lib/utils';
 import type { CompanyStatus, OrderStatus, WoodItem } from '@/types';
 
 interface StatusBadgeProps {
   status: CompanyStatus | OrderStatus | WoodItem['status'];
   className?: string;
 }
 
 const statusConfig: Record<string, { label: string; className: string }> = {
   // Company Status
   PENDING: { label: 'Pending', className: 'badge-pending' },
   APPROVED: { label: 'Approved', className: 'badge-approved' },
   SUSPENDED: { label: 'Suspended', className: 'badge-suspended' },
   
   // Order Status
   CONFIRMED: { label: 'Confirmed', className: 'badge-approved' },
   SHIPPED: { label: 'Shipped', className: 'badge-shipped' },
   DELIVERED: { label: 'Delivered', className: 'badge-approved' },
   CANCELLED: { label: 'Cancelled', className: 'badge-suspended' },
   
   // Wood Status
   AVAILABLE: { label: 'In Stock', className: 'badge-approved' },
   LOW_STOCK: { label: 'Low Stock', className: 'badge-pending' },
   OUT_OF_STOCK: { label: 'Out of Stock', className: 'badge-suspended' },
 };
 
 export function StatusBadge({ status, className }: StatusBadgeProps) {
   const config = statusConfig[status] || { label: status, className: '' };
   
   return (
     <Badge 
       variant="outline" 
       className={cn('font-medium border', config.className, className)}
     >
       {config.label}
     </Badge>
   );
 }