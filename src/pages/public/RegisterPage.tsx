 import { useState } from 'react';
 import { useNavigate, Link } from 'react-router-dom';
 import { useForm } from 'react-hook-form';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { z } from 'zod';
 import { TreePine, Loader2, Upload, FileText, ArrowLeft } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Separator } from '@/components/ui/separator';
 import { toast } from 'sonner';
 
 const registerSchema = z.object({
   companyName: z.string().min(2, 'Company name is required'),
   taxId: z.string().min(5, 'Valid Tax ID (NIU) is required'),
   email: z.string().email('Invalid email address'),
   phone: z.string().min(9, 'Valid phone number is required'),
   address: z.string().min(5, 'Address is required'),
   directorName: z.string().min(2, 'Director name is required'),
   directorEmail: z.string().email('Invalid director email'),
 });
 
 type RegisterFormData = z.infer<typeof registerSchema>;
 
 export default function RegisterPage() {
   const navigate = useNavigate();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [uploadedDocs, setUploadedDocs] = useState<{ name: string; type: string }[]>([]);
 
   const {
     register,
     handleSubmit,
     formState: { errors },
   } = useForm<RegisterFormData>({
     resolver: zodResolver(registerSchema),
   });
 
   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
     const file = e.target.files?.[0];
     if (file) {
       setUploadedDocs((prev) => [
         ...prev.filter((d) => d.type !== docType),
         { name: file.name, type: docType },
       ]);
       toast.success(`${docType.replace('_', ' ')} uploaded`);
     }
   };
 
   const onSubmit = async (data: RegisterFormData) => {
     setIsSubmitting(true);
     
     // Simulate API call
     await new Promise((resolve) => setTimeout(resolve, 1500));
     
     toast.success('Registration submitted! We will review your application shortly.');
     navigate('/login');
   };
 
   return (
     <div className="min-h-screen bg-gradient-timber py-8 px-4">
       <div className="max-w-2xl mx-auto animate-fade-in">
         {/* Back Link */}
         <Button variant="ghost" asChild className="mb-6">
           <Link to="/">
             <ArrowLeft className="w-4 h-4 mr-2" />
             Back to Catalog
           </Link>
         </Button>
 
         {/* Logo */}
         <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 rounded-2xl bg-gradient-wood flex items-center justify-center mb-4 shadow-wood">
             <TreePine className="w-9 h-9 text-primary-foreground" />
           </div>
           <h1 className="text-2xl font-bold text-foreground">TimberTrade</h1>
           <p className="text-muted-foreground">Company Registration</p>
         </div>
 
         <Card className="card-timber">
           <CardHeader>
             <CardTitle>Register Your Company</CardTitle>
             <CardDescription>
               Complete the KYB (Know Your Business) process to start trading
             </CardDescription>
           </CardHeader>
           <CardContent>
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               {/* Company Details */}
               <div>
                 <h3 className="text-lg font-semibold mb-4">Company Details</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="companyName">Company Name *</Label>
                     <Input
                       id="companyName"
                       {...register('companyName')}
                       placeholder="Your Company Ltd."
                     />
                     {errors.companyName && (
                       <p className="text-sm text-destructive">{errors.companyName.message}</p>
                     )}
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="taxId">Tax ID (NIU) *</Label>
                     <Input
                       id="taxId"
                       {...register('taxId')}
                       placeholder="NIU-2024-XXXXXX"
                     />
                     {errors.taxId && (
                       <p className="text-sm text-destructive">{errors.taxId.message}</p>
                     )}
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="email">Company Email *</Label>
                     <Input
                       id="email"
                       type="email"
                       {...register('email')}
                       placeholder="contact@company.com"
                     />
                     {errors.email && (
                       <p className="text-sm text-destructive">{errors.email.message}</p>
                     )}
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="phone">Phone Number *</Label>
                     <Input
                       id="phone"
                       {...register('phone')}
                       placeholder="+237 6 XX XX XX XX"
                     />
                     {errors.phone && (
                       <p className="text-sm text-destructive">{errors.phone.message}</p>
                     )}
                   </div>
                   <div className="md:col-span-2 space-y-2">
                     <Label htmlFor="address">Address *</Label>
                     <Textarea
                       id="address"
                       {...register('address')}
                       placeholder="Full company address"
                       rows={2}
                     />
                     {errors.address && (
                       <p className="text-sm text-destructive">{errors.address.message}</p>
                     )}
                   </div>
                 </div>
               </div>
 
               <Separator />
 
               {/* Director Details */}
               <div>
                 <h3 className="text-lg font-semibold mb-4">Director / Representative</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="directorName">Full Name *</Label>
                     <Input
                       id="directorName"
                       {...register('directorName')}
                       placeholder="Jean Pierre Kamga"
                     />
                     {errors.directorName && (
                       <p className="text-sm text-destructive">{errors.directorName.message}</p>
                     )}
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="directorEmail">Email *</Label>
                     <Input
                       id="directorEmail"
                       type="email"
                       {...register('directorEmail')}
                       placeholder="director@company.com"
                     />
                     {errors.directorEmail && (
                       <p className="text-sm text-destructive">{errors.directorEmail.message}</p>
                     )}
                   </div>
                 </div>
               </div>
 
               <Separator />
 
               {/* Document Upload */}
               <div>
                 <h3 className="text-lg font-semibold mb-4">KYB Documents</h3>
                 <p className="text-sm text-muted-foreground mb-4">
                   Upload your company documents for verification
                 </p>
 
                 <div className="grid md:grid-cols-2 gap-4">
                   {/* Carte de Contribuable */}
                   <div className="p-4 border-2 border-dashed rounded-lg hover:border-secondary transition-colors">
                     <Label htmlFor="carte" className="block text-center cursor-pointer">
                       <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                       <span className="font-medium">Carte de Contribuable</span>
                       <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max 5MB)</p>
                       {uploadedDocs.find((d) => d.type === 'CARTE_CONTRIBUABLE') && (
                         <div className="mt-2 flex items-center justify-center gap-1 text-accent">
                           <FileText className="w-4 h-4" />
                           <span className="text-xs">
                             {uploadedDocs.find((d) => d.type === 'CARTE_CONTRIBUABLE')?.name}
                           </span>
                         </div>
                       )}
                     </Label>
                     <input
                       id="carte"
                       type="file"
                       accept=".pdf,.jpg,.jpeg,.png"
                       className="hidden"
                       onChange={(e) => handleFileUpload(e, 'CARTE_CONTRIBUABLE')}
                     />
                   </div>
 
                   {/* RCCM */}
                   <div className="p-4 border-2 border-dashed rounded-lg hover:border-secondary transition-colors">
                     <Label htmlFor="rccm" className="block text-center cursor-pointer">
                       <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                       <span className="font-medium">RCCM Document</span>
                       <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max 5MB)</p>
                       {uploadedDocs.find((d) => d.type === 'RCCM') && (
                         <div className="mt-2 flex items-center justify-center gap-1 text-accent">
                           <FileText className="w-4 h-4" />
                           <span className="text-xs">
                             {uploadedDocs.find((d) => d.type === 'RCCM')?.name}
                           </span>
                         </div>
                       )}
                     </Label>
                     <input
                       id="rccm"
                       type="file"
                       accept=".pdf,.jpg,.jpeg,.png"
                       className="hidden"
                       onChange={(e) => handleFileUpload(e, 'RCCM')}
                     />
                   </div>
                 </div>
               </div>
 
               <Button
                 type="submit"
                 className="w-full touch-target btn-wood"
                 disabled={isSubmitting}
               >
                 {isSubmitting ? (
                   <>
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     Submitting...
                   </>
                 ) : (
                   'Submit Registration'
                 )}
               </Button>
 
               <p className="text-xs text-center text-muted-foreground">
                 By registering, you agree to our Terms of Service and Privacy Policy.
               </p>
             </form>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }