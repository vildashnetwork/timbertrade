import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
    Lock,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = 'https://franca-backend-ecaz.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const otpCode = searchParams.get('otp') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        if (!email || !otpCode) {
            setError('Missing required information. Please start over.');
        }
    }, [email, otpCode]);

    useEffect(() => {
        // Calculate password strength
        let strength = 0;
        if (password.length >= 6) strength += 25;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;

        setPasswordStrength(Math.min(strength, 100));
    }, [password]);

    const getStrengthColor = () => {
        if (passwordStrength < 50) return 'bg-red-500';
        if (passwordStrength < 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (passwordStrength < 50) return 'Weak';
        if (passwordStrength < 75) return 'Medium';
        return 'Strong';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !otpCode) {
            setError('Missing required information. Please start over.');
            return;
        }

        if (!password) {
            setError('Please enter a new password');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/otp/reset-password', {
                email,
                otpCode,
                newPassword: password,
                confirmPassword
            });

            if (response.data.success) {
                setIsSuccess(true);
                toast.success('Password reset successfully!');

                // Store token if auto-login is enabled
                if (response.data.token) {
                    localStorage.setItem('auth-token', response.data.token);
                }

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (error: any) {
            console.error('Reset password error:', error);
            setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
            toast.error('Password reset failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (!email || !otpCode) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-2 shadow-xl">
                    <CardContent className="pt-6">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Invalid reset link. Please request a new password reset.
                            </AlertDescription>
                        </Alert>
                        <Button asChild className="w-full mt-4">
                            <Link to="/forgot-password">Request New Reset</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-2 shadow-xl">
                    <CardContent className="pt-6 text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Password Reset Successful!</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Your password has been changed successfully.
                        </p>
                        <p className="text-xs text-muted-foreground mb-6">
                            Redirecting to login page...
                        </p>
                        <div className="flex justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                        <Button asChild className="w-full mt-6">
                            <Link to="/login">Go to Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Back Button */}
                <Button variant="ghost" asChild className="mb-4">
                    <Link to="/verify-otp">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Link>
                </Button>

                <Card className="border-2 shadow-xl">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Key className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Reset Password</CardTitle>
                        <CardDescription>
                            Create a new password for your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email (read-only) */}
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        placeholder="Enter new password"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>

                                {/* Password Strength Meter */}
                                {password && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span>Password strength:</span>
                                            <span className={getStrengthText() === 'Weak' ? 'text-red-500' : getStrengthText() === 'Medium' ? 'text-yellow-500' : 'text-green-500'}>
                                                {getStrengthText()}
                                            </span>
                                        </div>
                                        <Progress
                                            value={passwordStrength}
                                            className={`h-1 ${getStrengthColor()}`}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        placeholder="Confirm new password"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="bg-muted p-3 rounded-lg text-xs space-y-1">
                                <p className="font-medium mb-1">Password requirements:</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                    <li className={password.length >= 6 ? 'text-green-600' : ''}>
                                        • At least 6 characters long
                                    </li>
                                    <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                                        • At least one uppercase letter
                                    </li>
                                    <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                                        • At least one number
                                    </li>
                                    <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}>
                                        • At least one special character
                                    </li>
                                </ul>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white"
                                disabled={isLoading || password.length < 6 || password !== confirmPassword}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Resetting Password...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground mt-4">
                                Remember your password?{' '}
                                <Link to="/login" className="text-primary hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}