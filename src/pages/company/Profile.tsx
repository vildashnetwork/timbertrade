import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User as UserIcon,
    Building2,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Save,
    Loader2,
    ArrowLeft,
    Camera,
    X,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Globe,
    Calendar,
    FileText,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import axios from 'axios';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dsewg9nlw';
const CLOUDINARY_UPLOAD_PRESET = 'blisssz';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// API Configuration
const API_URL = 'https://franca-backend-ecaz.onrender.com/api';

// Create axios instance for API calls
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth-token');
        }
        return Promise.reject(error);
    }
);

// User Interface
interface User {
    _id: string;
    id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'REGISTERED_COMPANY';
    avatar?: string;
    number?: string;
}

// Company Interface
interface Company {
    _id: string;
    id: string;
    name: string;
    taxId: string;
    email: string;
    phone: string;
    address: string;
    directorName: string;
    directorEmail: string;
    status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
    website?: string;
    description?: string;
    yearEstablished?: number;
    avatar?: string;
    kybDocs?: any[];
    createdAt: string;
    updatedAt: string;
}

interface FormData {
    // User fields
    name: string;
    email: string;

    // Company fields
    companyName: string;
    taxId: string;
    phone: string;
    address: string;
    directorName: string;
    directorEmail: string;

    // Optional fields
    website?: string;
    description?: string;
    yearEstablished?: number;
}

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function EditProfilePage() {
    const navigate = useNavigate();

    // State for user and company data fetched from API
    const [user, setUser] = useState<User | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        companyName: '',
        taxId: '',
        phone: '',
        address: '',
        directorName: '',
        directorEmail: '',
        website: '',
        description: '',
        yearEstablished: undefined,
    });

    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('profile');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch user profile from API on component mount
    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setIsLoading(true);
        setFetchError(null);

        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                toast.error('Please login to continue');
                navigate('/login');
                return;
            }

            console.log('Fetching user profile from API...');
            const response = await api.get('/auth/profile');
            const data = response.data;

            console.log('Profile data received:', data);

            // Transform the data to ensure consistent ID fields
            const userData = {
                ...data.user,
                id: data.user._id || data.user.id,
            };

            const companyData = data.company ? {
                ...data.company,
                id: data.company._id || data.company.id,
                _id: data.company._id || data.company.id,
            } : null;

            setUser(userData);
            setCompany(companyData);

            // Initialize form with fetched data
            if (userData && companyData) {
                console.log('Setting form data with company:', companyData);
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    companyName: companyData.name || '',
                    taxId: companyData.taxId || '',
                    phone: companyData.phone || '',
                    address: companyData.address || '',
                    directorName: companyData.directorName || '',
                    directorEmail: companyData.directorEmail || '',
                    website: companyData.website || '',
                    description: companyData.description || '',
                    yearEstablished: companyData.yearEstablished || undefined,
                });
            }

        } catch (error: any) {
            console.error('Error fetching profile:', error);

            if (error.response?.status === 401) {
                localStorage.removeItem('auth-token');
                toast.error('Session expired. Please login again.');
                navigate('/login');
            } else {
                setFetchError('Failed to load profile. Please try again.');
                toast.error('Failed to load profile');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle avatar selection
    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('File too large', {
                description: 'Maximum file size is 5MB'
            });
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type', {
                description: 'Please upload JPG, PNG, or GIF files only'
            });
            return;
        }

        setAvatarFile(file);
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
    };

    const removeAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Upload avatar to Cloudinary
    const uploadAvatarToCloudinary = async (): Promise<string | null> => {
        if (!avatarFile) return null;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', avatarFile);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'timber-platform/avatars');

            const response = await new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded * 100) / event.total);
                        setUploadProgress(percentComplete);
                    }
                });

                xhr.onload = () => {
                    if (xhr.status === 200) {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data.secure_url);
                    } else {
                        reject(new Error('Upload failed'));
                    }
                };

                xhr.onerror = () => reject(new Error('Upload failed'));

                xhr.open('POST', CLOUDINARY_URL);
                xhr.send(formData);
            });

            return response;
        } catch (error) {
            console.error('Avatar upload error:', error);
            toast.error('Failed to upload avatar');
            return null;
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // Validate profile form
    const validateProfileForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }
        if (!formData.companyName.trim()) {
            errors.companyName = 'Company name is required';
        }
        if (!formData.taxId.trim()) {
            errors.taxId = 'Tax ID is required';
        }
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        }
        if (!formData.address.trim()) {
            errors.address = 'Address is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate password form
    const validatePasswordForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }
        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle profile save
    const handleSaveProfile = async () => {
        if (!validateProfileForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        if (!company) {
            toast.error('Company information not found');
            return;
        }

        // Get company ID
        const companyId = company.id || company._id;

        if (!companyId) {
            toast.error('Company ID not found. Please refresh and try again.');
            return;
        }

        setIsSaving(true);
        setSaveSuccess(false);

        try {
            // Upload avatar if changed
            let avatarUrl: string | null = null;
            if (avatarFile) {
                avatarUrl = await uploadAvatarToCloudinary();
                if (!avatarUrl) {
                    throw new Error('Failed to upload avatar');
                }
            }

            // Prepare update data - only send fields that have changed
            const updateData: any = {};

            if (formData.companyName !== company.name) {
                updateData.name = formData.companyName;
            }
            if (formData.phone !== company.phone) {
                updateData.phone = formData.phone;
            }
            if (formData.address !== company.address) {
                updateData.address = formData.address;
            }
            if (formData.directorName !== company.directorName) {
                updateData.directorName = formData.directorName;
            }
            if (formData.directorEmail !== company.directorEmail) {
                updateData.directorEmail = formData.directorEmail;
            }
            if (formData.website !== company.website) {
                updateData.website = formData.website;
            }
            if (formData.description !== company.description) {
                updateData.description = formData.description;
            }
            if (formData.yearEstablished !== company.yearEstablished) {
                updateData.yearEstablished = formData.yearEstablished;
            }
            if (avatarUrl) {
                updateData.avatar = avatarUrl;
            }

            // If no fields to update, show message
            if (Object.keys(updateData).length === 0 && !avatarUrl) {
                toast.info('No changes to save');
                setIsSaving(false);
                return;
            }

            console.log('Updating company with ID:', companyId);
            console.log('Update data:', updateData);

            // FIXED: Use the correct endpoint - companies route, not auth route
            const response = await api.put(`/auth/${companyId}`, updateData);

            console.log('Update response:', response.data);

            if (response.data) {
                // Refetch user profile from API to get updated data
                await fetchUserProfile();

                setSaveSuccess(true);
                toast.success('Profile updated successfully');

                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (error: any) {
            console.error('Save error:', error);

            if (error.response?.status === 403) {
                toast.error('Permission denied', {
                    description: error.response?.data?.message || 'You do not have permission to update this profile'
                });
            } else if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/login');
            } else if (error.response?.status === 404) {
                toast.error('Company not found. Please refresh and try again.');
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to update profile';
                toast.error(errorMessage);
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Handle password change
    const handleChangePassword = async () => {
        if (!validatePasswordForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSaving(true);
        setPasswordSuccess(false);

        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                userid: user?._id
            });

            toast.success('Password changed successfully');
            setPasswordSuccess(true);

            // Reset password form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (error: any) {
            console.error('Password change error:', error);

            if (error.response?.status === 401) {
                toast.error('Current password is incorrect');
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to change password';
                toast.error(errorMessage);
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.name) return 'U';
        return user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('auth-token');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (fetchError || !user || !company) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
                    <p className="text-muted-foreground mb-6">
                        {fetchError || 'Unable to load profile information.'}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => navigate('/')}>
                            Go to Home
                        </Button>
                        <Button variant="outline" onClick={fetchUserProfile}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header with Logout */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Profile</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Badge
                        variant="outline"
                        className={`px-3 py-1 ${company.status === 'APPROVED'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : company.status === 'PENDING'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                    >
                        {company.status}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Success Alert */}
            {saveSuccess && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                        Profile updated successfully!
                    </AlertDescription>
                </Alert>
            )}

            {passwordSuccess && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                        Password changed successfully!
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile Information</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    {/* Avatar Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                            <CardDescription>
                                Upload a profile picture for your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative">
                                    <Avatar className="w-32 h-32 ring-4 ring-primary/20">
                                        <AvatarImage src={avatarPreview || company?.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-3xl">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {avatarPreview && (
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                                            onClick={removeAvatar}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/jpg,image/gif"
                                        onChange={handleAvatarSelect}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="w-full sm:w-auto"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Uploading {uploadProgress}%
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="w-4 h-4 mr-2" />
                                                Change Photo
                                            </>
                                        )}
                                    </Button>
                                    {uploadProgress > 0 && (
                                        <div className="mt-2 w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-2">
                                        JPG, PNG or GIF. Max 5MB.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Update your personal details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Full Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={formErrors.name ? 'border-destructive' : ''}
                                        disabled={isSaving}
                                    />
                                    {formErrors.name && (
                                        <p className="text-xs text-destructive">{formErrors.name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email Address <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={formErrors.email ? 'border-destructive' : ''}
                                        disabled={isSaving}
                                    />
                                    {formErrors.email && (
                                        <p className="text-xs text-destructive">{formErrors.email}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Company Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                            <CardDescription>
                                Update your company details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">
                                        Company Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="companyName"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className={formErrors.companyName ? 'border-destructive' : ''}
                                        disabled={isSaving}
                                    />
                                    {formErrors.companyName && (
                                        <p className="text-xs text-destructive">{formErrors.companyName}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="taxId">
                                        Tax ID (NIU) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="taxId"
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                        className={formErrors.taxId ? 'border-destructive' : ''}
                                        disabled // Tax ID shouldn't be changed
                                    />
                                    {formErrors.taxId && (
                                        <p className="text-xs text-destructive">{formErrors.taxId}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        Phone Number <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={formErrors.phone ? 'border-destructive' : ''}
                                        disabled={isSaving}
                                    />
                                    {formErrors.phone && (
                                        <p className="text-xs text-destructive">{formErrors.phone}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="website"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            placeholder="https://example.com"
                                            className="pl-10"
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="address">
                                        Address <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows={2}
                                        className={formErrors.address ? 'border-destructive' : ''}
                                        disabled={isSaving}
                                    />
                                    {formErrors.address && (
                                        <p className="text-xs text-destructive">{formErrors.address}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="yearEstablished">Year Established</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="yearEstablished"
                                            type="number"
                                            value={formData.yearEstablished || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                yearEstablished: e.target.value ? parseInt(e.target.value) : undefined
                                            })}
                                            placeholder="2020"
                                            className="pl-10"
                                            min={1800}
                                            max={new Date().getFullYear()}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="description">Company Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        placeholder="Tell us about your company, your mission, and what makes you unique..."
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Director Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Director Information</CardTitle>
                            <CardDescription>
                                Update director/representative details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="directorName">Director Name</Label>
                                    <Input
                                        id="directorName"
                                        value={formData.directorName}
                                        onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="directorEmail">Director Email</Label>
                                    <Input
                                        id="directorEmail"
                                        type="email"
                                        value={formData.directorEmail}
                                        onChange={(e) => setFormData({ ...formData, directorEmail: e.target.value })}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end gap-3" style={{ marginBottom: "100px" }}>
                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                            disabled={isSaving || isUploading}
                        >
                            Cancel
                        </Button>
                        <Button

                            onClick={handleSaveProfile}
                            disabled={isSaving || isUploading}
                            className="bg-gradient-to-r from-primary to-secondary text-white min-w-[140px]"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">
                                    Current Password <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className={passwordErrors.currentPassword ? 'border-destructive' : ''}
                                    disabled={isSaving}
                                />
                                {passwordErrors.currentPassword && (
                                    <p className="text-xs text-destructive">{passwordErrors.currentPassword}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">
                                    New Password <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className={passwordErrors.newPassword ? 'border-destructive' : ''}
                                    disabled={isSaving}
                                />
                                {passwordErrors.newPassword && (
                                    <p className="text-xs text-destructive">{passwordErrors.newPassword}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Password must be at least 6 characters long
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirm New Password <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className={passwordErrors.confirmPassword ? 'border-destructive' : ''}
                                    disabled={isSaving}
                                />
                                {passwordErrors.confirmPassword && (
                                    <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>
                                )}
                            </div>

                            <div className="pt-4" >
                                <Button
                                    onClick={handleChangePassword}
                                    disabled={isSaving}
                                    className="bg-gradient-to-r from-primary to-secondary text-white"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Change Password'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Session Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Sessions</CardTitle>
                            <CardDescription>
                                Manage your active login sessions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                        <div>
                                            <p className="font-medium">Current Session</p>
                                            <p className="text-sm text-muted-foreground">
                                                Last active: Just now
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {navigator.userAgent}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                        Active
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}