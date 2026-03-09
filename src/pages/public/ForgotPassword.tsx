import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Send,
    Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = 'https://franca-backend-ecaz.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/otp/forgot-password', { email });

            if (response.data.success) {
                setIsSubmitted(true);
                toast.success('OTP sent successfully!', {
                    description: 'Please check your email for the verification code.',
                });

                // Redirect to OTP verification page after 2 seconds
                setTimeout(() => {
                    navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
                }, 2000);
            }
        } catch (error: any) {
            console.error('Forgot password error:', error);
            setError(error.response?.data?.message || 'Failed to send reset email. Please try again.');
            toast.error('Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Back Button */}
                <Button variant="ghost" asChild className="mb-4">
                    <Link to="/login">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>
                </Button>

                <Card className="border-2 shadow-xl">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Key className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                        <CardDescription>
                            Enter your email address and we'll send you a one-time password (OTP) to reset your password.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {isSubmitted ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    We've sent a verification code to <strong>{email}</strong>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Redirecting to verification page...
                                </p>
                                <div className="mt-4 flex justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            disabled={isLoading}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-primary to-secondary text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending OTP...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Reset OTP
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    Remember your password?{' '}
                                    <Link to="/login" className="text-primary hover:underline">
                                        Sign in
                                    </Link>
                                </p>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Help Section */}
                <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p>Need help? Contact our support team</p>
                </div>
            </div>
        </div>
    );
}