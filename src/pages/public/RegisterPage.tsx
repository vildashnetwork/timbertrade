import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TreePine,
  Loader2,
  Upload,
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import axios from 'axios';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dsewg9nlw';
const CLOUDINARY_UPLOAD_PRESET = 'blisssz';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Updated schema to match backend structure
const registerSchema = z.object({
  // User fields
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),

  // Company fields - matches your schema
  companyName: z.string().min(2, 'Company name is required'),
  taxId: z.string().min(5, 'Valid Tax ID (NIU) is required'),
  address: z.string().min(5, 'Address is required').default('Douala'),

  // Phone number field - using 'number' to match backend
  number: z.string().optional(),

  // Optional fields
  directorName: z.string().optional(),
  directorEmail: z.string().email('Invalid director email').optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Document types - exactly matching your backend enum
const DOCUMENT_TYPES = [
  { id: 'NIU', label: 'NIU Certificate', backendType: 'NIU', required: true },
  { id: 'RCCM', label: 'RCCM Document', backendType: 'RCCM', required: true },
] as const;

type DocumentType = typeof DOCUMENT_TYPES[number]['id'];

interface UploadedDocument {
  type: DocumentType;
  backendType: 'NIU' | 'RCCM';
  file: File;
  url?: string;
  name: string;
  status: 'uploading' | 'uploaded' | 'error';
  progress: number;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      address: 'Douala',
      number: '', // Initialize number as empty string
    },
  });

  // Watch the number field for debugging
  const watchedNumber = watch('number');
  console.log('Current phone number value:', watchedNumber);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: DocumentType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const docConfig = DOCUMENT_TYPES.find(d => d.id === docType);
    if (!docConfig) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum file size is 5MB',
      });
      return;
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload PDF, JPG, or PNG files only',
      });
      return;
    }

    // Add to uploaded docs with uploading status
    setUploadedDocs((prev) => [
      ...prev.filter((d) => d.type !== docType),
      {
        type: docType,
        backendType: docConfig.backendType,
        file,
        name: file.name,
        status: 'uploading',
        progress: 0
      },
    ]);

    // Upload to Cloudinary
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'timber-platform/kyb-docs');

      const response = await axios.post(CLOUDINARY_URL, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [docType]: percentCompleted }));

            setUploadedDocs(prev =>
              prev.map(doc =>
                doc.type === docType
                  ? { ...doc, progress: percentCompleted }
                  : doc
              )
            );
          }
        },
      });

      // Update document with Cloudinary URL
      setUploadedDocs(prev =>
        prev.map(doc =>
          doc.type === docType
            ? {
              ...doc,
              url: response.data.secure_url,
              status: 'uploaded',
              progress: 100
            }
            : doc
        )
      );

      toast.success(`${docConfig.label} uploaded successfully`);
    } catch (error) {
      console.error('Upload failed:', error);

      setUploadedDocs(prev =>
        prev.map(doc =>
          doc.type === docType
            ? { ...doc, status: 'error', progress: 0 }
            : doc
        )
      );

      toast.error('Upload failed', {
        description: 'Please try again',
      });
    }
  };

  const removeDocument = (docType: DocumentType) => {
    setUploadedDocs(prev => prev.filter(doc => doc.type !== docType));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[docType];
      return newProgress;
    });
  };

  const getRequiredDocsUploaded = () => {
    const requiredDocs = DOCUMENT_TYPES.filter(doc => doc.required).map(doc => doc.id);
    return requiredDocs.every(docType =>
      uploadedDocs.some(doc => doc.type === docType && doc.status === 'uploaded' && doc.url)
    );
  };

  const onSubmit = async (data: RegisterFormData) => {
    // Check if all required documents are uploaded
    if (!getRequiredDocsUploaded()) {
      toast.error('Missing documents', {
        description: 'Please upload all required KYB documents',
      });
      return;
    }

    setIsSubmitting(true);
    setRegistrationError(null);

    try {
      // Prepare KYB documents
      const kybDocs = uploadedDocs
        .filter(doc => doc.url)
        .map(doc => ({
          documentType: doc.backendType,
          documentUrl: doc.url!,
        }));

      // Log the form data to debug
      console.log('Form data - number field value:', data.number);
      console.log('Form data - number type:', typeof data.number);
      console.log('Form data - number length:', data.number?.length);

      // Prepare registration data - ensure number is properly handled
      const registrationData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        directorName: data.directorName?.trim() || data.name.trim(),
        directorEmail: data.directorEmail?.trim().toLowerCase() || data.email.trim().toLowerCase(),
        // FIXED: Ensure number is properly passed - don't use || '' if it's a valid empty string
        number: data.number && data.number.trim() ? data.number.trim() : '',
        // Alternative: If backend expects 'phone' instead of 'number', uncomment below:
        // phone: data.number && data.number.trim() ? data.number.trim() : '',
        companyName: data.companyName.trim(),
        taxId: data.taxId.trim(),
        address: data.address?.trim() || 'Douala',
        kybDocs: kybDocs,
      };

      console.log('Submitting registration data:', JSON.stringify(registrationData, null, 2));

      // Register user and company
      const success = await registerUser(registrationData);

      if (success) {
        toast.success('Registration successful!', {
          description: 'Your company has been registered and is pending approval.',
        });
        navigate('/company/kyb-pending');
      } else {
        setRegistrationError('Registration failed. Please check your information and try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setRegistrationError(error.message || 'Registration failed');
      toast.error('Registration failed', {
        description: error?.message || 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 py-8 px-4">
      <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Back Link */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Link>
        </Button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <TreePine className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TimberTrade
          </h1>
          <p className="text-muted-foreground">Company Registration & KYB</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className={`flex-1 text-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-primary text-white' : 'bg-muted'
                }`}>
                1
              </div>
              <span className="text-sm">Company Info</span>
            </div>
            <div className={`flex-1 text-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-muted'
                }`}>
                2
              </div>
              <span className="text-sm">KYB Documents</span>
            </div>
          </div>
          <Progress value={step === 1 ? 50 : 100} className="mt-2" />
        </div>

        {registrationError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{registrationError}</AlertDescription>
          </Alert>
        )}

        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle>Register Your Company</CardTitle>
            <CardDescription>
              Complete the KYB (Know Your Business) process to start trading on our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <>
                  {/* Company Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                      Company Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          {...register('companyName')}
                          placeholder="Your Company Ltd."
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="number">Phone Number</Label>
                        <Input
                          id="number"
                          type="tel"
                          {...register('number')}
                          placeholder="+237 6XX XXX XXX"
                          disabled={isSubmitting}
                          className="w-full"
                        />
                        {errors.number && (
                          <p className="text-sm text-destructive">{errors.number.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                          id="address"
                          {...register('address')}
                          placeholder="Full company address"
                          rows={2}
                          disabled={isSubmitting}
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
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                      Director / Representative (Optional)
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="directorName">Full Name</Label>
                        <Input
                          id="directorName"
                          {...register('directorName')}
                          placeholder="Jean Pierre Kamga"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="directorEmail">Email</Label>
                        <Input
                          id="directorEmail"
                          type="email"
                          {...register('directorEmail')}
                          placeholder="director@company.com"
                          disabled={isSubmitting}
                        />
                        {errors.directorEmail && (
                          <p className="text-sm text-destructive">{errors.directorEmail.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Account Security */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                      Account Security
                    </h3>
                    <div className="grid md:grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Full Name *</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder="John Doe"
                          disabled={isSubmitting}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          {...register('password')}
                          placeholder="••••••••"
                          disabled={isSubmitting}
                        />
                        {errors.password && (
                          <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                      disabled={isSubmitting}
                    >
                      Next: Upload Documents
                    </Button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Document Upload */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">4</span>
                      KYB Documents
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Upload your company documents for verification.
                      Accepted types: <span className="font-medium">NIU and RCCM</span>
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      {DOCUMENT_TYPES.map((doc) => {
                        const uploaded = uploadedDocs.find(d => d.type === doc.id);

                        return (
                          <div
                            key={doc.id}
                            className={`p-4 border-2 rounded-lg transition-all ${uploaded?.status === 'uploaded'
                              ? 'border-green-500 bg-green-50'
                              : uploaded?.status === 'error'
                                ? 'border-destructive bg-destructive/5'
                                : 'border-dashed hover:border-secondary'
                              }`}
                          >
                            {!uploaded ? (
                              <Label htmlFor={doc.id} className="block text-center cursor-pointer">
                                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                <span className="font-medium">{doc.label}</span>
                                {doc.required && <span className="text-destructive ml-1">*</span>}
                                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max 5MB)</p>
                              </Label>
                            ) : (
                              <div className="text-center">
                                {uploaded.status === 'uploading' && (
                                  <>
                                    <div className="animate-pulse mb-2">
                                      <Upload className="w-8 h-8 mx-auto text-primary" />
                                    </div>
                                    <p className="text-sm font-medium mb-2">Uploading...</p>
                                    <Progress value={uploaded.progress} className="h-1" />
                                    <p className="text-xs text-muted-foreground mt-1">{uploaded.progress}%</p>
                                  </>
                                )}

                                {uploaded.status === 'uploaded' && (
                                  <>
                                    <CheckCircle2 className="w-8 h-8 mx-auto text-green-500 mb-2" />
                                    <p className="text-sm font-medium text-green-700 mb-1 truncate max-w-full">
                                      {uploaded.name}
                                    </p>
                                    <p className="text-xs text-green-600 mb-2">Uploaded successfully</p>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeDocument(doc.id)}
                                      className="text-destructive hover:text-destructive/80"
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Remove
                                    </Button>
                                  </>
                                )}

                                {uploaded.status === 'error' && (
                                  <>
                                    <AlertCircle className="w-8 h-8 mx-auto text-destructive mb-2" />
                                    <p className="text-sm text-destructive mb-2">Upload failed</p>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        removeDocument(doc.id);
                                        setTimeout(() => {
                                          document.getElementById(doc.id)?.click();
                                        }, 100);
                                      }}
                                    >
                                      Try Again
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}

                            <input
                              id={doc.id}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, doc.id)}
                              disabled={isSubmitting || uploaded?.status === 'uploading'}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Upload Progress Summary */}
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Required Documents Status</h4>
                      <div className="space-y-2">
                        {DOCUMENT_TYPES.map(doc => {
                          const uploaded = uploadedDocs.find(d => d.type === doc.id);
                          return (
                            <div key={doc.id} className="flex items-center gap-2 text-sm">
                              {uploaded?.status === 'uploaded' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-destructive" />
                              )}
                              <span className={uploaded?.status === 'uploaded' ? 'text-green-700' : 'text-destructive'}>
                                {doc.label}: {uploaded?.status === 'uploaded' ? 'Uploaded' : 'Required'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-primary to-secondary text-white"
                      disabled={isSubmitting || !getRequiredDocsUploaded()}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting Registration...
                        </>
                      ) : (
                        'Complete Registration'
                      )}
                    </Button>
                  </div>
                </>
              )}

              <p className="text-xs text-center text-muted-foreground pt-4">
                By registering, you agree to our Terms of Service and Privacy Policy.
                Your information will be verified by our team before approval.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Need help? Contact our support team at support@timbertrade.com</p>
        </div>
      </div>
    </div>
  );
}