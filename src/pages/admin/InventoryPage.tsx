 import { useEffect, useState } from 'react';
 import {
   Plus,
   Search,
   Filter,
   Edit2,
   Trash2,
   Package,
 } from 'lucide-react';
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
   DialogTrigger,
 } from '@/components/ui/dialog';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { PageHeader } from '@/components/shared/PageHeader';
 import { StatusBadge } from '@/components/shared/StatusBadge';
 import { EmptyState } from '@/components/shared/EmptyState';
 import { TableRowSkeleton } from '@/components/shared/LoadingSkeleton';
 import { woodService } from '@/services/api';
 import { toast } from 'sonner';
 import type { WoodItem, WoodGrade } from '@/types';
 
 export default function InventoryPage() {
   const [items, setItems] = useState<WoodItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [gradeFilter, setGradeFilter] = useState<string>('all');
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<WoodItem | null>(null);
 
   const [formData, setFormData] = useState({
     species: '',
     origin: '',
     grade: 'B' as WoodGrade,
     volume: 0,
     price: 0,
     stockLevel: 0,
     dimensions: '',
     description: '',
   });
 
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
 
   const handleOpenDialog = (item?: WoodItem) => {
     if (item) {
       setEditingItem(item);
       setFormData({
         species: item.species,
         origin: item.origin,
         grade: item.grade,
         volume: item.volume,
         price: item.price,
         stockLevel: item.stockLevel,
         dimensions: item.dimensions,
         description: item.description || '',
       });
     } else {
       setEditingItem(null);
       setFormData({
         species: '',
         origin: '',
         grade: 'B',
         volume: 0,
         price: 0,
         stockLevel: 0,
         dimensions: '',
         description: '',
       });
     }
     setDialogOpen(true);
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (editingItem) {
       await woodService.update(editingItem.id, formData);
       toast.success('Item updated successfully');
     } else {
       await woodService.create(formData);
       toast.success('Item added successfully');
     }
     
     setDialogOpen(false);
     loadItems();
   };
 
   const handleDelete = async (id: string) => {
     if (confirm('Are you sure you want to delete this item?')) {
       await woodService.delete(id);
       toast.success('Item deleted');
       loadItems();
     }
   };
 
   return (
     <div className="space-y-6 animate-fade-in">
       <PageHeader
         title="Wood Inventory"
         description="Manage your timber stock and pricing"
       >
         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
           <DialogTrigger asChild>
             <Button className="btn-wood touch-target" onClick={() => handleOpenDialog()}>
               <Plus className="w-4 h-4 mr-2" />
               Add Item
             </Button>
           </DialogTrigger>
           <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>
                 {editingItem ? 'Edit Wood Item' : 'Add New Wood Item'}
               </DialogTitle>
             </DialogHeader>
             <form onSubmit={handleSubmit} className="space-y-4 mt-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="species">Species</Label>
                   <Input
                     id="species"
                     value={formData.species}
                     onChange={(e) =>
                       setFormData({ ...formData, species: e.target.value })
                     }
                     placeholder="e.g., Sapelli"
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="origin">Origin</Label>
                   <Input
                     id="origin"
                     value={formData.origin}
                     onChange={(e) =>
                       setFormData({ ...formData, origin: e.target.value })
                     }
                     placeholder="e.g., East Region"
                     required
                   />
                 </div>
               </div>
 
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="grade">Grade</Label>
                   <Select
                     value={formData.grade}
                     onValueChange={(v) =>
                       setFormData({ ...formData, grade: v as WoodGrade })
                     }
                   >
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="A">Grade A</SelectItem>
                       <SelectItem value="B">Grade B</SelectItem>
                       <SelectItem value="C">Grade C</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="dimensions">Dimensions</Label>
                   <Input
                     id="dimensions"
                     value={formData.dimensions}
                     onChange={(e) =>
                       setFormData({ ...formData, dimensions: e.target.value })
                     }
                     placeholder="e.g., 4m x 0.5m x 0.5m"
                     required
                   />
                 </div>
               </div>
 
               <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="volume">Volume (CBM)</Label>
                   <Input
                     id="volume"
                     type="number"
                     value={formData.volume}
                     onChange={(e) =>
                       setFormData({ ...formData, volume: Number(e.target.value) })
                     }
                     min={0}
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="price">Price ($/CBM)</Label>
                   <Input
                     id="price"
                     type="number"
                     value={formData.price}
                     onChange={(e) =>
                       setFormData({ ...formData, price: Number(e.target.value) })
                     }
                     min={0}
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="stockLevel">Stock Level</Label>
                   <Input
                     id="stockLevel"
                     type="number"
                     value={formData.stockLevel}
                     onChange={(e) =>
                       setFormData({ ...formData, stockLevel: Number(e.target.value) })
                     }
                     min={0}
                     required
                   />
                 </div>
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="description">Description</Label>
                 <Textarea
                   id="description"
                   value={formData.description}
                   onChange={(e) =>
                     setFormData({ ...formData, description: e.target.value })
                   }
                   placeholder="Optional description..."
                   rows={3}
                 />
               </div>
 
               <div className="flex gap-3 pt-4">
                 <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                   Cancel
                 </Button>
                 <Button type="submit" className="flex-1 btn-wood">
                   {editingItem ? 'Update' : 'Add Item'}
                 </Button>
               </div>
             </form>
           </DialogContent>
         </Dialog>
       </PageHeader>
 
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
 
       {/* Table */}
       <Card className="card-timber overflow-hidden">
         <div className="overflow-x-auto">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Species</TableHead>
                 <TableHead>Origin</TableHead>
                 <TableHead>Grade</TableHead>
                 <TableHead>Dimensions</TableHead>
                 <TableHead>Price ($/CBM)</TableHead>
                 <TableHead>Stock</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead className="text-right">Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                   <TableRowSkeleton key={i} columns={8} />
                 ))
               ) : filteredItems.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={8}>
                     <EmptyState
                       icon={Package}
                       title="No items found"
                       description="Add your first wood item to get started"
                       action={
                         <Button onClick={() => handleOpenDialog()} className="btn-wood">
                           <Plus className="w-4 h-4 mr-2" />
                           Add Item
                         </Button>
                       }
                     />
                   </TableCell>
                 </TableRow>
               ) : (
                 filteredItems.map((item) => (
                   <TableRow key={item.id}>
                     <TableCell className="font-medium">{item.species}</TableCell>
                     <TableCell>{item.origin}</TableCell>
                     <TableCell>
                       <span className="px-2 py-1 bg-muted rounded text-sm font-medium">
                         {item.grade}
                       </span>
                     </TableCell>
                     <TableCell className="text-sm">{item.dimensions}</TableCell>
                     <TableCell>${item.price.toLocaleString()}</TableCell>
                     <TableCell>{item.stockLevel} CBM</TableCell>
                     <TableCell>
                       <StatusBadge status={item.status} />
                     </TableCell>
                     <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-2">
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={() => handleOpenDialog(item)}
                           className="h-8 w-8"
                         >
                           <Edit2 className="w-4 h-4" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={() => handleDelete(item.id)}
                           className="h-8 w-8 text-destructive hover:text-destructive"
                         >
                           <Trash2 className="w-4 h-4" />
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
     </div>
   );
 }