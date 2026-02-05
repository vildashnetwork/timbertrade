 import { useEffect, useState } from 'react';
 import { Search, Filter, Building2, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
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
 import { companyService } from '@/services/api';
 import { toast } from 'sonner';
 import type { Company, CompanyStatus } from '@/types';
 
 export default function KYBPage() {
   const [companies, setCompanies] = useState<Company[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [statusFilter, setStatusFilter] = useState<string>('all');
   const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
 
   useEffect(() => {
     loadCompanies();
   }, []);
 
   const loadCompanies = async () => {
     setLoading(true);
     const data = await companyService.getAll();
     setCompanies(data);
     setLoading(false);
   };
 
   const filteredCompanies = companies.filter((company) => {
     const matchesSearch =
       company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       company.taxId.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
     return matchesSearch && matchesStatus;
   });
 
   const handleStatusUpdate = async (companyId: string, newStatus: CompanyStatus) => {
     await companyService.updateStatus(companyId, newStatus);
     toast.success(`Company status updated to ${newStatus}`);
     loadCompanies();
     setSelectedCompany(null);
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
         title="KYB Management"
         description="Review and approve company registrations"
       />
 
       {/* Filters */}
       <Card className="card-timber">
         <CardContent className="p-4">
           <div className="flex flex-col md:flex-row gap-4">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input
                 placeholder="Search by company name or Tax ID..."
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
                 <SelectItem value="APPROVED">Approved</SelectItem>
                 <SelectItem value="SUSPENDED">Suspended</SelectItem>
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
                 <TableHead>Company</TableHead>
                 <TableHead>Tax ID (NIU)</TableHead>
                 <TableHead>Director</TableHead>
                 <TableHead>Documents</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead>Applied</TableHead>
                 <TableHead className="text-right">Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                   <TableRowSkeleton key={i} columns={7} />
                 ))
               ) : filteredCompanies.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={7}>
                     <EmptyState
                       icon={Building2}
                       title="No companies found"
                       description="Companies will appear here when they register"
                     />
                   </TableCell>
                 </TableRow>
               ) : (
                 filteredCompanies.map((company) => (
                   <TableRow key={company.id}>
                     <TableCell>
                       <div>
                         <p className="font-medium">{company.name}</p>
                         <p className="text-sm text-muted-foreground">{company.email}</p>
                       </div>
                     </TableCell>
                     <TableCell className="font-mono text-sm">{company.taxId}</TableCell>
                     <TableCell>
                       <div>
                         <p className="font-medium">{company.directorName}</p>
                         <p className="text-sm text-muted-foreground">{company.directorEmail}</p>
                       </div>
                     </TableCell>
                     <TableCell>
                       <span className="text-sm">
                         {company.kybDocs.length} document(s)
                       </span>
                     </TableCell>
                     <TableCell>
                       <StatusBadge status={company.status} />
                     </TableCell>
                     <TableCell className="text-sm text-muted-foreground">
                       {formatDate(company.createdAt)}
                     </TableCell>
                     <TableCell className="text-right">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => setSelectedCompany(company)}
                       >
                         Review
                       </Button>
                     </TableCell>
                   </TableRow>
                 ))
               )}
             </TableBody>
           </Table>
         </div>
       </Card>
 
       {/* Company Detail Dialog */}
       <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
           {selectedCompany && (
             <>
               <DialogHeader>
                 <DialogTitle className="flex items-center gap-2">
                   {selectedCompany.name}
                   <StatusBadge status={selectedCompany.status} />
                 </DialogTitle>
               </DialogHeader>
 
               <div className="space-y-6 mt-4">
                 {/* Company Info */}
                 <div className="grid md:grid-cols-2 gap-4">
                   <div className="p-4 bg-muted rounded-lg">
                     <h4 className="font-medium mb-2">Company Details</h4>
                     <div className="space-y-1 text-sm">
                       <p><span className="text-muted-foreground">Name:</span> {selectedCompany.name}</p>
                       <p><span className="text-muted-foreground">Tax ID (NIU):</span> {selectedCompany.taxId}</p>
                       <p><span className="text-muted-foreground">Email:</span> {selectedCompany.email}</p>
                       <p><span className="text-muted-foreground">Phone:</span> {selectedCompany.phone}</p>
                       <p><span className="text-muted-foreground">Address:</span> {selectedCompany.address}</p>
                     </div>
                   </div>
                   <div className="p-4 bg-muted rounded-lg">
                     <h4 className="font-medium mb-2">Director</h4>
                     <div className="space-y-1 text-sm">
                       <p><span className="text-muted-foreground">Name:</span> {selectedCompany.directorName}</p>
                       <p><span className="text-muted-foreground">Email:</span> {selectedCompany.directorEmail}</p>
                     </div>
                   </div>
                 </div>
 
                 {/* Documents */}
                 <div>
                   <h4 className="font-medium mb-3">KYB Documents</h4>
                   {selectedCompany.kybDocs.length === 0 ? (
                     <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                       <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                       <p>No documents uploaded</p>
                     </div>
                   ) : (
                     <div className="space-y-2">
                       {selectedCompany.kybDocs.map((doc) => (
                         <div
                           key={doc.id}
                           className="flex items-center gap-3 p-3 border rounded-lg"
                         >
                           <FileText className="w-5 h-5 text-muted-foreground" />
                           <div className="flex-1">
                             <p className="font-medium">{doc.name}</p>
                             <p className="text-xs text-muted-foreground">
                               {doc.type.replace(/_/g, ' ')} • Uploaded {formatDate(doc.uploadedAt)}
                             </p>
                           </div>
                           <Button variant="outline" size="sm">
                             View
                           </Button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
 
                 {/* Actions */}
                 <div className="pt-4 border-t">
                   <h4 className="font-medium mb-3">Actions</h4>
                   <div className="flex gap-3 flex-wrap">
                     <Button
                       onClick={() => handleStatusUpdate(selectedCompany.id, 'APPROVED')}
                       disabled={selectedCompany.status === 'APPROVED'}
                       className="bg-accent hover:bg-accent/90"
                     >
                       <CheckCircle className="w-4 h-4 mr-2" />
                       Approve
                     </Button>
                     <Button
                       variant="outline"
                       onClick={() => handleStatusUpdate(selectedCompany.id, 'PENDING')}
                       disabled={selectedCompany.status === 'PENDING'}
                     >
                       <Clock className="w-4 h-4 mr-2" />
                       Request More Info
                     </Button>
                     <Button
                       variant="destructive"
                       onClick={() => handleStatusUpdate(selectedCompany.id, 'SUSPENDED')}
                       disabled={selectedCompany.status === 'SUSPENDED'}
                     >
                       <XCircle className="w-4 h-4 mr-2" />
                       Suspend
                     </Button>
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