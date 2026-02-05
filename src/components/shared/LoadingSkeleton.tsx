 import { cn } from '@/lib/utils';
 
 interface LoadingSkeletonProps {
   className?: string;
   count?: number;
 }
 
 export function CardSkeleton({ className }: { className?: string }) {
   return (
     <div className={cn('card-timber p-6 animate-pulse', className)}>
       <div className="skeleton-wood h-40 mb-4 rounded-lg" />
       <div className="skeleton-wood h-5 w-3/4 mb-2 rounded" />
       <div className="skeleton-wood h-4 w-1/2 mb-4 rounded" />
       <div className="flex justify-between items-center">
         <div className="skeleton-wood h-6 w-20 rounded" />
         <div className="skeleton-wood h-10 w-24 rounded-lg" />
       </div>
     </div>
   );
 }
 
 export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
   return (
     <tr className="animate-pulse">
       {Array.from({ length: columns }).map((_, i) => (
         <td key={i} className="px-4 py-3">
           <div className="skeleton-wood h-4 rounded" />
         </td>
       ))}
     </tr>
   );
 }
 
 export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
   return (
     <div className={cn('space-y-4', className)}>
       {Array.from({ length: count }).map((_, i) => (
         <div key={i} className="animate-pulse">
           <div className="skeleton-wood h-4 w-full rounded mb-2" />
           <div className="skeleton-wood h-4 w-3/4 rounded" />
         </div>
       ))}
     </div>
   );
 }
 
 export function CatalogGridSkeleton({ count = 6 }: { count?: number }) {
   return (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {Array.from({ length: count }).map((_, i) => (
         <CardSkeleton key={i} />
       ))}
     </div>
   );
 }