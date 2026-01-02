import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import apexLogo from '@/assets/apex-logo.png';
import loginBg from '@/assets/login-bg.png';
import { Lock, Eye, EyeOff, CheckCircle, KeyRound } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Listen for auth state changes (recovery link click)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsValidSession(true);
          setIsCheckingSession(false);
        } else if (session) {
          setIsValidSession(true);
          setIsCheckingSession(false);
        }
      });

      // If already in a session, allow password reset
      if (session) {
        setIsValidSession(true);
      }
      
      setIsCheckingSession(false);

      return () => subscription.unsubscribe();
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate password
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setError(passwordResult.error.errors[0].message);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError(error.message);
      } else {
        setIsSuccess(true);
        // Sign out and redirect to login after 3 seconds
        setTimeout(async () => {
          await supabase.auth.signOut();
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isValidSession && !isCheckingSession) {
    return (
      <div className="min-h-screen flex relative overflow-hidden bg-background">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${loginBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
        
        <div className="relative z-10 flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg text-center">
            <div className="bg-card/80 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl p-8">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Invalid or Expired Link</h2>
              <p className="text-muted-foreground text-sm mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Button onClick={() => navigate('/forgot-password')} className="rounded-xl">
                Request New Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      
      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden mb-5 shadow-2xl border-2 border-primary/30 ring-4 ring-primary/10">
              <img src={apexLogo} alt="Apex Towing & Recovery" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Apex Towing & Recovery
            </h1>
            <p className="text-muted-foreground mt-1">Operations Portal</p>
          </div>

          {/* Main Card */}
          <div className="bg-card/80 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/30">
              <h2 className="text-xl font-semibold text-foreground">Set New Password</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isSuccess ? 'Your password has been updated' : 'Enter your new password below'}
              </p>
            </div>

            {/* Form Section */}
            <div className="p-6">
              {isSuccess ? (
                <div className="text-center py-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Password Updated!</h3>
                  <p className="text-muted-foreground text-sm">
                    Your password has been successfully changed. Redirecting to login...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 pr-11 h-12 bg-secondary/30 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      At least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-11 pr-11 h-12 bg-secondary/30 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3 animate-fade-in">
                      <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5" />
                        Update Password
                      </div>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
