 import { useEffect, useState } from 'react';
 import { Search, Filter, ShoppingCart, Plus, Minus, Check } from 'lucide-react';
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
 import { PageHeader } from '@/components/shared/PageHeader';
 import { StatusBadge } from '@/components/shared/StatusBadge';
 import { CatalogGridSkeleton } from '@/components/shared/LoadingSkeleton';
 import { woodService } from '@/services/api';
 import { useCartStore } from '@/stores/cartStore';
 import { useAuthStore } from '@/stores/authStore';
 import { toast } from 'sonner';
 import type { WoodItem } from '@/types';
 
 export default function CatalogPage() {
   const [items, setItems] = useState<WoodItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [gradeFilter, setGradeFilter] = useState<string>('all');
   const [quantities, setQuantities] = useState<Record<string, number>>({});
 
   const { company } = useAuthStore();
   const { addItem, items: cartItems } = useCartStore();
 
   const isApproved = company?.status === 'APPROVED';
 
   useEffect(() => {
     loadItems();
   }, []);
 
   const loadItems = async () => {
     setLoading(true);
     const data = await woodService.getAll();
     setItems(data);
     // Initialize quantities
     const initialQuantities: Record<string, number> = {};
     data.forEach((item) => {
       initialQuantities[item.id] = 1;
     });
     setQuantities(initialQuantities);
     setLoading(false);
   };
 
   const filteredItems = items.filter((item) => {
     const matchesSearch =
       item.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.origin.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesGrade = gradeFilter === 'all' || item.grade === gradeFilter;
     return matchesSearch && matchesGrade;
   });
 
   const updateQuantity = (id: string, delta: number) => {
     setQuantities((prev) => ({
       ...prev,
       [id]: Math.max(1, Math.min((prev[id] || 1) + delta, 100)),
     }));
   };
 
   const handleAddToCart = (item: WoodItem) => {
     if (!isApproved) {
       toast.error('Your company must be approved to add items to cart');
       return;
     }
     const quantity = quantities[item.id] || 1;
     addItem(item, quantity);
     toast.success(`Added ${quantity} CBM of ${item.species} to cart`);
   };
 
   const isInCart = (itemId: string) => {
     return cartItems.some((ci) => ci.woodItem.id === itemId);
   };
 
   return (
     <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
       <PageHeader
         title="Wood Catalog"
         description="Browse our premium timber selection"
       />
 
       {/* Filters */}
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
 
       {/* Product Grid */}
       {loading ? (
         <CatalogGridSkeleton count={6} />
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredItems.map((item) => (
             <Card key={item.id} className="card-timber overflow-hidden group">
               {/* Image */}
               <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                     <span className="text-3xl font-bold text-primary/40">
                       {item.species.charAt(0)}
                     </span>
                   </div>
                 </div>
                 {/* Grade Badge */}
                 <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                   Grade {item.grade}
                 </Badge>
                 {/* Stock Status */}
                 <div className="absolute top-3 right-3">
                   <StatusBadge status={item.status} />
                 </div>
               </div>
 
               <CardContent className="p-4">
                 {/* Species & Origin */}
                 <h3 className="text-lg font-semibold text-foreground">
                   {item.species}
                 </h3>
                 <p className="text-sm text-muted-foreground mb-2">
                   {item.origin}
                 </p>
 
                 {/* Details */}
                 <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                   <span>{item.dimensions}</span>
                   <span>•</span>
                   <span>{item.stockLevel} CBM available</span>
                 </div>
 
                 {/* Price */}
                 <div className="flex items-baseline gap-1 mb-4">
                   <span className="text-2xl font-bold text-foreground">
                     ${item.price.toLocaleString()}
                   </span>
                   <span className="text-sm text-muted-foreground">/CBM</span>
                 </div>
 
                 {/* Quantity & Add to Cart */}
                 <div className="flex items-center gap-3">
                   <div className="flex items-center border rounded-lg">
                     <button
                       onClick={() => updateQuantity(item.id, -1)}
                       className="p-2 hover:bg-muted transition-colors touch-target"
                       disabled={!isApproved}
                     >
                       <Minus className="w-4 h-4" />
                     </button>
                     <span className="w-12 text-center font-medium">
                       {quantities[item.id] || 1}
                     </span>
                     <button
                       onClick={() => updateQuantity(item.id, 1)}
                       className="p-2 hover:bg-muted transition-colors touch-target"
                       disabled={!isApproved}
                     >
                       <Plus className="w-4 h-4" />
                     </button>
                   </div>
 
                   <Button
                     onClick={() => handleAddToCart(item)}
                     disabled={item.status === 'OUT_OF_STOCK' || !isApproved}
                     className={`flex-1 touch-target ${isInCart(item.id) ? 'bg-accent hover:bg-accent/90' : 'btn-wood'}`}
                   >
                     {isInCart(item.id) ? (
                       <>
                         <Check className="w-4 h-4 mr-2" />
                         In Cart
                       </>
                     ) : (
                       <>
                         <ShoppingCart className="w-4 h-4 mr-2" />
                         Add
                       </>
                     )}
                   </Button>
                 </div>
 
                 {!isApproved && (
                   <p className="text-xs text-muted-foreground mt-2 text-center">
                     Approval required to order
                   </p>
                 )}
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
     </div>
   );
 }