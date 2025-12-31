import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import towLogo from '@/assets/tow-logo.png';
import { Truck, Shield, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password, selectedRole);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-card/80 backdrop-blur-xl border border-primary/30 mb-6 animate-pulse-glow">
            <img src={towLogo} alt="TowPro Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">TowPro Services</h1>
          <p className="text-muted-foreground">Operations Portal</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-xl p-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Personnel Login</h2>
          <p className="text-muted-foreground text-sm mb-6">Enter your credentials to access the portal.</p>

          {/* Role Selection */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole('employee')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                selectedRole === 'employee'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/50 bg-input hover:border-border text-muted-foreground'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Employee</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                selectedRole === 'admin'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/50 bg-input hover:border-border text-muted-foreground'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Admin</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                placeholder="you@towpro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Remember me
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-6 flex justify-center gap-6">
          <div className="glass-card rounded-lg px-6 py-4 text-center">
            <p className="text-sm font-medium text-foreground mb-1">Need Help?</p>
            <a href="#" className="text-sm text-primary hover:underline">Contact Support</a>
          </div>
          <div className="glass-card rounded-lg px-6 py-4 text-center">
            <p className="text-sm font-medium text-foreground mb-1">New Employee?</p>
            <a href="#" className="text-sm text-primary hover:underline">Request Access</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
