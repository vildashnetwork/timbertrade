 import { useEffect, useState } from 'react';
 import { Link } from 'react-router-dom';
 import { Search, Filter, TreePine, LogIn, UserPlus } from 'lucide-react';
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
 import { StatusBadge } from '@/components/shared/StatusBadge';
 import { CatalogGridSkeleton } from '@/components/shared/LoadingSkeleton';
 import { woodService } from '@/services/api';
 import { useAuthStore } from '@/stores/authStore';
 import type { WoodItem } from '@/types';
 
 export default function PublicCatalog() {
   const [items, setItems] = useState<WoodItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [gradeFilter, setGradeFilter] = useState<string>('all');
 
   const { isAuthenticated, user } = useAuthStore();
 
   useEffect(() => {
     loadItems();
   }, []);
 
   const loadItems = async () => {
     setLoading(true);
     const data = await woodService.getAll();
     setItems(data);
     setLoading(false);
   };
 
   const filteredItems = items.filter((item) => {
     const matchesSearch =
       item.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.origin.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesGrade = gradeFilter === 'all' || item.grade === gradeFilter;
     return matchesSearch && matchesGrade;
   });
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="bg-gradient-wood text-primary-foreground">
         <div className="container mx-auto px-4 py-4">
           <div className="flex items-center justify-between">
             <Link to="/" className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                 <TreePine className="w-6 h-6" />
               </div>
               <div>
                 <h1 className="font-bold text-lg">TimberTrade</h1>
                 <p className="text-xs opacity-80">Cameroon Wood Export</p>
               </div>
             </Link>
 
             <div className="flex items-center gap-3">
               {isAuthenticated ? (
                 <Button asChild variant="secondary" className="touch-target">
                   <Link to={user?.role === 'SUPER_ADMIN' ? '/admin' : '/company'}>
                     Dashboard
                   </Link>
                 </Button>
               ) : (
                 <>
                   <Button asChild variant="ghost" className="text-primary-foreground touch-target">
                     <Link to="/login">
                       <LogIn className="w-4 h-4 mr-2" />
                       Login
                     </Link>
                   </Button>
                   <Button asChild variant="secondary" className="touch-target">
                     <Link to="/register">
                       <UserPlus className="w-4 h-4 mr-2" />
                       Register
                     </Link>
                   </Button>
                 </>
               )}
             </div>
           </div>
         </div>
       </header>
 
       {/* Hero Section */}
       <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
         <div className="container mx-auto px-4 text-center">
           <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
             Premium Cameroon Timber
           </h2>
           <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
             Explore our curated selection of high-quality African hardwoods.
             Sustainably sourced from Cameroon's finest forests.
           </p>
 
           {/* Search & Filter */}
           <div className="max-w-2xl mx-auto">
             <Card className="card-timber">
               <CardContent className="p-4">
                 <div className="flex flex-col md:flex-row gap-4">
                   <div className="relative flex-1">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <Input
                       placeholder="Search by species or origin..."
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="pl-10"
                     />
                   </div>
                   <Select value={gradeFilter} onValueChange={setGradeFilter}>
                     <SelectTrigger className="w-full md:w-40">
                       <Filter className="w-4 h-4 mr-2" />
                       <SelectValue placeholder="All Grades" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">All Grades</SelectItem>
                       <SelectItem value="A">Grade A</SelectItem>
                       <SelectItem value="B">Grade B</SelectItem>
                       <SelectItem value="C">Grade C</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </CardContent>
             </Card>
           </div>
         </div>
       </section>
 
       {/* Catalog Grid */}
       <section className="container mx-auto px-4 py-8">
         {loading ? (
           <CatalogGridSkeleton count={6} />
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredItems.map((item) => (
               <Card key={item.id} className="card-timber overflow-hidden">
                 {/* Image */}
                 <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 relative">
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                       <span className="text-3xl font-bold text-primary/40">
                         {item.species.charAt(0)}
                       </span>
                     </div>
                   </div>
                   <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                     Grade {item.grade}
                   </Badge>
                   <div className="absolute top-3 right-3">
                     <StatusBadge status={item.status} />
                   </div>
                 </div>
 
                 <CardContent className="p-4">
                   <h3 className="text-lg font-semibold text-foreground">
                     {item.species}
                   </h3>
                   <p className="text-sm text-muted-foreground mb-2">
                     {item.origin}
                   </p>
                   <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                     <span>{item.dimensions}</span>
                     <span>•</span>
                     <span>{item.stockLevel} CBM available</span>
                   </div>
                   <div className="flex items-baseline gap-1 mb-4">
                     <span className="text-2xl font-bold text-foreground">
                       ${item.price.toLocaleString()}
                     </span>
                     <span className="text-sm text-muted-foreground">/CBM</span>
                   </div>
 
                   <Button asChild className="w-full btn-wood touch-target">
                     <Link to="/login">Login to Order</Link>
                   </Button>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
 
         {!loading && filteredItems.length === 0 && (
           <div className="text-center py-12">
             <p className="text-muted-foreground">No items match your search</p>
           </div>
         )}
       </section>
 
       {/* Footer */}
       <footer className="bg-primary text-primary-foreground py-8 mt-12">
         <div className="container mx-auto px-4 text-center">
           <div className="flex items-center justify-center gap-2 mb-4">
             <TreePine className="w-6 h-6" />
             <span className="font-bold text-lg">TimberTrade</span>
           </div>
           <p className="text-sm opacity-80">
             Premium Cameroon timber for global markets.
           </p>
           <p className="text-xs opacity-60 mt-2">
             © 2024 TimberTrade. All rights reserved.
           </p>
         </div>
       </footer>
     </div>
   );
 }