 import { useState } from 'react';
 import { useNavigate, useLocation } from 'react-router-dom';
 import { useForm } from 'react-hook-form';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { z } from 'zod';
 import { TreePine, Eye, EyeOff, Loader2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { useAuthStore } from '@/stores/authStore';
 import { toast } from 'sonner';
 import  axios from "axios"
 
 const loginSchema = z.object({
   email: z.string().email('Invalid email address'),
   password: z.string().min(1, 'Password is required'),
 });
 
 type LoginFormData = z.infer<typeof loginSchema>;
 
 export default function LoginPage() {
   const navigate = useNavigate();
   const location = useLocation();
   const { login, isLoading } = useAuthStore();
   const [showPassword, setShowPassword] = useState(false);
 
   const from = location.state?.from?.pathname || '/';
 
   const {
     register,
     handleSubmit,
     formState: { errors },
   } = useForm<LoginFormData>({
     resolver: zodResolver(loginSchema),
   });
 
   const onSubmit = async (data: LoginFormData) => {
     const success = await login(data.email, data.password);
     
     if (success) {
       toast.success('Welcome back!');
       // Navigate based on user role
       const user = useAuthStore.getState().user;
       if (user?.role === 'SUPER_ADMIN') {
         navigate('/admin');
       } else {
         navigate('/company');
       }
     } else {
       toast.error('Invalid email or password');
     }
   };
 
   return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-timber p-4">
       <div className="w-full max-w-md animate-fade-in">
         {/* Logo */}
         <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 rounded-2xl bg-gradient-wood flex items-center justify-center mb-4 shadow-wood">
             <TreePine className="w-9 h-9 text-primary-foreground" />
           </div>
           <h1 className="text-2xl font-bold text-foreground">TimberTrade</h1>
           <p className="text-muted-foreground">Cameroon Wood Import/Export</p>
         </div>
 
         <Card className="card-timber">
           <CardHeader className="text-center">
             <CardTitle>Sign In</CardTitle>
             <CardDescription>
               Enter your credentials to access your account
             </CardDescription>
           </CardHeader>
           <CardContent>
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <Input
                   id="email"
                   type="email"
                   placeholder="you@company.com"
                   {...register('email')}
                   className="touch-target"
                 />
                 {errors.email && (
                   <p className="text-sm text-destructive">{errors.email.message}</p>
                 )}
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="password">Password</Label>
                 <div className="relative">
                   <Input
                     id="password"
                     type={showPassword ? 'text' : 'password'}
                     placeholder="••••••••"
                     {...register('password')}
                     className="touch-target pr-10"
                   />
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                   >
                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                   </button>
                 </div>
                 {errors.password && (
                   <p className="text-sm text-destructive">{errors.password.message}</p>
                 )}
               </div>
 
               <Button
                 type="submit"
                 className="w-full touch-target btn-wood"
                 disabled={isLoading}
               >
                 {isLoading ? (
                   <>
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     Signing in...
                   </>
                 ) : (
                   'Sign In'
                 )}
               </Button>
             </form>
 
             {/* Demo credentials */}
             <div className="mt-6 p-4 bg-muted rounded-lg">
               <p className="text-sm font-medium text-muted-foreground mb-2">Demo Credentials:</p>
               <div className="space-y-1 text-xs text-muted-foreground">
                 <p><strong>Admin:</strong> admin@timber.com / admin123</p>
                 <p><strong>Company:</strong> company@timber.com / company123</p>
               </div>
             </div>
 
             <div className="mt-4 text-center">
               <Button variant="link" onClick={() => navigate('/register')} className="text-secondary">
                 Register your company
               </Button>
             </div>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }