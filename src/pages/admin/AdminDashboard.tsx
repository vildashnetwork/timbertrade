 import { useEffect, useState } from 'react';
 import { Link } from 'react-router-dom';
 import {
   Package,
   ShoppingCart,
   Building2,
   TrendingUp,
   AlertTriangle,
   Clock,
   ArrowRight,
 } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { PageHeader } from '@/components/shared/PageHeader';
 import { StatusBadge } from '@/components/shared/StatusBadge';
 import { statsService, MOCK_ORDERS, MOCK_COMPANIES } from '@/services/api';
 import type { DashboardStats } from '@/types';
 
 export default function AdminDashboard() {
   const [stats, setStats] = useState<DashboardStats | null>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     const loadStats = async () => {
       const data = await statsService.getDashboardStats();
       setStats(data);
       setLoading(false);
     };
     loadStats();
   }, []);
 
   const statCards = [
     {
       title: 'Total Revenue',
       value: stats ? `$${stats.totalRevenue.toLocaleString()}` : '-',
       icon: TrendingUp,
       color: 'text-accent',
       bgColor: 'bg-accent/10',
     },
     {
       title: 'Pending Orders',
       value: stats?.pendingOrders ?? '-',
       icon: ShoppingCart,
       color: 'text-status-pending',
       bgColor: 'bg-yellow-50',
     },
     {
       title: 'Pending KYB',
       value: stats?.pendingKYB ?? '-',
       icon: Building2,
       color: 'text-secondary',
       bgColor: 'bg-secondary/10',
     },
     {
       title: 'Low Stock Items',
       value: stats?.lowStockItems ?? '-',
       icon: AlertTriangle,
       color: 'text-destructive',
       bgColor: 'bg-destructive/10',
     },
   ];
 
   const recentOrders = MOCK_ORDERS.slice(0, 3);
   const pendingCompanies = MOCK_COMPANIES.filter(c => c.status === 'PENDING');
 
   return (
     <div className="space-y-6 animate-fade-in">
       <PageHeader
         title="Dashboard"
         description="Overview of your timber trading operations"
       />
 
       {/* Stats Grid */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {statCards.map((stat) => (
           <Card key={stat.title} className="card-timber">
             <CardContent className="p-4 md:p-6">
               <div className="flex items-start justify-between">
                 <div>
                   <p className="text-sm text-muted-foreground">{stat.title}</p>
                   <p className="text-2xl md:text-3xl font-bold mt-1">
                     {loading ? (
                       <span className="skeleton-wood inline-block w-16 h-8 rounded" />
                     ) : (
                       stat.value
                     )}
                   </p>
                 </div>
                 <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                   <stat.icon className={`w-5 h-5 ${stat.color}`} />
                 </div>
               </div>
             </CardContent>
           </Card>
         ))}
       </div>
 
       <div className="grid lg:grid-cols-2 gap-6">
         {/* Recent Orders */}
         <Card className="card-timber">
           <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle className="text-lg">Recent Orders</CardTitle>
             <Button variant="ghost" size="sm" asChild>
               <Link to="/admin/orders" className="text-secondary">
                 View all <ArrowRight className="w-4 h-4 ml-1" />
               </Link>
             </Button>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {recentOrders.map((order) => (
                 <div
                   key={order.id}
                   className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                 >
                   <div>
                     <p className="font-medium">{order.orderNumber}</p>
                     <p className="text-sm text-muted-foreground">
                       {order.company.name}
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
           </CardContent>
         </Card>
 
         {/* Pending KYB */}
         <Card className="card-timber">
           <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle className="text-lg">Pending KYB Approvals</CardTitle>
             <Button variant="ghost" size="sm" asChild>
               <Link to="/admin/kyb" className="text-secondary">
                 View all <ArrowRight className="w-4 h-4 ml-1" />
               </Link>
             </Button>
           </CardHeader>
           <CardContent>
             {pendingCompanies.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground">
                 <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                 <p>No pending approvals</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {pendingCompanies.map((company) => (
                   <div
                     key={company.id}
                     className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                   >
                     <div>
                       <p className="font-medium">{company.name}</p>
                       <p className="text-sm text-muted-foreground">
                         {company.taxId}
                       </p>
                     </div>
                     <div className="flex items-center gap-2">
                       <StatusBadge status={company.status} />
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }