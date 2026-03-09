import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
    Mail,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Shield
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

export default function VerifyOTP() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    useEffect(() => {
        // Countdown timer for resend
        let timer: NodeJS.Timeout;
        if (countdown > 0 && !canResend) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [countdown, canResend]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const pastedOtp = value.slice(0, 6).split('');
            const newOtp = [...otp];
            pastedOtp.forEach((char, i) => {
                if (i < 6) newOtp[i] = char;
            });
            setOtp(newOtp);

            // Focus last input or next empty
            const lastFilledIndex = newOtp.findLastIndex(char => char !== '');
            if (lastFilledIndex < 5) {
                inputRefs.current[lastFilledIndex + 1]?.focus();
            } else {
                inputRefs.current[5]?.focus();
            }
        } else {
            // Handle single digit
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Move to next input if value is entered
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        if (!email) {
            setError('Email is missing. Please go back and try again.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/otp/verify-otp', {
                email,
                otpCode
            });

            if (response.data.success) {
                setVerificationSuccess(true);
                toast.success('OTP verified successfully!');

                // Redirect to reset password page
                setTimeout(() => {
                    navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${otpCode}`);
                }, 1500);
            }
        } catch (error: any) {
            console.error('OTP verification error:', error);
            setError(error.response?.data?.message || 'Invalid or expired OTP code');
            toast.error('Verification failed');

            // Clear OTP inputs on error
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email) {
            setError('Email is missing. Please go back and try again.');
            return;
        }

        setIsResending(true);
        setError(null);

        try {
            const response = await api.post('/otp/resend-otp', { email });

            if (response.data.success) {
                toast.success('New OTP sent successfully!');
                setCountdown(60);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error: any) {
            console.error('Resend OTP error:', error);
            setError(error.response?.data?.message || 'Failed to resend OTP');
            toast.error('Failed to resend OTP');
        } finally {
            setIsResending(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-2 shadow-xl">
                    <CardContent className="pt-6">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                No email provided. Please go back and try again.
                            </AlertDescription>
                        </Alert>
                        <Button asChild className="w-full mt-4">
                            <Link to="/forgot-password">Back to Forgot Password</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (verificationSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-2 shadow-xl">
                    <CardContent className="pt-6 text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">OTP Verified Successfully!</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Redirecting to reset your password...
                        </p>
                        <div className="flex justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
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
                    <Link to="/forgot-password">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Link>
                </Button>

                <Card className="border-2 shadow-xl">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                        <CardDescription>
                            We've sent a 6-digit verification code to<br />
                            <span className="font-medium text-foreground">{email}</span>
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-6">
                            {/* OTP Input */}
                            <div className="space-y-2">
                                <Label>Enter Verification Code</Label>
                                <div className="flex gap-2 justify-between">
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="\d*"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-12 h-12 text-center text-lg font-semibold"
                                            disabled={isLoading}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Enter the 6-digit code sent to your email
                                </p>
                            </div>

                            {/* Verify Button */}
                            <Button
                                onClick={handleVerify}
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white"
                                disabled={isLoading || otp.join('').length !== 6}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Code'
                                )}
                            </Button>

                            {/* Resend Option */}
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Didn't receive the code?{' '}
                                    {canResend ? (
                                        <Button
                                            variant="link"
                                            onClick={handleResendOTP}
                                            disabled={isResending}
                                            className="p-0 h-auto font-semibold"
                                        >
                                            {isResending ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                    Resending...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="w-3 h-3 mr-1" />
                                                    Resend OTP
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <span className="text-primary font-semibold">
                                            Resend in {countdown}s
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Email Display */}
                            <div className="bg-muted p-3 rounded-lg">
                                <p className="text-xs text-center text-muted-foreground">
                                    Having trouble? Check your spam folder or{' '}
                                    <Button variant="link" className="p-0 h-auto text-xs">
                                        contact support
                                    </Button>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}