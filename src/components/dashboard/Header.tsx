import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user } = useAuth();

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="h-16 bg-card/50 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reports, units, or employees..."
            className="pl-10 bg-input/50"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
        </Button>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </Button>

        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{currentTime}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role} Access</p>
        </div>

        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <span className="text-primary font-semibold text-sm">{user?.name?.charAt(0) || 'U'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
