import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import apexLogo from '@/assets/apex-logo.png';
import loginBg from '@/assets/login-bg.png';
import { ArrowLeft, MessageCircle } from 'lucide-react';

const ForgotPassword = () => {
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
              <h2 className="text-xl font-semibold text-foreground">Reset Password</h2>
              <p className="text-sm text-muted-foreground mt-1">Contact us to recover your account</p>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Need Help?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Please contact me on Discord and I will get back to you within a few minutes with your credentials.
                </p>
                <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Discord Username</p>
                  <p className="text-xl font-bold text-primary">@iamvraith</p>
                </div>
                <Link to="/login">
                  <Button variant="outline" className="rounded-xl w-full h-12">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
