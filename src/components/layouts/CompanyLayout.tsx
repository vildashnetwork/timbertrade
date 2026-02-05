 import { useState } from 'react';
 import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
 import {
   TreePine,
   Home,
   Package,
   ShoppingCart,
   FileText,
   Menu,
   X,
   LogOut,
   User,
   Building2,
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Avatar, AvatarFallback } from '@/components/ui/avatar';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { useAuthStore } from '@/stores/authStore';
 import { useCartStore } from '@/stores/cartStore';
 
 const navItems = [
   { icon: Home, label: 'Dashboard', path: '/company' },
   { icon: Package, label: 'Catalog', path: '/company/catalog' },
   { icon: ShoppingCart, label: 'Cart', path: '/company/cart', showBadge: true },
   { icon: FileText, label: 'Orders', path: '/company/orders' },
 ];
 
 export function CompanyLayout() {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const location = useLocation();
   const navigate = useNavigate();
   const { user, company, logout } = useAuthStore();
   const cartItemCount = useCartStore((state) => state.items.length);
 
   const handleLogout = () => {
     logout();
     navigate('/login');
   };
 
   return (
     <div className="min-h-screen bg-background">
       {/* Mobile Header */}
       <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border px-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
             <TreePine className="w-5 h-5 text-primary-foreground" />
           </div>
           <span className="font-semibold text-foreground">TimberTrade</span>
         </div>
         <div className="flex items-center gap-2">
           <Link to="/company/cart" className="relative p-2">
             <ShoppingCart className="w-6 h-6 text-foreground" />
             {cartItemCount > 0 && (
               <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-secondary">
                 {cartItemCount}
               </Badge>
             )}
           </Link>
           <Button
             variant="ghost"
             size="icon"
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="text-foreground"
           >
             {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </Button>
         </div>
       </header>
 
       {/* Sidebar */}
       <aside
         className={cn(
           'fixed top-0 left-0 z-40 h-full w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out',
           'lg:translate-x-0',
           sidebarOpen ? 'translate-x-0' : '-translate-x-full'
         )}
       >
         {/* Logo */}
         <div className="h-16 px-4 flex items-center gap-3 border-b border-border">
           <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
             <TreePine className="w-5 h-5 text-primary-foreground" />
           </div>
           <div>
             <span className="font-semibold text-foreground">TimberTrade</span>
             <p className="text-xs text-muted-foreground">Company Portal</p>
           </div>
         </div>
 
         {/* Company Info */}
         {company && (
           <div className="p-4 border-b border-border">
             <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
               <Building2 className="w-5 h-5 text-muted-foreground" />
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium truncate">{company.name}</p>
                 <p className="text-xs text-muted-foreground">{company.taxId}</p>
               </div>
             </div>
           </div>
         )}
 
         {/* Navigation */}
         <nav className="p-4 space-y-1">
           {navItems.map((item) => {
             const isActive = location.pathname === item.path ||
               (item.path !== '/company' && location.pathname.startsWith(item.path));
             return (
               <Link
                 key={item.path}
                 to={item.path}
                 onClick={() => setSidebarOpen(false)}
                 className={cn(
                   'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors touch-target',
                   isActive
                     ? 'bg-primary text-primary-foreground'
                     : 'text-foreground hover:bg-muted'
                 )}
               >
                 <item.icon className="w-5 h-5" />
                 <span className="font-medium flex-1">{item.label}</span>
                 {item.showBadge && cartItemCount > 0 && (
                   <Badge 
                     variant={isActive ? 'secondary' : 'default'} 
                     className={cn(
                       'text-xs',
                       isActive ? 'bg-primary-foreground text-primary' : 'bg-secondary text-secondary-foreground'
                     )}
                   >
                     {cartItemCount}
                   </Badge>
                 )}
               </Link>
             );
           })}
         </nav>
 
         {/* User Section */}
         <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                 <Avatar className="w-8 h-8">
                   <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                     {user?.name?.charAt(0) || 'C'}
                   </AvatarFallback>
                 </Avatar>
                 <div className="flex-1 text-left">
                   <p className="text-sm font-medium text-foreground">{user?.name}</p>
                   <p className="text-xs text-muted-foreground">{user?.email}</p>
                 </div>
               </button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-56">
               <DropdownMenuItem>
                 <User className="w-4 h-4 mr-2" />
                 Profile
               </DropdownMenuItem>
               <DropdownMenuItem>
                 <Building2 className="w-4 h-4 mr-2" />
                 Company Settings
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                 <LogOut className="w-4 h-4 mr-2" />
                 Logout
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         </div>
       </aside>
 
       {/* Mobile Overlay */}
       {sidebarOpen && (
         <div
           className="lg:hidden fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm"
           onClick={() => setSidebarOpen(false)}
         />
       )}
 
       {/* Main Content */}
       <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
         <div className="p-4 md:p-6 lg:p-8">
           <Outlet />
         </div>
       </main>
 
       {/* Mobile Bottom Navigation */}
       <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-card border-t border-border flex items-center justify-around px-2">
         {navItems.map((item) => {
           const isActive = location.pathname === item.path ||
             (item.path !== '/company' && location.pathname.startsWith(item.path));
           return (
             <Link
               key={item.path}
               to={item.path}
               className={cn(
                 'flex flex-col items-center justify-center gap-1 p-2 min-w-[60px] touch-target',
                 isActive ? 'text-secondary' : 'text-muted-foreground'
               )}
             >
               <div className="relative">
                 <item.icon className="w-6 h-6" />
                 {item.showBadge && cartItemCount > 0 && (
                   <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-secondary">
                     {cartItemCount}
                   </Badge>
                 )}
               </div>
               <span className="text-xs font-medium">{item.label}</span>
             </Link>
           );
         })}
       </nav>
     </div>
   );
 }